import {
  DataExtractor,
  DriverCreateInput,
  CircuitCreateInput,
  ConstructorCreateInput,
  JolpiDriverStandingMRData,
  JolpiRaceTableMRData,
  SeasonWinnerCreateInput,
  SeasonRaceWinnerCreateInput,
  DatabaseData,
  SeasonCreateInput,
} from '../../types';

import { SeasonRaceWinner, SeasonWinner } from '@f1-app/api-types';

export class ExternalDataParserService implements DataExtractor {
  extractDBDataFromJolpiRaceTable(
    jolpicaData: JolpiRaceTableMRData
  ): DatabaseData {
    const uniqueDrivers = new Map<string, DriverCreateInput>();
    const uniqueConstructors = new Map<string, ConstructorCreateInput>();
    const uniqueCircuits = new Map<string, CircuitCreateInput>();
    const uniqueSeasons = new Map<string, SeasonCreateInput>();

    const seasonRaceWinners = new Array<SeasonRaceWinnerCreateInput>();

    jolpicaData.MRData.RaceTable.Races.forEach((race) => {
      const raceWinnerResult = race.Results[0];

      // Uniq driver
      const raceWinnerDriverKey = raceWinnerResult.Driver.driverId;

      if (!uniqueDrivers.has(raceWinnerDriverKey)) {
        uniqueDrivers.set(raceWinnerDriverKey, raceWinnerResult.Driver);
      }

      // Uniq constructor
      const raceWinnerConstructorKey =
        raceWinnerResult.Constructor.constructorId;

      if (!uniqueConstructors.has(raceWinnerConstructorKey)) {
        uniqueConstructors.set(raceWinnerConstructorKey, {
          name: raceWinnerResult.Constructor.name,
          nationality: raceWinnerResult.Constructor.nationality,
          url: raceWinnerResult.Constructor.url,
        });
      }

      // Uniq Circuit
      const raceWinnerCircuitKey = race.Circuit.circuitName;

      if (!uniqueCircuits.has(raceWinnerCircuitKey)) {
        uniqueCircuits.set(raceWinnerCircuitKey, {
          name: race.Circuit.circuitName,
          country: race.Circuit.Location.country,
          locality: race.Circuit.Location.locality,
        });
      }

      // Uniq Season
      const raceWinnerSeasonKey = race.season;

      if (!uniqueSeasons.has(raceWinnerSeasonKey)) {
        uniqueSeasons.set(raceWinnerSeasonKey, {
          year: race.season,
        });
      }

      seasonRaceWinners.push({
        date: race.date,
        laps: Number(raceWinnerResult.laps),
        raceName: race.raceName,
        round: Number(race.round),
        season: race.season,
        time: raceWinnerResult.Time?.time,
        circuitId: race.Circuit.circuitName,
        constructorId: raceWinnerResult.Constructor.name,
        driverId: raceWinnerResult.Driver.driverId,
      });
    });

    return {
      seasonWinners: [],
      seasonRaceWinners,
      drivers: Array.from(uniqueDrivers.values()),
      constructors: Array.from(uniqueConstructors.values()),
      circuits: Array.from(uniqueCircuits.values()),
      seasons: Array.from(uniqueSeasons.values()),
    };
  }

  extractSeasonsWinnersFromJolpiRaceTable(
    jolpicaData: JolpiRaceTableMRData
  ): SeasonWinner[] {
    return jolpicaData.MRData.RaceTable.Races.map((race) => {
      const winner = race.Results[0];
      const driver = winner.Driver;
      const constructor = winner.Constructor;

      return {
        driver,
        constructor,
        season: race.season,
        wins: 0, // TODO: check how we can calculate this data using DB
      };
    });
  }

  extractAPIDataFromJolpiDriversStandings(
    jolpicaData: JolpiRaceTableMRData
  ): SeasonWinner[] {
    return jolpicaData.MRData.RaceTable.Races.map((race) => {
      const raceWinnerResult = race.Results[0];

      return {
        driver: raceWinnerResult.Driver,
        constructor: raceWinnerResult.Constructor,
        season: race.season,
        wins: 0,
      };
    });
  }

  extractDBDataFromJolpiDriversStandings(
    jolpicaData: JolpiDriverStandingMRData
  ): DatabaseData {
    const uniqueDrivers = new Map<string, DriverCreateInput>();
    const uniqueConstructors = new Map<string, ConstructorCreateInput>();
    const uniqueCircuits = new Map<string, CircuitCreateInput>();
    const uniqueSeasons = new Map<string, SeasonCreateInput>();
    const seasonWinners = new Array<SeasonWinnerCreateInput>();

    jolpicaData.MRData.StandingsTable.StandingsLists.forEach(
      (standingsList) => {
        const winner = standingsList.DriverStandings[0];
        const driver = winner.Driver;
        const constructor = winner.Constructors[0];

        // Uniq driver
        const seasonWinnerDriverKey = driver.driverId;

        if (!uniqueDrivers.has(seasonWinnerDriverKey)) {
          uniqueDrivers.set(seasonWinnerDriverKey, driver);
        }

        // Uniq constructor
        const seasonWinnerConstructorKey = constructor.constructorId;

        if (!uniqueConstructors.has(seasonWinnerConstructorKey)) {
          uniqueConstructors.set(seasonWinnerConstructorKey, {
            name: constructor.name,
            nationality: constructor.nationality,
            url: constructor.url,
          });
        }

        seasonWinners.push({
          wins: Number(winner.wins),
          season: standingsList.season,
          driverId: winner.Driver.driverId,
          constructorId: winner.Constructors[0].constructorId,
        });
      }
    );

    return {
      seasonWinners,
      seasonRaceWinners: [],
      drivers: Array.from(uniqueDrivers.values()),
      constructors: Array.from(uniqueConstructors.values()),
      circuits: Array.from(uniqueCircuits.values()),
      seasons: Array.from(uniqueSeasons.values()),
    };
  }

  /**
   * This method is used to return API data directly from Jolpi API response.
   * This function can be removed after we would be sure data in DB can be retreated after save
   * @param jolpicaData
   */
  extractSeasonRaceWinnersFromJolpiDriversStandings(
    jolpicaData: JolpiDriverStandingMRData
  ): SeasonRaceWinner[] {
    return jolpicaData.MRData.StandingsTable.StandingsLists.map(
      (standingsList) => {
        const winner = standingsList.DriverStandings[0];
        const driver = winner.Driver;
        const constructor = winner.Constructors[0];

        return {
          circuit: {
            country: 'UNKNOWN',
            locality: 'UNKNOWN',
            name: 'UNKNOWN',
          },
          constructor: {
            name: constructor.name,
            nationality: constructor.nationality,
            url: constructor.url,
          },
          date: 'UNKNOWN',
          driver: {
            driverId: driver.driverId,
            familyName: driver.familyName,
            givenName: driver.givenName,
            nationality: driver.nationality,
            url: driver.url,
          },
          laps: 0,
          raceName: 'UNKNOWN',
          round: Number(standingsList.round),
          season: standingsList.season,
          time: undefined,
          wins: 0,
        };
      }
    );
  }
}
