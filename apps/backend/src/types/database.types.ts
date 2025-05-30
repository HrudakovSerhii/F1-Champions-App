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
  SeasonChampion as ApiSeasonChampion,
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
  }
> &
  BaseEntity;

export type DBConstructor = ApiConstructor & BaseEntity;

// Circuit without Location (removed as per schema update)
export type DBCircuit = Omit<ApiCircuit, 'Location'> & BaseEntity;

// Season Champion for database (flattened from API structure)
export type DBSeasonChampion = Omit<
  ApiSeasonChampion,
  'Driver' | 'Constructors'
> & {
  season: string; // Added for database
  round: string; // Added for database
  driverId: string; // Foreign key reference (replaces nested Driver object)
  constructorId: string; // Foreign key reference (replaces nested Constructors array)
} & BaseEntity;

export interface DBSeason extends BaseEntity {
  year: string;
}

// Embedded types for RaceWinner (based on API Winner structure). Time prop. flattened from API structure
export type DBWinnerDetails = Omit<
  ApiRaceWinner['Winner'],
  'Constructor' | 'Driver' | 'Time'
> & {
  raceTime: ApiRaceWinner['Winner']['Time'];
};

// Race Winner for database (flattened from API structure)
export type DBRaceWinner = Override<
  Omit<ApiRaceWinner, 'Circuit' | 'Winner'>,
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

// Circuit entity types (without location)
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

// Season Champion entity types
export type SeasonChampionCreateInput = Omit<
  DBSeasonChampion,
  'id' | 'createdAt' | 'updatedAt'
>;
export type SeasonChampionUpdateInput = Partial<SeasonChampionCreateInput>;
export type SeasonChampionPublic = Omit<
  DBSeasonChampion,
  'createdAt' | 'updatedAt'
>;

// Race Time embedded type
export type RaceWinnerCreateInput = Omit<
  DBRaceWinner,
  'id' | 'createdAt' | 'updatedAt'
>;
export type RaceWinnerPublic = Omit<DBRaceWinner, 'createdAt' | 'updatedAt'>;

// Populated entity types (with relationships)
export interface SeasonChampionWithRelations
  extends Omit<DBSeasonChampion, 'driverId' | 'constructorId'> {
  driver: DriverPublic;
  constructor: ConstructorPublic;
}

export interface RaceWinnerWithRelations
  extends Omit<DBRaceWinner, 'circuitId' | 'driverId' | 'constructorId'> {
  circuit: CircuitPublic;
  driver: DriverPublic;
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
