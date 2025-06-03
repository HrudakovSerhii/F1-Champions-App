import type { components, paths } from './generated-types';

// API Response types
export type HealthResponse = components['schemas']['HealthResponse'];
export type ErrorResponse = components['schemas']['ErrorResponse'];

// Data types
export type SeasonWinner = components['schemas']['SeasonWinner'];
export type SeasonRaceWinner = components['schemas']['SeasonRaceWinner'];
export type Driver = components['schemas']['Driver'];
export type Constructor = components['schemas']['Constructor'];
export type Circuit = components['schemas']['Circuit'];
export type Winner = components['schemas']['Winner'];
export type RaceWinner = components['schemas']['RaceWinner'];

// Path types for type-safe API calls
export type SeasonsPath = paths['/v1/seasons']['get'];
export type RaceWinnersPath =
  paths['/v1/seasons/{seasonYear}/race-winners']['get'];
export type HealthPath = paths['/v1/health']['get'];

// Operation types
export type GetSeasonsWithWinnersOperation = paths['/v1/seasons']['get'];
export type GetSeasonRaceWinnersOperation = paths['/v1/seasons/{seasonYear}/race-winners']['get'];
export type GetHealthOperation = paths['/v1/health']['get'];

// Request/Response types for operations
export type GetSeasonsResponse =
  GetSeasonsWithWinnersOperation['responses']['200']['content']['application/json'];
export type GetRaceWinnersResponse =
  GetSeasonRaceWinnersOperation['responses']['200']['content']['application/json'];
export type GetHealthResponseSuccess =
  GetHealthOperation['responses']['200']['content']['application/json'];
export type GetHealthResponseError =
  GetHealthOperation['responses']['503']['content']['application/json'];

// Parameter types
export type SeasonYearPathParam =
  GetSeasonRaceWinnersOperation['parameters']['path']['seasonYear'];
