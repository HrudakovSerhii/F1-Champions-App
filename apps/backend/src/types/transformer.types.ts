import type {
  JolpicaRaceResultsResponse,
  JolpicaStandingsResponse,
} from './jolpica.api.types';
import type { SeedData, SeedRaceWinner, SeedSeasonWinner } from './seed.types';

export interface SeedDataTransformer {
  transformStandingsToSeedSeasonWinners(
    jolpicaData: JolpicaStandingsResponse
  ): SeedSeasonWinner[];

  transformRacesToSeedRaceWinners(
    jolpicaData: JolpicaRaceResultsResponse
  ): SeedRaceWinner[];

  transformJolpicaToSeedData(
    standingsData: JolpicaStandingsResponse,
    raceData: JolpicaRaceResultsResponse
  ): SeedData;
}
