import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { CacheService } from '../../shared/cache/cache.service';
import { JolpicaF1Service } from '../../shared/external-apis/jolpica-f1.service';

@Injectable()
export class ChampionsService {
  private readonly logger = new Logger(ChampionsService.name);
  private isInitialLoad = true;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly jolpicaF1Service: JolpicaF1Service
  ) {}

  async getChampions(limit?: number, offset?: number, season?: string) {
    const cacheKey = `champions:${season || 'all'}:${limit}:${offset}`;

    try {
      // Try to get from cache first
      const cachedData = await this.cache.get(cacheKey);
      if (cachedData && !this.isInitialLoad) {
        this.logger.debug('Returning cached champions data');
        return cachedData;
      }

      // If initial load or no cache, fetch from external API
      if (this.isInitialLoad) {
        this.logger.log('Initial load detected, fetching from external API');
        const externalData = await this.jolpicaF1Service.getSeasonChampions(
          limit,
          offset,
          season
        );

        if (externalData) {
          // Cache the data
          await this.cache.set(cacheKey, externalData, 604800); // 1 week

          // Store in database
          await this.storeChampionsData(externalData);

          this.isInitialLoad = false;
          return externalData;
        }
      }

      // Fallback to database
      this.logger.log('Fetching champions from database');
      const dbData = await this.getChampionsFromDatabase(limit, offset, season);

      // Cache database result
      await this.cache.set(cacheKey, dbData, 604800);

      return dbData;
    } catch (error) {
      this.logger.error('Error fetching champions:', error);

      // Final fallback to database
      try {
        return await this.getChampionsFromDatabase(limit, offset, season);
      } catch (dbError) {
        this.logger.error('Database fallback failed:', dbError);
        throw new Error('Unable to fetch champions data');
      }
    }
  }

  private async storeChampionsData(data: any): Promise<void> {
    try {
      const standingsLists = data.MRData?.StandingsTable?.StandingsLists || [];

      for (const standingsList of standingsLists) {
        const { season, DriverStandings } = standingsList;

        for (const standing of DriverStandings) {
          // Upsert driver
          const driver = await this.prisma.driver.upsert({
            where: { driverId: standing.Driver.driverId },
            update: {
              givenName: standing.Driver.givenName,
              familyName: standing.Driver.familyName,
              dateOfBirth: new Date(standing.Driver.dateOfBirth),
              nationality: standing.Driver.nationality,
              url: standing.Driver.url,
            },
            create: {
              driverId: standing.Driver.driverId,
              givenName: standing.Driver.givenName,
              familyName: standing.Driver.familyName,
              dateOfBirth: new Date(standing.Driver.dateOfBirth),
              nationality: standing.Driver.nationality,
              url: standing.Driver.url,
            },
          });

          // Upsert constructor (using first constructor)
          const constructorData = standing.Constructors[0];
          const constructor = await this.prisma.constructor.upsert({
            where: { constructorId: constructorData.constructorId },
            update: {
              name: constructorData.name,
              nationality: constructorData.nationality,
              url: constructorData.url,
            },
            create: {
              constructorId: constructorData.constructorId,
              name: constructorData.name,
              nationality: constructorData.nationality,
              url: constructorData.url,
            },
          });

          // Upsert season champion
          await this.prisma.seasonChampion.upsert({
            where: {
              season_driverId: {
                season,
                driverId: driver.id,
              },
            },
            update: {
              position: standing.position,
              positionText: standing.positionText,
              points: standing.points,
              wins: standing.wins,
              round: standingsList.round,
              constructorId: constructor.id,
            },
            create: {
              season,
              position: standing.position,
              positionText: standing.positionText,
              points: standing.points,
              wins: standing.wins,
              round: standingsList.round,
              driverId: driver.id,
              constructorId: constructor.id,
            },
          });
        }
      }

      this.logger.log('Successfully stored champions data in database');
    } catch (error) {
      this.logger.error('Error storing champions data:', error);
    }
  }

  private async getChampionsFromDatabase(
    limit?: number,
    offset?: number,
    season?: string
  ) {
    const where = season ? { season } : {};

    const champions = await this.prisma.seasonChampion.findMany({
      where,
      include: {
        driver: true,
        constructor: true,
      },
      orderBy: { season: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await this.prisma.seasonChampion.count({ where });

    // Transform to match API response format
    return {
      MRData: {
        limit: limit?.toString() || '30',
        offset: offset?.toString() || '0',
        series: 'f1',
        total: total.toString(),
        url: '',
        xmlns: '',
        StandingsTable: {
          season,
          StandingsLists: champions.map((champion) => ({
            season: champion.season,
            round: champion.round,
            DriverStandings: [
              {
                position: champion.position,
                positionText: champion.positionText,
                points: champion.points,
                wins: champion.wins,
                Driver: {
                  driverId: champion.driver.driverId,
                  givenName: champion.driver.givenName,
                  familyName: champion.driver.familyName,
                  dateOfBirth: champion.driver.dateOfBirth
                    .toISOString()
                    .split('T')[0],
                  nationality: champion.driver.nationality,
                  url: champion.driver.url,
                },
                Constructors: [
                  {
                    constructorId: champion.constructor.constructorId,
                    name: champion.constructor.name,
                    nationality: champion.constructor.nationality,
                    url: champion.constructor.url,
                  },
                ],
              },
            ],
          })),
        },
      },
    };
  }
}
