import { Injectable } from '@nestjs/common';
import type {
  DBSeasonWinner,
  DBSeasonRaceWinner,
  DBDriver,
  DBConstructor,
} from '../../types';

import type { SeasonWinner, SeasonRaceWinner } from '@f1-app/api-types';

@Injectable()
export class ApiAdapterService {
  /**
   * Transform database season winners to API format
   * @param seasonsWinners - Raw season winners from database
   * @param drivers - Related drivers data
   * @param constructors - Related constructors data
   * @returns Transformed SeasonWinner[] for API response
   */
  transformSeasonsWinnersToApiFormat(
    seasonsWinners: DBSeasonWinner[],
    drivers: DBDriver[],
    constructors: DBConstructor[]
  ): SeasonWinner[] {
    return seasonsWinners.map((seasonWinner) => {
      const winnerConstructor = constructors.find(
        ({ name }) => name === seasonWinner.constructorId
      );
      const winnerConstructorBDData = winnerConstructor
        ? {
            name: winnerConstructor.name,
            nationality: winnerConstructor.nationality,
            url: winnerConstructor.url,
          }
        : {
            name: seasonWinner.constructorId,
            nationality: 'Unknown',
            url: '',
          };

      const winnerDriver = drivers.find(
        ({ driverId }) => driverId === seasonWinner.driverId
      );
      const winnerDriverBDData = winnerDriver
        ? {
            driverId: winnerDriver.driverId,
            familyName: winnerDriver.familyName,
            givenName: winnerDriver.givenName,
            nationality: winnerDriver.nationality,
            url: winnerDriver.url,
          }
        : {
            driverId: seasonWinner.driverId,
            familyName: 'Unknown',
            givenName: 'Unknown',
            nationality: 'Unknown',
            url: 'Unknown',
          };

      return {
        constructor: winnerConstructorBDData,
        driver: winnerDriverBDData,
        season: seasonWinner.season,
        wins: seasonWinner.wins,
      };
    });
  }

  /**
   * Transform database season race winners to API format
   * @param seasonRaceWinners - Raw season race winners from database
   * @param drivers - Related drivers data
   * @param constructors - Related constructors data
   * @returns Transformed SeasonRaceWinner[] for API response
   */
  transformSeasonRaceWinnersToApiFormat(
    seasonRaceWinners: DBSeasonRaceWinner[],
    drivers: DBDriver[],
    constructors: DBConstructor[]
  ): SeasonRaceWinner[] {
    return seasonRaceWinners.map((raceWinner) => {
      const winnerConstructor = constructors.find(
        ({ name }) => name === raceWinner.constructorId
      );
      const winnerConstructorBDData = winnerConstructor
        ? {
            name: winnerConstructor.name,
            nationality: winnerConstructor.nationality,
            url: winnerConstructor.url,
          }
        : {
            name: raceWinner.constructorId,
            nationality: 'Unknown',
            url: '',
          };

      const winnerDriver = drivers.find(
        ({ driverId }) => driverId === raceWinner.driverId
      );
      const winnerDriverBDData = winnerDriver
        ? {
            driverId: winnerDriver.driverId,
            familyName: winnerDriver.familyName,
            givenName: winnerDriver.givenName,
            nationality: winnerDriver.nationality,
            url: winnerDriver.url,
          }
        : {
            driverId: raceWinner.driverId,
            familyName: 'Unknown',
            givenName: 'Unknown',
            nationality: 'Unknown',
            url: 'Unknown',
          };

      return {
        driver: winnerDriverBDData,
        constructor: winnerConstructorBDData,
        points: raceWinner.points,
        round: raceWinner.round,
        season: raceWinner.season,
        wins: raceWinner.wins,
      };
    });
  }
}
