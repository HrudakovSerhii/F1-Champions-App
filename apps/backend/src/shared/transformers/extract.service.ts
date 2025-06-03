import {
  DataExtractor,
  DriverCreateInput,
  CircuitCreateInput,
  ConstructorCreateInput,
  JolpiDriverStandingMockData,
  JolpiRaceTableMockData,
  SeasonRaceWinnerCreateInput,
  SeasonWinnerCreateInput,
  WinnerCreateInput,
} from '../../types';

export class ExtractorService implements DataExtractor {
  private uniqueDrivers = new Map<string, DriverCreateInput>();
  private uniqueConstructors = new Map<string, ConstructorCreateInput>();
  private uniqueCircuits = new Map<string, CircuitCreateInput>();
  private uniqueWinners = new Map<string, WinnerCreateInput>();

  extractSeasonsFromJolpiData(
    jolpicaData: JolpiRaceTableMockData
  ): SeasonRaceWinnerCreateInput[] {
    return jolpicaData.MRData.RaceTable.Races.map((race) => {
      const raceWinnerResult = race.Results[0];
      const raceWinnerDriverKey = raceWinnerResult.Driver.driverId;

      if (!this.uniqueDrivers.has(raceWinnerDriverKey)) {
        this.uniqueDrivers.set(raceWinnerDriverKey, raceWinnerResult.Driver);
      }

      const raceWinnerConstructorKey =
        raceWinnerResult.Constructor.constructorId;

      if (!this.uniqueConstructors.has(raceWinnerConstructorKey)) {
        this.uniqueConstructors.set(raceWinnerConstructorKey, {
          name: raceWinnerResult.Constructor.name,
          nationality: raceWinnerResult.Constructor.nationality,
          url: raceWinnerResult.Constructor.url,
        });
      }

      const raceWinnerCircuitKey = race.Circuit.circuitName;

      if (!this.uniqueCircuits.has(raceWinnerCircuitKey)) {
        this.uniqueCircuits.set(raceWinnerCircuitKey, {
          name: race.Circuit.circuitName,
          country: race.Circuit.Location.country,
          locality: race.Circuit.Location.locality,
        });
      }

      return {
        circuitId: race.Circuit.circuitId,
        raceWinnerId: raceWinnerResult.Driver.driverId,
        date: race.date,
        raceName: race.raceName,
        round: Number(race.round),
        season: race.season,
      };
    });
  }

  extractSeasonRaceWinnersFromJolpiData(
    jolpicaData: JolpiDriverStandingMockData
  ): SeasonWinnerCreateInput[] {
    return jolpicaData.MRData.StandingsTable.StandingsLists.map(
      (standingsList) => {
        const driver = standingsList.DriverStandings[0].Driver;
        const constructor = standingsList.DriverStandings[0].Constructors[0];

        const raceWinnerDriverKey = driver.driverId;

        if (!this.uniqueDrivers.has(raceWinnerDriverKey)) {
          this.uniqueDrivers.set(raceWinnerDriverKey, {
            givenName: driver.givenName,
            familyName: driver.familyName,
            driverId: driver.driverId,
            nationality: driver.nationality,
            url: driver.url,
          });
        }

        const raceWinnerConstructorKey = constructor.constructorId;

        if (!this.uniqueConstructors.has(raceWinnerConstructorKey)) {
          this.uniqueConstructors.set(raceWinnerConstructorKey, {
            name: constructor.name,
            nationality: constructor.nationality,
            url: constructor.url,
          });
        }

        const raceWinnerKey = driver.driverId;

        if (!this.uniqueWinners.has(raceWinnerKey)) {
          this.uniqueWinners.set(raceWinnerKey, {
            wins: Number(standingsList.DriverStandings[0].wins),
            driverId: driver.driverId,
            constructorId: constructor.constructorId,
          });
        }

        return {
          season: standingsList.season,
          driverId: driver.driverId,
          constructorId: constructor.constructorId,
        };
      }
    );
  }

  getUniqDrivers() {
    return Array.from(this.uniqueDrivers.values());
  }

  getUniqCircuits() {
    return Array.from(this.uniqueCircuits.values());
  }

  getUniqWinners() {
    return Array.from(this.uniqueWinners.values());
  }

  getUniqConstructors() {
    return Array.from(this.uniqueConstructors.values());
  }
}
