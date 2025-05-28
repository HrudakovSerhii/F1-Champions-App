// Import types for creating aliases
import type { components } from './generated-types.js';

// Create convenient type aliases for commonly used types
export type SeasonChampion = components['schemas']['SeasonChampion'];
export type SeasonChampionsResponse =
  components['schemas']['SeasonChampionsResponse'];
export type RaceWinner = components['schemas']['RaceWinner'];
export type RaceWinnersResponse = components['schemas']['RaceWinnersResponse'];
export type Driver = components['schemas']['Driver'];
export type Constructor = components['schemas']['Constructor'];
export type Circuit = components['schemas']['Circuit'];
export type ErrorResponse = components['schemas']['ErrorResponse'];
