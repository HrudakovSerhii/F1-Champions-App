import { Injectable, Logger } from '@nestjs/common';

import { JolpicaF1Service } from '../../shared/external-apis/jolpica-f1.service';
import { DatabaseService } from '../../shared/database/database.service';
import {
  DataAggregationService,
  ExternalDataParserService,
} from '../../shared/transformers';

import { GetSeasonsWinnersResponse } from '@f1-app/api-types';
import { generateYearRangeStrings } from '../../shared/utils';

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
    minYear: number,
    maxYear: number
  ): Promise<GetSeasonsWinnersResponse> {
    try {
      const yearsRange = generateYearRangeStrings(minYear, maxYear);
      // TODO: add check in DB for records from provided years range. If missing, we need to fetch them from Jolpi API and save to DB
      this.logger.warn(this.isInitialLoad);
      const hasDataForThisRange =
        await this.databaseService.checkExistingSeasonsWinnersData(yearsRange);

      if (this.isInitialLoad && !hasDataForThisRange) {
        this.logger.log(
          'Initial load detected, fetching seasons winners from external Jolpica API'
        );

        const externalData = await this.jolpicaF1Service.getSeasonsWinners(
          yearsRange
        );

        if (externalData) {
          const standingsTables =
            this.externalDataParserService.extractStandingsTables(externalData);

          // Flatten standings lists using utility function
          const standingsLists =
            this.externalDataParserService.flattenStandingsLists(
              standingsTables
            );

          const raceTableBDData =
            this.externalDataParserService.extractDBDataFromJolpiDriversStandingList(
              standingsLists
            );

          await this.databaseService.storeDBUniqData(
            raceTableBDData.drivers,
            raceTableBDData.constructors
          );

          await this.databaseService.storeSeasonsWinnersWithDuplicateCheck(
            yearsRange,
            raceTableBDData.seasonWinners
          );

          // Set initial load to false after first successful load
          this.isInitialLoad = false;

          // TODO: review this return and check if this.dataAggregationService.getSeasonsWinners can be used outside of condition to return data
          return this.externalDataParserService.extractSeasonsWinnersFromJolpiStandingsLists(
            standingsLists
          );
        }

        throw new Error(
          `No data available for seasons winners from external API`
        );
      }

      // For subsequent calls, try to get from database first
      const seasonsWinners =
        await this.dataAggregationService.getSeasonsWinners(yearsRange, {
          orderBy: 'season',
          orderDirection: 'desc',
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
