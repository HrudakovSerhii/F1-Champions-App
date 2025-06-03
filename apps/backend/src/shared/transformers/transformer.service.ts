/**
 * Transformation utilities for converting Jolpica API responses to database Types
 * These functions handle the mapping from the raw Jolpi API format to DB-compliant types
 */

import {
  DataTransformer,
  JolpiDriverStandingMockData,
  JolpiRaceTableMockData,
  SeasonWinnerCreateInput,
  SeasonRaceWinnerCreateInput,
} from '../../types';

export class TransformerService implements DataTransformer {
  transformJolpiDriverStanding(
    jolpicaData: JolpiDriverStandingMockData
  ): SeasonWinnerCreateInput[] {
    const standingsLists = jolpicaData.MRData.StandingsTable.StandingsLists;

    return standingsLists.map((standing) => ({
      season: standing.season,
      driverId: standing.DriverStandings[0].Driver.driverId, // ApiSeasonWinner.winner.driver.driverId
      constructorId: standing.DriverStandings[0].Constructors[0].constructorId,
    }));
  }

  transformJolpicaRaceTable(
    jolpicaData: JolpiRaceTableMockData
  ): SeasonRaceWinnerCreateInput[] {
    const RaceTable = jolpicaData.MRData.RaceTable;

    return RaceTable.Races.map((race) => ({
      date: race.date,
      raceName: race.raceName,
      round: Number(race.round),
      season: race.season,
      circuitId: race.Circuit.circuitId,
      raceWinnerId: race.Results[0].Driver.driverId,
    }));
  }
}
