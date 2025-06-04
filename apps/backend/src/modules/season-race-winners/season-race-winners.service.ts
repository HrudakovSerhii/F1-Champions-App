import { Injectable, Logger } from '@nestjs/common';

import { JolpicaF1Service } from '../../shared/external-apis/jolpica-f1.service';
import { DatabaseService } from '../../shared/database/database.service';
import {
  DataAggregationService,
  ExternalDataParserService,
} from '../../shared/transformers';

import { GetSeasonRaceWinnersResponse } from '@f1-app/api-types';

@Injectable()
export class SeasonRaceWinnersService {
  private readonly logger = new Logger(SeasonRaceWinnersService.name);
  private isInitialLoad = true;

  constructor(
    private readonly jolpicaF1Service: JolpicaF1Service,
    private readonly externalDataParserService: ExternalDataParserService,
    private readonly databaseService: DatabaseService,
    private readonly dataAggregationService: DataAggregationService
  ) {}

  async getSeasonRaceWinners(
    season: string,
    limit?: number,
    offset?: number
  ): Promise<GetSeasonRaceWinnersResponse> {
    try {
      // Check if this is initial load
      if (this.isInitialLoad) {
        this.logger.log(
          `Initial load: fetching race winners for season ${season} from Jolpica API`
        );

        // Call jolpicaF1Service to get race winners
        const externalData = await this.jolpicaF1Service.getSeasonRaceWinners(
          season,
          limit,
          offset
        );

        if (externalData) {
          // Transform using transformRacesToSeasonRaceWinners
          const driversStandingsBDData =
            this.externalDataParserService.extractDBDataFromJolpiDriversStandings(
              externalData
            );

          await this.databaseService.storeDBUniqData(
            driversStandingsBDData.drivers,
            driversStandingsBDData.constructors,
            driversStandingsBDData.circuits,
            driversStandingsBDData.seasons
          );

          await this.databaseService.storeSeasonRaceWinnersWithDuplicateCheck(
            season,
            driversStandingsBDData.seasonRaceWinners
          );

          // Set initial load to false after first successful load
          this.isInitialLoad = false;

          return this.externalDataParserService.extractSeasonRaceWinnersFromJolpiDriversStandings(
            externalData
          );
        }

        throw new Error(
          `No data available for season ${season} from external API`
        );
      }

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
