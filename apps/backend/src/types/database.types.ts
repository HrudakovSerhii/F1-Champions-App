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
} from '@f1-app/api-types';

// Utility type for overriding specific properties while preserving others
// Based on TypeScript best practices: Omit<T, keyof U> & U
type Override<T, U> = Omit<T, keyof U> & U;

// Base entity interface with database-specific fields
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Database entities: API types + database fields + type conversions
export type DBDriver = Override<
  ApiDriver,
  {
    dateOfBirth: Date; // Converted from string to Date for database
    constructorId: string; // Added current constructor relationship
  }
> &
  BaseEntity;

export type DBConstructor = ApiConstructor & BaseEntity;

// Circuit with name field (aligned with OpenAPI)
export type DBCircuit = Override<
  ApiCircuit,
  {
    circuitId: string; // Keep for data integrity
    url: string; // Keep for data integrity
  }
> &
  BaseEntity;

// Season Winner for database (renamed from SeasonChampion)
export type DBSeasonWinner = Omit<ApiSeasonWinner, 'winner'> & {
  season: string; // Season year
  position: string; // Championship position
  positionText: string; // Championship position text
  points: string; // Points earned
  wins: string; // Wins in season (matches API string format)
  round: string; // Final round of season
  driverId: string; // Foreign key reference (replaces nested winner.driver object)
  constructorId: string; // Foreign key reference (replaces nested winner.constructor object)
} & BaseEntity;

export interface DBSeason extends BaseEntity {
  year: string;
}

// Embedded types for RaceWinner (based on API Winner structure). Time prop. flattened from API structure
export type DBWinnerDetails = {
  number: string;
  position: string;
  points: string;
  laps: string;
  time: {
    millis: string;
    time: string;
  };
};

// Race Winner for database (flattened from API structure)
export type DBRaceWinner = Override<
  Omit<ApiRaceWinner, 'circuit' | 'winner'>,
  {
    date: Date; // Converted from string to Date for database
  }
> & {
  // Flattened structure for database storage
  winnerDetails: DBWinnerDetails;
  circuitId: string; // Foreign key reference (replaces nested Circuit object)
  driverId: string; // Foreign key reference (replaces nested Winner.Driver object)
  constructorId: string; // Foreign key reference (replaces nested Winner.Constructor object)
} & BaseEntity;

// Database operation types
export type DriverPublic = Omit<DBDriver, 'createdAt' | 'updatedAt'>;
export type DriverCreateInput = Omit<
  DBDriver,
  'id' | 'createdAt' | 'updatedAt'
>;
export type DriverUpdateInput = Partial<DriverCreateInput>;

// Constructor entity types
export type ConstructorPublic = Omit<DBConstructor, 'createdAt' | 'updatedAt'>;
export type ConstructorCreateInput = Omit<
  DBConstructor,
  'id' | 'createdAt' | 'updatedAt'
>;
export type ConstructorUpdateInput = Partial<ConstructorCreateInput>;

// Circuit entity types
export type CircuitCreateInput = Omit<
  DBCircuit,
  'id' | 'createdAt' | 'updatedAt'
>;
export type CircuitUpdateInput = Partial<CircuitCreateInput>;
export type CircuitPublic = Omit<DBCircuit, 'createdAt' | 'updatedAt'>;

// Season entity types
export type SeasonCreateInput = Omit<
  DBSeason,
  'id' | 'createdAt' | 'updatedAt'
>;
export type SeasonUpdateInput = Partial<SeasonCreateInput>;
export type SeasonPublic = Omit<DBSeason, 'createdAt' | 'updatedAt'>;

// Season Winner entity types (renamed from SeasonChampion)
export type SeasonWinnerCreateInput = Omit<
  DBSeasonWinner,
  'id' | 'createdAt' | 'updatedAt'
>;
export type SeasonWinnerUpdateInput = Partial<SeasonWinnerCreateInput>;
export type SeasonWinnerPublic = Omit<
  DBSeasonWinner,
  'createdAt' | 'updatedAt'
>;

// Race Winner entity types
export type RaceWinnerCreateInput = Omit<
  DBRaceWinner,
  'id' | 'createdAt' | 'updatedAt'
>;
export type RaceWinnerPublic = Omit<DBRaceWinner, 'createdAt' | 'updatedAt'>;

// Populated entity types (with relationships)
export interface SeasonWinnerWithRelations
  extends Omit<DBSeasonWinner, 'driverId' | 'constructorId'> {
  driver: DriverPublic;
  constructor: ConstructorPublic;
}

export interface RaceWinnerWithRelations
  extends Omit<DBRaceWinner, 'circuitId' | 'driverId' | 'constructorId'> {
  circuit: CircuitPublic;
  driver: DriverPublic;
  constructor: ConstructorPublic;
}

export interface DriverWithRelations extends Omit<DBDriver, 'constructorId'> {
  constructor: ConstructorPublic;
}

// Utility types
export type EntityId = string;
export type EntityReference = { id: EntityId };

// Database operation result types
export interface DatabaseOperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Query options
export interface QueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}
