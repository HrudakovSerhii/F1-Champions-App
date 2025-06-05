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

      // Check which season winners are missing from the database
      const missingSeasonWinners =
        await this.databaseService.getMissingSeasonsWinners(yearsRange);
      const missingRaceWinnerSeasons =
        await this.databaseService.getMissingSeasonsForRaceWinners(yearsRange);

      // Combine missing seasons (union of both types)
      const allMissingSeasons = [
        ...new Set([...missingSeasonWinners, ...missingRaceWinnerSeasons]),
      ];

      this.logger.log(allMissingSeasons);

      if (allMissingSeasons.length > 0) {
        this.logger.log(
          `Missing data for seasons: ${allMissingSeasons.join(
            ', '
          )}. Fetching from external Jolpica API`
        );

        const externalData = await this.jolpicaF1Service.getSeasonsWinners(
          allMissingSeasons
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

          // Store data using upsert - high performance approach
          await this.databaseService.storeDrivers(raceTableBDData.drivers);
          await this.databaseService.storeConstructors(
            raceTableBDData.constructors
          );

          await this.databaseService.storeSeasonsWinners(
            raceTableBDData.seasonWinners
          );

          await this.databaseService.storeSeasonRacesWinners(
            allMissingSeasons,
            raceTableBDData.seasonRaceWinners
          );
        } else {
          throw new Error(
            `No data available for seasons winners from external API`
          );
        }
      }

      // Always get data from database to ensure we have the complete requested range
      const seasonsWinners =
        await this.dataAggregationService.getSeasonsWinners(yearsRange, {
          orderBy: 'season',
          orderDirection: 'desc',
        });

      if (seasonsWinners.length > 0) {
        this.logger.debug(`Returning seasons winners from database`);
        return seasonsWinners;
      }

      throw new Error(`No data available for seasons`);
    } catch (error) {
      this.logger.error('Error fetching seasons winners:', error);
      throw new Error('Unable to fetch seasons winners data');
    }
  }
}
