import {
  JolpiRaceTableMockData,
  JolpiDriverStandingMockData,
} from './jolpi.api.types';

import {
  SeasonWinnerCreateInput,
  SeasonRaceWinnerCreateInput,
  DriverCreateInput,
  CircuitCreateInput,
  WinnerCreateInput,
  ConstructorCreateInput,
} from './database.types';

export interface DataTransformer {
  transformJolpiDriverStanding(
    jolpicaData: JolpiDriverStandingMockData
  ): SeasonWinnerCreateInput[];

  transformJolpicaRaceTable(
    jolpicaData: JolpiRaceTableMockData
  ): SeasonRaceWinnerCreateInput[];
}

export interface DataExtractor {
  extractSeasonsFromJolpiData(
    jolpicaData: JolpiRaceTableMockData
  ): SeasonRaceWinnerCreateInput[];

  extractSeasonRaceWinnersFromJolpiData(
    jolpicaData: JolpiDriverStandingMockData
  ): SeasonWinnerCreateInput[];

  getUniqDrivers(): DriverCreateInput[];

  getUniqCircuits(): CircuitCreateInput[];

  getUniqWinners(): WinnerCreateInput[];

  getUniqConstructors(): ConstructorCreateInput[];
}
