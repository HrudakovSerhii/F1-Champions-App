import { Injectable, Logger } from '@nestjs/common';

import { DataAggregationService } from '../../shared/transformers';

import { GetSeasonRaceWinnersResponse } from '@f1-app/api-types';

@Injectable()
export class SeasonRaceWinnersService {
  private readonly logger = new Logger(SeasonRaceWinnersService.name);

  constructor(
    private readonly dataAggregationService: DataAggregationService
  ) {}

  async getSeasonRaceWinners(
    season: string,
    limit?: number,
    offset?: number
  ): Promise<GetSeasonRaceWinnersResponse> {
    try {
      // For subsequent calls, try to get from database first
      const seasonRaceWinners =
        await this.dataAggregationService.getSeasonRacesWinners(season, {
          limit,
          offset,
        });

      if (seasonRaceWinners.length > 0) {
        this.logger.debug(
          `Returning cached race winners from database for season ${season}`
        );

        return seasonRaceWinners;
      }

      throw new Error(`No data available for season ${season}`);
    } catch (error) {
      this.logger.error(
        `Error fetching race winners for season ${season}:`,
        error
      );
      throw new Error(`Unable to fetch race winners data for season ${season}`);
    }
  }
}
