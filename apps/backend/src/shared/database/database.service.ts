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
   * Check if SeasonsWinners data already exists to avoid duplicates
   */
  async checkExistingSeasonsWinnersData(
    yearsRange: string[]
  ): Promise<boolean> {
    try {
      this.logger.debug(
        `Checking if seasons data exists for: ${yearsRange} seasons`
      );

      const existingWinners = await this.prisma.seasonWinner.findMany({
        where: {
          season: {
            in: yearsRange,
          },
        },
      });

      const hasData = existingWinners.length > 0;

      if (hasData) {
        this.logger.debug(
          `seasonsWinner already contain data for seasons range: ${yearsRange}`
        );
      }

      return hasData;
    } catch (error) {
      this.logger.error(
        `Error checking seasons data for ${yearsRange} seasons range:`,
        error
      );

      throw new Error(
        `Failed to check seasons data for ${yearsRange} seasons range`
      );
    }
  }

  /**
   * Check if SeasonRaceWinners data for provided season already exists to avoid duplicates
   */
  private async checkExistingSeasonRaceWinnersData(
    yearsRange: string[]
  ): Promise<boolean> {
    const existingSeasonRaceWinners =
      await this.prisma.seasonRaceWinner.findMany({
        where: {
          season: {
            in: yearsRange,
          },
        },
      });

    return existingSeasonRaceWinners.length > 0;
  }

  private async storeSeasonsWinners(seasonsWinners: SeasonWinnerCreateInput[]) {
    this.logger.log(`🥇 Storing seasons winners...`);

    await Promise.all(
      seasonsWinners.map((seasonWinner) =>
        this.prisma.seasonWinner.create({
          data: seasonWinner,
        })
      )
    );
  }

  private async storeSeasonRacesWinners(
    yearsRange: string[],
    seasonRaceWinners: SeasonRaceWinnerCreateInput[]
  ) {
    this.logger.log(`🥇 Storing seasons ${yearsRange} race winners...`);

    await Promise.all(
      seasonRaceWinners.map((seasonRaceWinner) =>
        this.prisma.seasonRaceWinner.create({
          data: seasonRaceWiner,
        })
      )
    );
  }

  /**
   * Store database uniq data
   */
  async storeDBUniqData(
    drivers: DriverCreateInput[],
    constructors: ConstructorCreateInput[]
  ) {
    this.logger.log('👨‍🏎️ Storing drivers...');
    await Promise.all(
      drivers.map((driver) =>
        this.prisma.driver.create({
          data: driver,
        })
      )
    );

    this.logger.log('👨‍⚒️ Storing constructors...');
    await Promise.all(
      constructors.map((constructor) =>
        this.prisma.constructor.create({
          data: constructor,
        })
      )
    );
  }

  async storeSeasonsWinnersWithDuplicateCheck(
    yearsRange: string[],
    seasonsWinners: SeasonWinnerCreateInput[]
  ): Promise<void> {
    if (seasonsWinners.length === 0) {
      this.logger.warn('No seasons winners to store');

      return;
    }

    const dataExists = await this.checkExistingSeasonsWinnersData(yearsRange);

    if (dataExists) {
      this.logger.log(
        `Winners data for provided seasons already exists, skipping storage`
      );

      return;
    }

    await this.storeSeasonsWinners(seasonsWinners);
  }

  /**
   * Store race winners data with duplicate checking
   * This is the main method to be used by the race-winners service
   */
  async storeSeasonRaceWinnersWithDuplicateCheck(
    yearsRange: string[],
    seasonRaceWinners: SeasonRaceWinnerCreateInput[]
  ): Promise<void> {
    if (seasonRaceWinners.length === 0) {
      this.logger.warn('No seasonRaceWinners to store');

      return;
    }

    // Check if data already exists
    const dataExists = await this.checkExistingSeasonRaceWinnersData(
      yearsRange
    );

    if (dataExists) {
      this.logger.log(
        `Data for seasons ${yearsRange} range already exists, skipping storage`
      );

      return;
    }

    await this.storeSeasonRacesWinners(yearsRange, seasonRaceWinners);
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
        `Error fetching race winners from database for season ${season}:`,
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
      this.logger.error(`Error fetching seasons winners from database:`, error);

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
