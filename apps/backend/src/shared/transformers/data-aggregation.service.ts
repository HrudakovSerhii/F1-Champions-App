import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ApiAdapterService } from './api-adapter.service';
import { SeasonWinner, SeasonRaceWinner } from '@f1-app/api-types';

@Injectable()
export class DataAggregationService {
  private readonly logger = new Logger(DataAggregationService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly apiAdapterService: ApiAdapterService
  ) {}

  /**
   * Get seasons winners data formatted for API response
   * @param yearsRange - Range of years to get winners data
   * @param options - Optional query parameters
   * @param options.limit - Maximum number of records to return
   * @param options.offset - Number of records to skip
   * @param options.orderBy - Order results by field (default: round)
   * @param options.orderDirection - Order results by field (default: ascending)
   * @returns Promise<SeasonWinner[]> - Array of season winners formatted for API
   */
  async getSeasonsWinners(
    yearsRange: string[],
    options: {
      orderBy?: 'season' | 'wins';
      orderDirection?: 'asc' | 'desc';
    }
  ): Promise<SeasonWinner[]> {
    try {
      // Get raw database data
      const seasonsWinners = await this.databaseService.getSeasonsWinners(
        yearsRange,
        options
      );

      if (seasonsWinners.length === 0) {
        return [];
      }

      // Extract unique IDs for related data
      const driverIds = [
        ...new Set(seasonsWinners.map((seasonWinner) => seasonWinner.driverId)),
      ];

      const constructorIds = [
        ...new Set(
          seasonsWinners.map((seasonWinner) => seasonWinner.constructorId)
        ),
      ];

      // Fetch related data in parallel
      const [drivers, constructors] = await Promise.all([
        this.databaseService.getDriversByDriverIds(driverIds),
        this.databaseService.getConstructorsByByName(constructorIds),
      ]);

      // Transform to API format
      return this.apiAdapterService.transformSeasonsWinnersToApiFormat(
        seasonsWinners,
        drivers,
        constructors
      );
    } catch (error) {
      this.logger.error('Error getting seasons winners:', error);
      return [];
    }
  }

  /**
   * Get season race winners data formatted for API response
   * @param season - The F1 season year (e.g., "2023")
   * @param options - Optional query parameters
   * @param options.limit - Maximum number of records to return
   * @param options.offset - Number of records to skip
   * @param options.orderBy - Order results by field (default: round)
   * @param options.orderDirection - Order results by field (default: ascending)
   * @returns Promise<SeasonRaceWinner[]> - Array of race winners formatted for API
   */
  async getSeasonRacesWinners(
    season: string,
    options: {
      limit?: number;
      offset?: number;
      orderBy?: 'season' | 'wins' | 'round';
      orderDirection?: 'asc' | 'desc';
    }
  ): Promise<SeasonRaceWinner[]> {
    try {
      // Get raw database data
      const seasonRaceWinners =
        await this.databaseService.getSeasonRacesWinners(season, options);

      if (seasonRaceWinners.length === 0) {
        return [];
      }

      // Extract unique IDs for related data
      const driverIds = [
        ...new Set(seasonRaceWinners.map((raceWinner) => raceWinner.driverId)),
      ];

      const constructorIds = [
        ...new Set(
          seasonRaceWinners.map((raceWinner) => raceWinner.constructorId)
        ),
      ];

      // Fetch related data in parallel
      const [drivers, constructors] = await Promise.all([
        this.databaseService.getDriversByDriverIds(driverIds),
        this.databaseService.getConstructorsByByName(constructorIds),
      ]);

      // Transform to API format
      return this.apiAdapterService.transformSeasonRaceWinnersToApiFormat(
        seasonRaceWinners,
        drivers,
        constructors
      );
    } catch (error) {
      this.logger.error(
        `Error getting season race winners for ${season}:`,
        error
      );
      return [];
    }
  }
}
