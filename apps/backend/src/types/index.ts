/**
 * Backend Types Index
 *
 * Centralized export of all backend type definitions.
 * All types are built upon the base types from @f1-app/api-types.
 *
 * Usage examples:
 * import { Driver, DriverCreateInput } from '../types';
 * import { SeasonChampionsResponse, ApiResponse } from '../types';
 * import { SeedData, SeedSeasonChampion } from '../types';
 * import { ServiceResult, CacheOptions } from '../types';
 */

// Database entity types (built on API types)
export * from './database.types';

// API types (extensions of @f1-app/api-types)
export * from './api.types';

// External API types (Ergast API structures)
export * from './ergast.api.types';

// Seed operation types (based on API types)
export * from './seed.types';

// Service layer types
export * from './service.types';

// Re-export base API types for convenience
export type {
  Driver as ApiDriver,
  Constructor as ApiConstructor,
  Circuit as ApiCircuit,
  SeasonChampion as ApiSeasonChampion,
  RaceWinner as ApiRaceWinner,
  SeasonChampionsResponse,
  RaceWinnersResponse,
  ErrorResponse,
} from '@f1-app/api-types';

// Common type utilities
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Branded types for better type safety
export type Brand<T, U> = T & { __brand: U };
export type DriverId = Brand<string, 'DriverId'>;
export type ConstructorId = Brand<string, 'ConstructorId'>;
export type CircuitId = Brand<string, 'CircuitId'>;
export type SeasonId = Brand<string, 'SeasonId'>;

// Utility functions for branded types
export const createDriverId = (id: string): DriverId => id as DriverId;
export const createConstructorId = (id: string): ConstructorId =>
  id as ConstructorId;
export const createCircuitId = (id: string): CircuitId => id as CircuitId;
export const createSeasonId = (id: string): SeasonId => id as SeasonId;

// Type guards
export const isNonNull = <T>(value: T | null): value is T => value !== null;
export const isDefined = <T>(value: T | undefined): value is T =>
  value !== undefined;
export const isNonEmpty = (value: string | null | undefined): value is string =>
  Boolean(value && value.trim().length > 0);

// Validation helpers
export interface TypeValidator<T> {
  validate(value: unknown): value is T;

  parse(value: unknown): T | null;
}

// Common validation patterns
export const isValidEntityId = (id: string): boolean => {
  return typeof id === 'string' && id.length > 0 && id.length <= 100;
};

export const isValidYear = (year: string): boolean => {
  const yearNum = parseInt(year, 10);
  return (
    !isNaN(yearNum) &&
    yearNum >= 1950 &&
    yearNum <= new Date().getFullYear() + 1
  );
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
