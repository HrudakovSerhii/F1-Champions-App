/**
 * API Types
 *
 * Types for API responses and internal API operations.
 * These extend the base types from @f1-app/api-types for backend-specific needs.
 */

import type {
  DriverPublic,
  ConstructorPublic,
  CircuitPublic,
  SeasonPublic,
  SeasonChampionWithRelations,
  RaceWinnerWithRelations,
  PaginatedResult,
} from './database.types';

// Re-export API response types from the shared library
export type {
  SeasonChampionsResponse,
  RaceWinnersResponse,
  ErrorResponse,
} from '@f1-app/api-types';

// Internal API Response DTOs (what our internal APIs return)
export interface DriversApiResponse {
  drivers: DriverPublic[];
  total: number;
}

export interface ConstructorsApiResponse {
  constructors: ConstructorPublic[];
  total: number;
}

export interface CircuitsApiResponse {
  circuits: CircuitPublic[];
  total: number;
}

export interface SeasonsApiResponse {
  seasons: SeasonPublic[];
  total: number;
}

export interface SeasonChampionsApiResponse {
  champions: SeasonChampionWithRelations[];
  total: number;
  season?: string;
}

export interface RaceWinnersApiResponse {
  winners: RaceWinnerWithRelations[];
  total: number;
  season?: string;
}

// Paginated API responses
export type PaginatedDriversResponse = PaginatedResult<DriverPublic>;
export type PaginatedConstructorsResponse = PaginatedResult<ConstructorPublic>;
export type PaginatedCircuitsResponse = PaginatedResult<CircuitPublic>;
export type PaginatedSeasonsResponse = PaginatedResult<SeasonPublic>;
export type PaginatedSeasonChampionsResponse =
  PaginatedResult<SeasonChampionWithRelations>;
export type PaginatedRaceWinnersResponse =
  PaginatedResult<RaceWinnerWithRelations>;

// Common API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    version: string;
    requestId?: string;
  };
}

// Error response types
export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationErrorResponse {
  message: string;
  errors: ValidationError[];
}

// Request types for filtering and searching
export interface ApiQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  season?: string;
  year?: string;
  nationality?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Health check response
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  database: {
    status: 'connected' | 'disconnected';
    replicaSet?: string;
  };
  version: string;
}
