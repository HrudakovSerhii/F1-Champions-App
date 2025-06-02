/**
 * Transformation utilities for converting Jolpica API responses to Seed types
 * These functions handle the mapping from the raw Jolpica API format to seed data for database operations
 */

import type {
  SeedSeasonWinner,
  SeedRaceWinner,
  SeedDriver,
  SeedConstructor,
  SeedCircuit,
  SeedSeason,
  SeedData,
} from '../types/seed.types';

import type { SeedDataTransformer } from '../types/transformer.types';
import type {
  JolpicaRaceResultsResponse,
  JolpicaStandingsResponse,
} from '../types/jolpica.api.types';

export class TransformationService implements SeedDataTransformer {
  /**
   * Transform Jolpica standings data to seed season winners
   */
  transformStandingsToSeedSeasonWinners(
    jolpicaData: JolpicaStandingsResponse
  ): SeedSeasonWinner[] {
    const { MRData } = jolpicaData;

    const seasonWinners = MRData.StandingsTable.StandingsLists.map(
      (standingsList) => {
        // Get the champion (position 1)
        const champion = standingsList.DriverStandings.find(
          (standing) => standing.position === '1'
        );

        if (!champion) {
          throw new Error(
            `No champion found for season ${standingsList.season}`
          );
        }

        return {
          season: standingsList.season,
          position: champion.position,
          positionText: champion.position, // Use position as positionText since it's not in Jolpica
          points: '0', // Default value since not in Jolpica standings
          wins: champion.wins,
          round: standingsList.round,
          driverRef: champion.Driver.driverId,
          constructorRef: champion.Constructors[0]?.constructorId || 'unknown',
        };
      }
    );

    return seasonWinners;
  }

  /**
   * Transform Jolpica race data to seed race winners
   */
  transformRacesToSeedRaceWinners(
    jolpicaData: JolpicaRaceResultsResponse
  ): SeedRaceWinner[] {
    const { MRData } = jolpicaData;

    const raceWinners = MRData.RaceTable.Races.map((race) => {
      // Get the winner (Results[0] should be the race winner)
      const winner = race.Results[0];

      if (!winner) {
        throw new Error(
          `No winner found for race ${race.raceName} in season ${race.season}`
        );
      }

      return {
        // Fields from RaceWinner schema (omitting constructor)
        nationality: winner.Driver.nationality,
        familyName: winner.Driver.familyName,
        givenName: winner.Driver.givenName,
        url: winner.Driver.url,
        driverId: winner.Driver.driverId,
        time: winner.Time?.time || '1:30:00.000',
        laps: parseInt(winner.laps, 10),

        // Additional seed-specific fields
        season: race.season,
        round: race.round,
        raceName: race.raceName,
        date: race.date,
        winnerDetails: {
          number: '1', // Default winner position
          position: '1', // Default winner position
          points: '25', // Default winner points
          laps: winner.laps,
          time: {
            millis: '0', // Default since not in Jolpica
            time: winner.Time?.time || '1:30:00.000',
          },
        },
        driverRef: winner.Driver.driverId,
        constructorRef: winner.Constructor.constructorId,
        circuitRef: this.generateCircuitId(race.Circuit.circuitName), // Generate ID from name
      };
    });

    return raceWinners;
  }

  /**
   * Extract unique drivers from Jolpica data
   */
  extractUniqueDrivers(
    standingsData: JolpicaStandingsResponse,
    raceData: JolpicaRaceResultsResponse
  ): SeedDriver[] {
    const driversMap = new Map<string, any>();

    // Extract from standings data
    standingsData.MRData.StandingsTable.StandingsLists.forEach(
      (standingsList) => {
        standingsList.DriverStandings.forEach((standing) => {
          const driver = standing.Driver;
          const constructor = standing.Constructors[0];

          driversMap.set(driver.driverId, {
            driverId: driver.driverId,
            givenName: driver.givenName,
            familyName: driver.familyName,
            dateOfBirth: new Date(driver.dateOfBirth),
            nationality: driver.nationality,
            url: driver.url,
            wins: parseInt(standing.wins, 10), // Add wins field from standings
            constructorId: constructor?.constructorId || 'unknown',
          });
        });
      }
    );

    // Extract from race data
    raceData.MRData.RaceTable.Races.forEach((race) => {
      race.Results.forEach((result) => {
        const driver = result.Driver;
        const constructor = result.Constructor;

        if (!driversMap.has(driver.driverId)) {
          driversMap.set(driver.driverId, {
            driverId: driver.driverId,
            givenName: driver.givenName,
            familyName: driver.familyName,
            dateOfBirth: new Date(driver.dateOfBirth),
            nationality: driver.nationality,
            url: driver.url,
            wins: 0, // Default wins for non-champion drivers
            constructorId: constructor.constructorId,
          });
        }
      });
    });

    return Array.from(driversMap.values());
  }

  /**
   * Extract unique constructors from Jolpica data
   */
  extractUniqueConstructors(
    standingsData: JolpicaStandingsResponse,
    raceData: JolpicaRaceResultsResponse
  ): SeedConstructor[] {
    const constructorsMap = new Map<string, any>();

    // Extract from standings data
    standingsData.MRData.StandingsTable.StandingsLists.forEach(
      (standingsList) => {
        standingsList.DriverStandings.forEach((standing) => {
          standing.Constructors.forEach((constructor) => {
            constructorsMap.set(constructor.constructorId, {
              constructorId: constructor.constructorId,
              name: constructor.name,
              nationality: constructor.nationality,
              url: constructor.url,
            });
          });
        });
      }
    );

    // Extract from race data
    raceData.MRData.RaceTable.Races.forEach((race) => {
      race.Results.forEach((result) => {
        const constructor = result.Constructor;
        constructorsMap.set(constructor.constructorId, {
          constructorId: constructor.constructorId,
          name: constructor.name,
          nationality: constructor.nationality,
          url: constructor.url,
        });
      });
    });

    return Array.from(constructorsMap.values());
  }

  /**
   * Extract unique circuits from Jolpica race data
   */
  extractUniqueCircuits(raceData: JolpicaRaceResultsResponse): SeedCircuit[] {
    const circuitsMap = new Map<string, any>();

    raceData.MRData.RaceTable.Races.forEach((race) => {
      const circuit = race.Circuit;
      const circuitId = this.generateCircuitId(circuit.circuitName);

      circuitsMap.set(circuitId, {
        circuitId: circuitId,
        name: circuit.circuitName,
        url: `http://en.wikipedia.org/wiki/${circuit.circuitName.replace(
          /\s+/g,
          '_'
        )}`,
        country: circuit.Location.country,
        locality: circuit.Location.locality,
      });
    });

    return Array.from(circuitsMap.values());
  }

  /**
   * Extract seasons from Jolpica standings data
   */
  extractSeasons(standingsData: JolpicaStandingsResponse): SeedSeason[] {
    const seasonsSet = new Set<string>();

    standingsData.MRData.StandingsTable.StandingsLists.forEach(
      (standingsList) => {
        seasonsSet.add(standingsList.season);
      }
    );

    return Array.from(seasonsSet).map((season) => ({
      year: season,
    }));
  }

  /**
   * Transform complete Jolpica data to seed data
   */
  transformJolpicaToSeedData(
    standingsData: JolpicaStandingsResponse,
    raceData: JolpicaRaceResultsResponse
  ): SeedData {
    return {
      drivers: this.extractUniqueDrivers(standingsData, raceData),
      constructors: this.extractUniqueConstructors(standingsData, raceData),
      circuits: this.extractUniqueCircuits(raceData),
      seasons: this.extractSeasons(standingsData),
      seasonWinners: this.transformStandingsToSeedSeasonWinners(standingsData),
      raceWinners: this.transformRacesToSeedRaceWinners(raceData),
    };
  }

  /**
   * Helper method to generate circuit ID from circuit name
   */
  private generateCircuitId(circuitName: string): string {
    return circuitName
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .replace(/_circuit$/, '');
  }
}
