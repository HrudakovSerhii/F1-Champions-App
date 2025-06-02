import type { components, paths } from './generated-types';

// API Response types
export type SeasonsApiResponse = components['schemas']['SeasonsApiResponse'];
export type SeasonRaceWinnersApiResponse =
  components['schemas']['SeasonRaceWinnersApiResponse'];
export type HealthResponse = components['schemas']['HealthResponse'];
export type ErrorResponse = components['schemas']['ErrorResponse'];

// Data types
export type SeasonWinner = components['schemas']['SeasonWinner'];
export type SeasonRaceWinner = components['schemas']['SeasonRaceWinner'];
export type Driver = components['schemas']['Driver'];
export type Constructor = components['schemas']['Constructor'];
export type Circuit = components['schemas']['Circuit'];
export type RaceWinner = components['schemas']['RaceWinner'];

// Meta types
export type Meta = components['schemas']['Meta'];
export type SeasonMeta = components['schemas']['SeasonMeta'];

// Path types for type-safe API calls
export type SeasonsPath = paths['/seasons']['get'];
export type RaceWinnersPath = paths['/seasons/{season}/race-winners']['get'];
export type HealthPath = paths['/health']['get'];

// Operation types
export type GetSeasonsWithWinnersOperation = paths['/seasons']['get'];
export type GetSeasonRaceWinnersOperation =
  paths['/seasons/{season}/race-winners']['get'];
export type GetHealthOperation = paths['/health']['get'];

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
export type SeasonPathParam =
  GetSeasonRaceWinnersOperation['parameters']['path']['season'];
