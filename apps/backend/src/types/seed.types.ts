/**
 * Seed Types
 *
 * Types for database seeding operations based on @f1-app/api-types.
 * These types are optimized for data import/export and seed generation.
 */

import type {
  SeasonChampion as ApiSeasonChampion,
  RaceWinner as ApiRaceWinner,
} from '@f1-app/api-types';

import {
  DriverCreateInput,
  ConstructorCreateInput,
  CircuitCreateInput,
  SeasonCreateInput,
  DBWinnerDetails,
} from './database.types';

// Seed data types based on API types but flattened for database seeding
export type SeedDriver = DriverCreateInput;
export type SeedConstructor = ConstructorCreateInput;

// Circuit without Location (removed as per our schema update)
export type SeedCircuit = CircuitCreateInput;
export type SeedSeason = SeasonCreateInput;

// Seed types with reference IDs instead of foreign keys (based on API structure)
export type SeedSeasonChampion = Omit<
  ApiSeasonChampion,
  'Constructors' | 'Driver'
> & {
  season: string;
  round: string;
  driverRef: string; // Reference to driverId (from API structure)
  constructorRef: string; // Reference to constructorId (from API structure)
};

// Seed types with reference IDs instead of foreign keys (based on API structure)
export type SeedRaceWinner = Omit<ApiRaceWinner, 'Circuit' | 'Winner'> & {
  winnerDetails: DBWinnerDetails; // Same as API structure
  driverRef: string; // Reference to driverId (from API structure)
  constructorRef: string; // Reference to constructorId (from API structure)
  circuitRef: string; // Reference to circuitId (from API structure)
};

// Complete seed data structure (in case we want to build tests for seed operations)
export interface SeedData {
  drivers: SeedDriver[];
  constructors: SeedConstructor[];
  circuits: SeedCircuit[];
  seasons: SeedSeason[];
  seasonChampions: SeedSeasonChampion[];
  raceWinners: SeedRaceWinner[];
}
