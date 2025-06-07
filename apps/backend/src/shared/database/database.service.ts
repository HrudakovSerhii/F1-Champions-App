import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

import {
  ConstructorCreateInput,
  DBConstructor,
  DBDriver,
  DBSeasonRaceWinner,
  DBSeasonWinner,
  DriverCreateInput,
  SeasonRaceWinnerCreateInput,
  SeasonWinnerCreateInput,
} from '../../types';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get missing seasons from the database for the given year range
   * @param yearsRange - Array of years to check
   * @returns Promise<string[]> - Array of years that are missing from the database
   */
  async getMissingSeasonsWinners(yearsRange: string[]): Promise<string[]> {
    try {
      const existingWinners = await this.prisma.seasonWinner.findMany({
        where: {
          season: {
            in: yearsRange,
          },
        },
        select: {
          season: true,
        },
      });

      const existingSeasons = existingWinners.map((winner) => winner.season);
      const missingSeasons = yearsRange.filter(
        (year) => !existingSeasons.includes(year)
      );

      return missingSeasons;
    } catch (error) {
      this.logger.error('Failed to check missing seasons:', error);
      throw new Error('Failed to check missing seasons');
    }
  }

  /**
   * Get missing seasons for race winners from the database for the given year range
   * @param yearsRange - Array of years to check
   * @returns Promise<string[]> - Array of years that are missing race winner data
   */
  async getMissingSeasonsForRaceWinners(
    yearsRange: string[]
  ): Promise<string[]> {
    try {
      const existingRaceWinners = await this.prisma.seasonRaceWinner.findMany({
        where: {
          season: {
            in: yearsRange,
          },
        },
        select: {
          season: true,
        },
      });

      const existingSeasons = [
        ...new Set(existingRaceWinners.map((winner) => winner.season)),
      ];
      const missingSeasons = yearsRange.filter(
        (year) => !existingSeasons.includes(year)
      );

      return missingSeasons;
    } catch (error) {
      this.logger.error('Failed to check missing race winner seasons:', error);
      throw new Error('Failed to check missing race winner seasons');
    }
  }

  /**
   * Store seasons winners using upsert (create or update if exists)
   * Handles duplicates gracefully without throwing constraint errors
   */
  async storeSeasonsWinners(
    seasonsWinners: SeasonWinnerCreateInput[]
  ): Promise<void> {
    if (seasonsWinners.length === 0) return;

    this.logger.log(`🥇 Upsert ${seasonsWinners.length} season winners`);

    await Promise.all(
      seasonsWinners.map((seasonWinner) =>
        this.prisma.seasonWinner.upsert({
          where: {
            season_driverId_constructorId: {
              season: seasonWinner.season,
              driverId: seasonWinner.driverId,
              constructorId: seasonWinner.constructorId,
            },
          },
          update: {
            wins: seasonWinner.wins,
            updatedAt: new Date(),
          },
          create: {
            season: seasonWinner.season,
            wins: seasonWinner.wins,
            driverId: seasonWinner.driverId,
            constructorId: seasonWinner.constructorId
          },
        })
      )
    );
  }

  /**
   * Store season race winners using upsert (create or update if exists)
   * Handles duplicates gracefully without throwing constraint errors
   */
  async storeSeasonRacesWinners(
    yearsRange: string[],
    seasonRaceWinners: SeasonRaceWinnerCreateInput[]
  ): Promise<void> {
    if (seasonRaceWinners.length === 0) return;

    this.logger.log(`🏁 Upserting ${seasonRaceWinners.length} race winners`);

    await Promise.all(
      seasonRaceWinners.map((seasonRaceWinner) =>
        this.prisma.seasonRaceWinner.upsert({
          where: {
            season_round_driverId_constructorId: {
              round: seasonRaceWinner.round,
              season: seasonRaceWinner.season,
              driverId: seasonRaceWinner.driverId,
              constructorId: seasonRaceWinner.constructorId,
            },
          },
          update: {
            points: seasonRaceWinner.points,
            round: seasonRaceWinner.round,
            wins: seasonRaceWinner.wins,
            updatedAt: new Date(),
          },
          create: {
            season: seasonRaceWinner.season,
            points: seasonRaceWinner.points,
            round: seasonRaceWinner.round,
            wins: seasonRaceWinner.wins,
            driverId: seasonRaceWinner.driverId,
            constructorId: seasonRaceWinner.constructorId
          },
        })
      )
    );
  }

  /**
   * Store drivers using upsert (create or update if exists)
   * Handles duplicates gracefully without throwing constraint errors
   */
  async storeDrivers(drivers: DriverCreateInput[]): Promise<void> {
    if (drivers.length === 0) return;

    this.logger.log(`👨‍🏎️ Upserting ${drivers.length} drivers`);

    await Promise.all(
      drivers.map((driver) =>
        this.prisma.driver.upsert({
          where: { driverId: driver.driverId },
          update: {
            givenName: driver.givenName,
            familyName: driver.familyName,
            nationality: driver.nationality,
            url: driver.url,
            updatedAt: new Date(),
          },
          create: {
            driverId: driver.driverId,
            givenName: driver.givenName,
            familyName: driver.familyName,
            nationality: driver.nationality,
            url: driver.url
          },
        })
      )
    );
  }

  /**
   * Store constructors using upsert (create or update if exists)
   * Handles duplicates gracefully without throwing constraint errors
   */
  async storeConstructors(
    constructors: ConstructorCreateInput[]
  ): Promise<void> {
    if (constructors.length === 0) return;

    this.logger.log(`🏗️ Upserting ${constructors.length} constructors`);

    await Promise.all(
      constructors.map((constructor) =>
        this.prisma.constructor.upsert({
          where: { name: constructor.name },
          update: {
            nationality: constructor.nationality,
            url: constructor.url,
            updatedAt: new Date(),
          },
          create: {
            name: constructor.name,
            nationality: constructor.nationality,
            url: constructor.url
          },
        })
      )
    );
  }

  /**
   * Get season race winners data from database
   * @param season - The F1 season year (e.g., "2023")
   * @param options - Optional query parameters
   * @param options.limit - Maximum number of records to return
   * @param options.offset - Number of records to skip
   * @param options.orderBy - Order results by field (default: round)
   * @param options.orderDirection - Order results by field (default: ascending)
   * @returns Promise<DBSeasonRaceWinner[]> - Array of raw race winners from database
   */
  async getSeasonRacesWinners(
    season: string,
    options: {
      limit?: number;
      offset?: number;
      orderBy?: 'season' | 'wins' | 'round';
      orderDirection?: 'asc' | 'desc';
    }
  ): Promise<DBSeasonRaceWinner[]> {
    try {
      return await this.prisma.seasonRaceWinner.findMany({
        where: { season },
        orderBy: {
          [options.orderBy || 'season']: options.orderDirection || 'asc',
        },
        take: options.limit,
        skip: options.offset,
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch race winners for season ${season}:`,
        error
      );
      return [];
    }
  }

  /**
   * Get seasons winners data from database
   * @param yearsRange - Array of seasons to filter by
   * @param options - Optional query parameters
   * @param options.orderBy - Order results by field (default: round)
   * @param options.orderDirection - Order results by field (default: ascending)
   * @param options.limit - Maximum number of records to return
   * @param options.offset - Number of records to skip
   * @returns Promise<DBSeasonWinner[]> - Array of raw season winners from database
   */
  async getSeasonsWinners(
    yearsRange: string[],
    options: {
      orderBy?: 'season' | 'wins';
      orderDirection?: 'asc' | 'desc';
      limit?: number;
      offset?: number;
    }
  ): Promise<DBSeasonWinner[]> {
    try {
      return await this.prisma.seasonWinner.findMany({
        where: {
          season: {
            in: yearsRange,
          },
        },
        orderBy: {
          [options.orderBy || 'season']: options.orderDirection || 'asc',
        },
        take: options.limit,
        skip: options.offset,
      });
    } catch (error) {
      this.logger.error('Failed to fetch seasons winners:', error);
      return [];
    }
  }

  /**
   * Get drivers by their driver IDs
   * @param driverIds - Array of driver IDs to fetch
   * @returns Promise with array of drivers
   */
  async getDriversByDriverIds(driverIds: string[]): Promise<DBDriver[]> {
    if (driverIds.length === 0) {
      return [];
    }

    return this.prisma.driver.findMany({
      where: { driverId: { in: driverIds } },
    });
  }

  /**
   * Get constructors by their names
   * @param constructorNames - Array of constructor names to fetch
   * @returns Promise with array of constructors
   */
  async getConstructorsByByName(
    constructorNames: string[]
  ): Promise<DBConstructor[]> {
    if (constructorNames.length === 0) {
      return [];
    }

    return this.prisma.constructor.findMany({
      where: { name: { in: constructorNames } },
    });
  }
}
