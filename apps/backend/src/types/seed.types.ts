/**
 * Seed Types
 *
 * Types for database seeding operations optimized for data import/export and seed generation.
 * These types include original API identifiers for mapping purposes during seed operations.
 */

import type {
  DriverCreateInput,
  ConstructorCreateInput,
  CircuitCreateInput,
  SeasonCreateInput,
  DBWinnerDetails,
} from './database.types';

import type { SeasonWinner, RaceWinner } from '@f1-app/api-types';

export type SeedDriver = DriverCreateInput;

export interface SeedConstructor extends ConstructorCreateInput {
  constructorId: string;
}

export type SeedCircuit = CircuitCreateInput;
export type SeedSeason = SeasonCreateInput;

export interface SeedSeasonWinner extends Omit<SeasonWinner, 'winner'> {
  driverRef: string;
  constructorRef: string;
}

export interface SeedRaceWinner extends Omit<RaceWinner, 'constructor'> {
  season: string;
  round: string;
  raceName: string;
  date: string;
  winnerDetails: DBWinnerDetails;
  driverRef: string;
  constructorRef: string;
  circuitRef: string;
}

export interface SeedData {
  drivers: SeedDriver[];
  constructors: SeedConstructor[];
  circuits: SeedCircuit[];
  seasons: SeedSeason[];
  seasonWinners: SeedSeasonWinner[];
  raceWinners: SeedRaceWinner[];
}
