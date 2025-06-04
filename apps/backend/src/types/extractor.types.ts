import {
  JolpiDriverStandingMRData,
  JolpiRaceTableMRData,
} from './jolpi.api.types';
import { DatabaseData } from './database.types';
import { SeasonRaceWinner, SeasonWinner } from '@f1-app/api-types';

export interface DataExtractor {
  extractDBDataFromJolpiRaceTable(
    jolpicaData: JolpiRaceTableMRData
  ): DatabaseData;

  extractSeasonsWinnersFromJolpiRaceTable(
    jolpicaData: JolpiRaceTableMRData
  ): SeasonWinner[];

  extractDBDataFromJolpiDriversStandings(
    jolpicaData: JolpiDriverStandingMRData
  ): DatabaseData;

  extractSeasonRaceWinnersFromJolpiDriversStandings(
    jolpicaData: JolpiDriverStandingMRData
  ): SeasonRaceWinner[];
}
