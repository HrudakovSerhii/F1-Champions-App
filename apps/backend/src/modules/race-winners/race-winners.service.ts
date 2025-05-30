import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { CacheService } from '../../shared/cache/cache.service';
import { JolpicaF1Service } from '../../shared/external-apis/jolpica-f1.service';

@Injectable()
export class RaceWinnersService {
  private readonly logger = new Logger(RaceWinnersService.name);
  private isInitialLoad = true;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly jolpicaF1Service: JolpicaF1Service
  ) {}

  async getRaceWinners(season: string, limit?: number, offset?: number) {
    const cacheKey = `race-winners:${season}:${limit}:${offset}`;

    try {
      // Try to get from cache first
      const cachedData = await this.cache.get(cacheKey);
      if (cachedData && !this.isInitialLoad) {
        this.logger.debug(
          `Returning cached race winners data for season ${season}`
        );
        return cachedData;
      }

      // If initial load or no cache, fetch from external API
      if (this.isInitialLoad) {
        this.logger.log(
          `Initial load detected, fetching race winners for season ${season} from external API`
        );
        const externalData = await this.jolpicaF1Service.getRaceWinners(
          season,
          limit,
          offset
        );

        if (externalData) {
          // Cache the data
          await this.cache.set(cacheKey, externalData, 604800); // 1 week

          // Store in database
          await this.storeRaceWinnersData(externalData);

          this.isInitialLoad = false;
          return externalData;
        }
      }

      // Fallback to database
      this.logger.log(
        `Fetching race winners for season ${season} from database`
      );
      const dbData = await this.getRaceWinnersFromDatabase(
        season,
        limit,
        offset
      );

      // Cache database result
      await this.cache.set(cacheKey, dbData, 604800);

      return dbData;
    } catch (error) {
      this.logger.error(
        `Error fetching race winners for season ${season}:`,
        error
      );

      // Final fallback to database
      try {
        return await this.getRaceWinnersFromDatabase(season, limit, offset);
      } catch (dbError) {
        this.logger.error('Database fallback failed:', dbError);
        throw new Error(
          `Unable to fetch race winners data for season ${season}`
        );
      }
    }
  }

  private async storeRaceWinnersData(data: any): Promise<void> {
    try {
      const races = data.MRData?.RaceTable?.Races || [];

      for (const race of races) {
        // Upsert circuit
        const circuit = await this.prisma.circuit.upsert({
          where: { circuitId: race.Circuit.circuitId },
          update: {
            circuitName: race.Circuit.circuitName,
            url: race.Circuit.url,
          },
          create: {
            circuitId: race.Circuit.circuitId,
            circuitName: race.Circuit.circuitName,
            url: race.Circuit.url,
          },
        });

        // Upsert driver
        const driver = await this.prisma.driver.upsert({
          where: { driverId: race.Winner.Driver.driverId },
          update: {
            givenName: race.Winner.Driver.givenName,
            familyName: race.Winner.Driver.familyName,
            dateOfBirth: new Date(race.Winner.Driver.dateOfBirth),
            nationality: race.Winner.Driver.nationality,
            url: race.Winner.Driver.url,
          },
          create: {
            driverId: race.Winner.Driver.driverId,
            givenName: race.Winner.Driver.givenName,
            familyName: race.Winner.Driver.familyName,
            dateOfBirth: new Date(race.Winner.Driver.dateOfBirth),
            nationality: race.Winner.Driver.nationality,
            url: race.Winner.Driver.url,
          },
        });

        // Upsert constructor
        const constructor = await this.prisma.constructor.upsert({
          where: { constructorId: race.Winner.Constructor.constructorId },
          update: {
            name: race.Winner.Constructor.name,
            nationality: race.Winner.Constructor.nationality,
            url: race.Winner.Constructor.url,
          },
          create: {
            constructorId: race.Winner.Constructor.constructorId,
            name: race.Winner.Constructor.name,
            nationality: race.Winner.Constructor.nationality,
            url: race.Winner.Constructor.url,
          },
        });

        // Upsert race winner
        await this.prisma.raceWinner.upsert({
          where: {
            season_round: {
              season: race.season,
              round: race.round,
            },
          },
          update: {
            raceName: race.raceName,
            date: new Date(race.date),
            time: race.time,
            url: race.url,
            winnerDetails: {
              number: race.Winner.number,
              position: race.Winner.position,
              points: race.Winner.points,
              laps: race.Winner.laps,
              time: {
                millis: race.Winner.Time.millis,
                time: race.Winner.Time.time,
              },
            },
            circuitId: circuit.id,
            driverId: driver.id,
            constructorId: constructor.id,
          },
          create: {
            season: race.season,
            round: race.round,
            raceName: race.raceName,
            date: new Date(race.date),
            time: race.time,
            url: race.url,
            winnerDetails: {
              number: race.Winner.number,
              position: race.Winner.position,
              points: race.Winner.points,
              laps: race.Winner.laps,
              time: {
                millis: race.Winner.Time.millis,
                time: race.Winner.Time.time,
              },
            },
            circuitId: circuit.id,
            driverId: driver.id,
            constructorId: constructor.id,
          },
        });
      }

      this.logger.log('Successfully stored race winners data in database');
    } catch (error) {
      this.logger.error('Error storing race winners data:', error);
    }
  }

  private async getRaceWinnersFromDatabase(
    season: string,
    limit?: number,
    offset?: number
  ) {
    const raceWinners = await this.prisma.raceWinner.findMany({
      where: { season },
      include: {
        circuit: true,
        driver: true,
        constructor: true,
      },
      orderBy: { round: 'asc' },
      take: limit,
      skip: offset,
    });

    const total = await this.prisma.raceWinner.count({ where: { season } });

    // Transform to match API response format
    return {
      MRData: {
        limit: limit?.toString() || '30',
        offset: offset?.toString() || '0',
        series: 'f1',
        total: total.toString(),
        url: '',
        xmlns: '',
        RaceTable: {
          season,
          Races: raceWinners.map((race) => ({
            season: race.season,
            round: race.round,
            raceName: race.raceName,
            date: race.date.toISOString().split('T')[0],
            time: race.time,
            url: race.url,
            Circuit: {
              circuitId: race.circuit.circuitId,
              circuitName: race.circuit.circuitName,
              url: race.circuit.url,
            },
            Winner: {
              number: race.winnerDetails.number,
              position: race.winnerDetails.position,
              points: race.winnerDetails.points,
              laps: race.winnerDetails.laps,
              Driver: {
                driverId: race.driver.driverId,
                givenName: race.driver.givenName,
                familyName: race.driver.familyName,
                dateOfBirth: race.driver.dateOfBirth
                  .toISOString()
                  .split('T')[0],
                nationality: race.driver.nationality,
                url: race.driver.url,
              },
              Constructor: {
                constructorId: race.constructor.constructorId,
                name: race.constructor.name,
                nationality: race.constructor.nationality,
                url: race.constructor.url,
              },
              Time: {
                millis: race.winnerDetails.time.millis,
                time: race.winnerDetails.time.time,
              },
            },
          })),
        },
      },
    };
  }
}
