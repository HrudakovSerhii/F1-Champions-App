import {
  JolpiDriverStandingMRData,
  StandingsList,
  StandingsTable,
} from './jolpi.api.types';

import { DatabaseData } from './database.types';
import { SeasonRaceWinner, SeasonWinner } from '@f1-app/api-types';

export interface DataExtractor {
  extractStandingsTables(
    jolpiDriverStandingMRDataList: Array<JolpiDriverStandingMRData | null>
  ): StandingsTable[];

  flattenStandingsLists(standingsTables: StandingsTable[]): StandingsList[];

  extractDBDataFromJolpiDriversStandingList(
    standingsLists: Array<StandingsList>
  ): DatabaseData;

  extractSeasonsWinnersFromJolpiStandingsLists(
    jolpicaData: Array<StandingsList>
  ): SeasonWinner[];

  extractSeasonRaceWinnersFromJolpiStandingsLists(
    standingsLists: Array<StandingsList>
  ): SeasonRaceWinner[];
}
