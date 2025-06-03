/**
 * Database Entity Types
 *
 * These types extend the base API types from @f1-app/api-types for database operations.
 * They use the Override utility type to only modify specific properties that need conversion,
 * while preserving all other API type properties unchanged.
 */

import type {
  Driver as ApiDriver,
  Constructor as ApiConstructor,
  Circuit as ApiCircuit,
  SeasonWinner as ApiSeasonWinner,
  RaceWinner as ApiRaceWinner,
  SeasonRaceWinner as ApiSeasonRaceWinner,
} from '@f1-app/api-types';

type Override<T, U> = Omit<T, keyof U> & U;

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type DBDriver = ApiDriver & BaseEntity;

export type DBConstructor = ApiConstructor & BaseEntity;

export type DBCircuit = ApiCircuit & BaseEntity;

export interface DBSeason extends BaseEntity {
  year: string;
}

export type DBSeasonWinner = Omit<ApiSeasonWinner, 'winner'> & {
  driverId: string; // ApiSeasonWinner.winner.driver.driverId
  constructorId: string; // ApiSeasonWinner.winner.constructor.name OR DB id to constructor entity
} & BaseEntity;

export type DBRaceWinner = Override<
  Omit<ApiRaceWinner, 'constructor' | 'driver'>,
  {
    driverId: string; // ApiRaceWinner.driver.driverId OR DB id to driver entity
    constructorId: string; // ApiRaceWinner.constructor.name OR DB id to constructor entity
  }
> &
  BaseEntity;

export type DBSeasonRaceWinner = Omit<
  ApiSeasonRaceWinner,
  'raceWinner' | 'circuit'
> & {
  circuitId: string; // ApiSeasonRaceWinner.circuit.name OR DB id to circuit entity
  raceWinnerId: string; // ApiSeasonRaceWinner.raceWinner.id <- relation to DB id
} & BaseEntity;

export type DriverCreateInput = Omit<
  DBDriver,
  'id' | 'createdAt' | 'updatedAt'
>;
export type ConstructorCreateInput = Omit<
  DBConstructor,
  'id' | 'createdAt' | 'updatedAt'
>;
export type CircuitCreateInput = Omit<
  DBCircuit,
  'id' | 'createdAt' | 'updatedAt'
>;
export type SeasonCreateInput = Omit<
  DBSeason,
  'id' | 'createdAt' | 'updatedAt'
>;
export type SeasonWinnerCreateInput = Omit<
  DBSeasonWinner,
  'id' | 'createdAt' | 'updatedAt'
>;
export type RaceWinnerCreateInput = Omit<
  DBRaceWinner,
  'id' | 'createdAt' | 'updatedAt'
>;
export type SeasonRaceWinnerCreateInput = Omit<
  DBSeasonRaceWinner,
  'id' | 'createdAt' | 'updatedAt'
>;

export interface DatabaseData {
  drivers: DriverCreateInput[];
  constructors: ConstructorCreateInput[];
  circuits: CircuitCreateInput[];
  seasons: SeasonCreateInput[];
  seasonWinners: SeasonWinnerCreateInput[];
  raceWinners: RaceWinnerCreateInput[];
  seasonRaceWinners: SeasonRaceWinnerCreateInput[];
}

// Relations for joining
export interface DBSeasonWinnerWithRelations extends DBSeasonWinner {
  driver: DBDriver;
  constructor: DBConstructor;
}

export interface DBSeasonRaceWinnerWithRelations extends DBSeasonRaceWinner {
  circuit: DBCircuit;
  raceWinner: DBRaceWinnerWithRelations;
}

export interface DBRaceWinnerWithRelations extends DBRaceWinner {
  driver: DBDriver;
  constructor: DBConstructor;
}
