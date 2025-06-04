import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

import {
  DBSeasonWinner,
  DBSeasonRaceWinner,
  SeasonWinnerCreateInput,
  SeasonRaceWinnerCreateInput,
  DriverCreateInput,
  ConstructorCreateInput,
  CircuitCreateInput,
  SeasonCreateInput,
  DBDriver,
  DBConstructor,
  DBCircuit,
} from '../../types';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check if SeasonsWinners data already exists to avoid duplicates
   */
  private async checkExistingSeasonsWinnersData(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    seasonsWinners: SeasonWinnerCreateInput[]
  ): Promise<boolean> {
    // TODO: Main: implement logic to search for all seasons winners records in DB before to add new ones.
    //  Maybe this can be postponed until complete implementation is ready.
    //  Validation for existing records might be redundant as records creation happens only once and if succeed should contain all records.
    //  DB update is a next feature.
    // const existingSeasonWinner = await this.prisma.seasonsWinners.findMany({
    //   where: { season: {} },
    // });

    // return !!existingSeasonWinner;
    return false; // TODO: remove after Main is resolved
  }

  /**
   * Check if SeasonRaceWinners data for provided season already exists to avoid duplicates
   */
  private async checkExistingSeasonRaceWinnersData(
    season: string
  ): Promise<boolean> {
    const existingSeasonRaceWinners =
      await this.prisma.seasonRaceWinners.findMany({
        where: { season },
      });

    return existingSeasonRaceWinners.length > 0;
  }

  private async storeSeasonsWinners(seasonsWinners: SeasonWinnerCreateInput[]) {
    this.logger.log(`🥇 Storing seasons winners...`);

    await Promise.all(
      seasonsWinners.map((seasonWinner) =>
        this.prisma.seasonsWinners.create({
          data: seasonWinner,
        })
      )
    );
  }

  private async storeSeasonRacesWinners(
    season: string,
    seasonRaceWinners: SeasonRaceWinnerCreateInput[]
  ) {
    this.logger.log(`🥇 Storing ${season} season race winners...`);

    await Promise.all(
      seasonRaceWinners.map((seasonRaceWinner) =>
        this.prisma.seasonRaceWinners.create({
          data: seasonRaceWinner,
        })
      )
    );
  }

  /**
   * Store database uniq data
   */
  async storeDBUniqData(
    drivers: DriverCreateInput[],
    constructors: ConstructorCreateInput[],
    circuits: CircuitCreateInput[],
    seasons: SeasonCreateInput[]
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

    this.logger.log('🏁 Storing circuits...');
    await Promise.all(
      circuits.map((circuit) =>
        this.prisma.circuit.create({
          data: circuit,
        })
      )
    );

    this.logger.log('📅 Storing seasons...');
    await Promise.all(
      seasons.map((season) =>
        this.prisma.season.create({
          data: season,
        })
      )
    );
  }

  /**
   * Store race winners data with duplicate checking
   * This is the main method to be used by the race-winners service
   */
  async storeSeasonRaceWinnersWithDuplicateCheck(
    season: string,
    seasonRaceWinners: SeasonRaceWinnerCreateInput[]
  ): Promise<void> {
    if (seasonRaceWinners.length === 0) {
      this.logger.warn('No seasonRaceWinners to store');

      return;
    }

    // Check if data already exists
    const dataExists = await this.checkExistingSeasonRaceWinnersData(season);

    if (dataExists) {
      this.logger.log(
        `Data for season ${season} already exists, skipping storage`
      );

      return;
    }

    await this.storeSeasonRacesWinners(season, seasonRaceWinners);
  }

  async storeSeasonsWinnersWithDuplicateCheck(
    seasonsWinners: SeasonWinnerCreateInput[]
  ): Promise<void> {
    if (seasonsWinners.length === 0) {
      this.logger.warn('No seasons winners to store');

      return;
    }

    const dataExists = await this.checkExistingSeasonsWinnersData(
      seasonsWinners
    );

    if (dataExists) {
      this.logger.log(
        `Winners data for provided seasons already exists, skipping storage`
      );

      return;
    }

    await this.storeSeasonsWinners(seasonsWinners);
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
      orderBy?: 'round' | 'date' | 'raceName';
      orderDirection?: 'asc' | 'desc';
    }
  ): Promise<DBSeasonRaceWinner[]> {
    try {
      const seasonRaceWinners: DBSeasonRaceWinner[] =
        await this.prisma.seasonRaceWinners.findMany({
          where: { season },
          orderBy: {
            [options.orderBy || 'round']: options.orderDirection || 'asc',
          },
          take: options.limit,
          skip: options.offset,
        });

      return seasonRaceWinners;
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
   * @param options - Optional query parameters
   * @param options.limit - Maximum number of records to return
   * @param options.offset - Number of records to skip
   * @param options.orderBy - Order results by field (default: round)
   * @param options.orderDirection - Order results by field (default: ascending)
   * @returns Promise<DBSeasonWinner[]> - Array of raw season winners from database
   */
  async getSeasonsWinners(options: {
    limit?: number;
    offset?: number;
    orderBy?: 'round' | 'date' | 'raceName';
    orderDirection?: 'asc' | 'desc';
  }): Promise<DBSeasonWinner[]> {
    try {
      const seasonsWinners: DBSeasonWinner[] =
        await this.prisma.seasonsWinners.findAll({
          orderBy: {
            [options.orderBy || 'round']: options.orderDirection || 'asc',
          },
          take: options.limit,
          skip: options.offset,
        });

      return seasonsWinners;
    } catch (error) {
      this.logger.error(`Error fetching seasons winners from database:`, error);

      return [];
    }
  }

  /**
   * Check if season data exists in database
   * @param season - The F1 season year
   * @returns Promise<boolean> - True if season has any data, false otherwise
   */
  async hasSeasonData(season: string): Promise<boolean> {
    try {
      this.logger.debug(`Checking if season data exists for: ${season}`);

      // TODO: Main. review logic below and refactor it after prisma scheme updated with required structure
      // const [seasonWinnerCount, raceWinnerCount] = await Promise.all([
      //   this.prisma.seasonWinner.count({ where: { season } }),
      //   this.prisma.raceWinner.count({ where: { season } }),
      // ]);
      //
      // const hasData = seasonWinnerCount > 0 || raceWinnerCount > 0;
      const hasData = false; // TODO: used for testing. Change/remove after Main todo is resolved
      this.logger.debug(`Season ${season} has data: ${hasData}`);
      return hasData;
    } catch (error) {
      this.logger.error(`Error checking season data for ${season}:`, error);
      throw new Error(`Failed to check season data for ${season}`);
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

  /**
   * Get circuits by their circuit IDs (names)
   * @param circuitIds - Array of circuit IDs (names) to fetch
   * @returns Promise with array of circuits
   */
  async getCircuitsByCircuitIds(circuitIds: string[]): Promise<DBCircuit[]> {
    if (circuitIds.length === 0) {
      return [];
    }

    return this.prisma.circuit.findMany({
      where: { name: { in: circuitIds } },
    });
  }
}
