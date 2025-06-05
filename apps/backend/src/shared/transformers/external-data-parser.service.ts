import {
  DataExtractor,
  DriverCreateInput,
  ConstructorCreateInput,
  JolpiDriverStandingMRData,
  SeasonWinnerCreateInput,
  SeasonRaceWinnerCreateInput,
  DatabaseData,
  StandingsTable,
  StandingsList,
} from '../../types';

import { SeasonRaceWinner, SeasonWinner } from '@f1-app/api-types';

export class ExternalDataParserService implements DataExtractor {
  /**
   * Extracts StandingsTable objects from the filtered MRData list
   * Uses flatMap for better performance than reduce
   */
  extractStandingsTables(
    jolpiDriverStandingMRDataList: Array<JolpiDriverStandingMRData | null>
  ): Array<StandingsTable> {
    return jolpiDriverStandingMRDataList
      .filter((data): data is JolpiDriverStandingMRData => data !== null)
      .flatMap((data) =>
        data.MRData.StandingsTable ? [data.MRData.StandingsTable] : []
      );
  }

  /**
   * Flattens StandingsLists from multiple StandingsTable objects
   * Uses flat() for optimal performance
   */
  flattenStandingsLists(
    standingsTables: Array<StandingsTable>
  ): StandingsList[] {
    return standingsTables.map((table) => table.StandingsLists).flat();
  }

  extractDBDataFromJolpiDriversStandingList(
    standingsLists: Array<StandingsList>
  ): DatabaseData {
    const uniqueDrivers = new Map<string, DriverCreateInput>();
    const uniqueConstructors = new Map<string, ConstructorCreateInput>();
    const seasonWinners = new Array<SeasonWinnerCreateInput>();
    const seasonRaceWinners = new Array<SeasonRaceWinnerCreateInput>();

    standingsLists.forEach((standingsList) => {
      standingsList.DriverStandings.forEach(
        ({ wins, points, position, Driver, Constructors }) => {
          // Uniq driver
          const seasonWinnerDriverKey = Driver.driverId;

          if (!uniqueDrivers.has(seasonWinnerDriverKey)) {
            uniqueDrivers.set(seasonWinnerDriverKey, {
              url: Driver.url,
              givenName: Driver.givenName,
              driverId: Driver.driverId,
              familyName: Driver.familyName,
              nationality: Driver.nationality,
            });
          }

          Constructors.forEach((constructor) => {
            // Uniq constructor
            const seasonWinnerConstructorKey = constructor.constructorId;

            if (!uniqueConstructors.has(seasonWinnerConstructorKey)) {
              uniqueConstructors.set(seasonWinnerConstructorKey, {
                name: constructor.name,
                nationality: constructor.nationality,
                url: constructor.url,
              });
            }
          });

          if (position === '1') {
            seasonWinners.push({
              wins: Number(wins),
              season: standingsList.season,
              driverId: Driver.driverId,
              constructorId: Constructors[0].constructorId,
            });
          }

          seasonRaceWinners.push({
            wins: Number(wins),
            points: Number(points),
            round: Number(standingsList.round),
            season: standingsList.season,
            constructorId: Constructors[0].name,
            driverId: Driver.driverI,
          });
        }
      );
    });

    return {
      seasonWinners,
      seasonRaceWinners,
      drivers: Array.from(uniqueDrivers.values()),
      constructors: Array.from(uniqueConstructors.values()),
    };
  }

  /**
   * This method is used to return API data directly from Jolpi API response.
   * This function can be removed after we would be sure data in DB can be retreated after save
   * @param standingsLists
   */
  extractSeasonRaceWinnersFromJolpiStandingsLists(
    standingsLists: Array<StandingsList>
  ): SeasonRaceWinner[] {
    return standingsLists.map((standingsList) => {
      const winner = standingsList.DriverStandings[0];
      const driver = winner.Driver;
      const constructor = winner.Constructors[0];

      return {
        driver,
        constructor,
        wins: Number(winner.wins),
        points: Number(winner.points),
        round: Number(standingsList.round),
        season: standingsList.season,
      };
    });
  }

  /**
   * This method is used to return API data directly from Jolpi API response.
   * This function can be removed after we would be sure data in DB can be retreated after save
   * @param standingsLists
   */
  extractSeasonsWinnersFromJolpiStandingsLists(
    standingsLists: Array<StandingsList>
  ): SeasonWinner[] {
    return standingsLists.map((standingsList) => {
      const winner = standingsList.DriverStandings[0];
      const driver = winner.Driver;
      const constructor = winner.Constructors[0];

      return {
        driver,
        constructor,
        wins: Number(winner.wins),
        season: standingsList.seaso,
      };
    });
  }
}
