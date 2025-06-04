import { Injectable, Logger } from '@nestjs/common';

import { JolpicaF1Service } from '../../shared/external-apis/jolpica-f1.service';
import { DatabaseService } from '../../shared/database/database.service';
import {
  DataAggregationService,
  ExternalDataParserService,
} from '../../shared/transformers';

import { GetSeasonsWinnersResponse } from '@f1-app/api-types';

@Injectable()
export class SeasonsWinnersService {
  private readonly logger = new Logger(SeasonsWinnersService.name);
  private isInitialLoad = true;

  constructor(
    private readonly jolpicaF1Service: JolpicaF1Service,
    private readonly externalDataParserService: ExternalDataParserService,
    private readonly databaseService: DatabaseService,
    private readonly dataAggregationService: DataAggregationService
  ) {}

  async getSeasonsWinners(
    limit?: number,
    offset?: number
  ): Promise<GetSeasonsWinnersResponse> {
    try {
      // If initial load or no cache, fetch from external API
      if (this.isInitialLoad) {
        this.logger.log(
          'Initial load detected, fetching seasons winners from external Jolpica API'
        );
        const externalData = await this.jolpicaF1Service.getSeasonsWinners(
          limit,
          offset
        );

        if (externalData) {
          const raceTableBDData =
            this.externalDataParserService.extractDBDataFromJolpiRaceTable(
              externalData
            );

          await this.databaseService.storeDBUniqData(
            raceTableBDData.drivers,
            raceTableBDData.constructors,
            raceTableBDData.circuits,
            raceTableBDData.seasons
          );

          // Set initial load to false after first successful load
          this.isInitialLoad = false;

          // TODO: review this return and check if this.dataAggregationService.getSeasonsWinners can be used outside of condition to return data
          return this.externalDataParserService.extractSeasonsWinnersFromJolpiRaceTable(
            externalData
          );
        }

        throw new Error(
          `No data available for seasons winners from external API`
        );
      }

      // For subsequent calls, try to get from database first
      const seasonsWinners =
        await this.dataAggregationService.getSeasonsWinners({
          limit,
          offset,
        });

      if (seasonsWinners.length > 0) {
        this.logger.debug(`Returning cached seasons winners from database`);

        return seasonsWinners;
      }

      throw new Error(`No data available for seasons`);
    } catch (error) {
      this.logger.error('Error fetching seasons winners:', error);
      throw new Error('Unable to fetch seasons winners data');
    }
  }
}
