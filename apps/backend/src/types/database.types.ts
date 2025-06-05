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
  SeasonWinner as ApiSeasonWinner,
  SeasonRaceWinner as ApiSeasonRaceWinner,
} from '@f1-app/api-types';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type DBDriver = ApiDriver & BaseEntity;

export type DBConstructor = ApiConstructor & BaseEntity;

export type DBSeasonWinner = Omit<ApiSeasonWinner, 'driver' | 'constructor'> & {
  driverId: string; // ApiSeasonWinner.driver.driverId
  constructorId: string; // ApiSeasonWinner.constructor.name OR DB id to constructor entity
} & BaseEntity;

export type DBSeasonRaceWinner = Omit<
  ApiSeasonRaceWinner,
  'constructor' | 'driver'
> & {
  driverId: string; // ApiSeasonRaceWinner.driver.driverId OR id to driver entity
  constructorId: string; // ApiSeasonRaceWinner.constructor.name OR DB id to constructor entity
} & BaseEntity;

export type DriverCreateInput = Omit<
  DBDriver,
  'id' | 'createdAt' | 'updatedAt'
>;
export type ConstructorCreateInput = Omit<
  DBConstructor,
  'id' | 'createdAt' | 'updatedAt'
>;
export type SeasonWinnerCreateInput = Omit<
  DBSeasonWinner,
  'id' | 'createdAt' | 'updatedAt'
>;
export type SeasonRaceWinnerCreateInput = Omit<
  DBSeasonRaceWinner,
  'id' | 'createdAt' | 'updatedAt'
>;

export interface DatabaseData {
  drivers: DriverCreateInput[];
  constructors: ConstructorCreateInput[];
  seasonWinners: SeasonWinnerCreateInput[];
  seasonRaceWinners: SeasonRaceWinnerCreateInput[];
}

// Relations for joining
export interface DBSeasonWinnerWithRelations extends DBSeasonWinner {
  driver: DBDriver;
  constructor: DBConstructor;
}

export interface DBSeasonRaceWinnerWithRelations extends DBSeasonRaceWinner {
  constructor: DBConstructor;
  driver: DBDriver;
}
