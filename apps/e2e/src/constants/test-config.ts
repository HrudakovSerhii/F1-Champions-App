/**
 * Centralized E2E Test Configuration
 * Single source of truth for all environment variables and test constants
 */

// Environment variable parsing with fallbacks
export const TEST_CONFIG = {
  // Application URLs
  FRONTEND_URL: process.env.FE_BASE_URL || 'http://localhost:3000',
  BACKEND_URL: process.env.BE_BASE_URL || 'http://localhost:4000',
  API_PATH: process.env.API_BASE_URL_PATH || '/api/v1',

  // Computed API URL
  get API_BASE_URL() {
    return `${this.BACKEND_URL}${this.API_PATH}`;
  },

  // Test timeouts (in milliseconds)
  TIMEOUTS: {
    DEFAULT: 30000,
    API_RESPONSE: 5000,
    PAGE_LOAD: 10000,
    ELEMENT_WAIT: 5000,
  },

  // Test data constraints
  API_LIMITS: {
    MAX_CHAMPIONS_PER_REQUEST: 100,
    MIN_YEAR: 1950,
    MAX_YEAR: new Date().getFullYear(),
    DEFAULT_LIMIT: 10,
    DEFAULT_OFFSET: 0,
  },

  // Performance thresholds
  PERFORMANCE: {
    API_RESPONSE_TIME_MS: 2000,
    PAGE_LOAD_TIME_MS: 5000,
  },

  // Test environment flags
  IS_CI: process.env.CI === undefined ? false : Boolean(process.env.CI),
  IS_DEBUG: process.env.DEBUG === 'true',

  // Browser configuration
  BROWSERS: {
    HEADLESS: !!process.env.CI,
    SLOW_MO: process.env.CI ? 0 : 100,
  },
} as const;

// API endpoints for easy reference
export const API_ENDPOINTS = {
  ROOT: '/',
  HEALTH: '/health',
  SEASONS_WINNERS: '/f1/winners',
  SEASON_WINNERS: (season: string) => `/f1/season/${season}/winners`,
} as const;

// Error messages for validation
export const ERROR_MESSAGES = {
  INVALID_SEASON: 'Season must be a 4-digit year',
  INVALID_LIMIT: 'Limit must be between 1 and 100',
  SEASON_NOT_FOUND: 'Season not found',
  RATE_LIMIT_EXCEEDED: 'Too Many Requests',
} as const;

// Invalid season types and their expected error responses
export enum InvalidSeasonType {
  NON_NUMERIC = 'abc',
  TOO_SHORT = '19',
  TOO_LONG = '99999',
  BELOW_MIN = '1949',
  ABOVE_MAX = '2026', // We need to use current date year, but it's hard on enums
}

export const INVALID_SEASON_ERRORS = {
  [InvalidSeasonType.NON_NUMERIC]: {
    code: 'SEASON_FORMAT_TYPE_ERROR',
    message: 'Season must be a number',
  },
  [InvalidSeasonType.TOO_SHORT]: {
    code: 'SEASON_FORMAT_ERROR',
    message: 'Season must be exactly 4 digits',
  },
  [InvalidSeasonType.TOO_LONG]: {
    code: 'SEASON_FORMAT_ERROR',
    message: 'Season must be exactly 4 digits',
  },
  [InvalidSeasonType.BELOW_MIN]: {
    code: 'SEASON_RANGE_ERROR',
    message: `Minimum available season is ${TEST_CONFIG.API_LIMITS.MIN_YEAR}`,
  },
  [InvalidSeasonType.ABOVE_MAX]: {
    code: 'SEASON_RANGE_ERROR',
    message: `Maximum available season is ${TEST_CONFIG.API_LIMITS.MAX_YEAR}`,
  },
} as const;

// Common test data
export const TEST_DATA = {
  VALID_SEASONS: ['2023', '2021', '2020', '2010', '1950'],
  INVALID_SEASONS: Object.values(InvalidSeasonType),
  SAMPLE_LIMITS: [1, 5, 10, 25, 50, 100],
  INVALID_LIMITS: [-1, 0, 101, 'abc'],
  SAMPLE_OFFSETS: [0, 10, 50, 100],
} as const;

// Helper function to get full API URL for an endpoint
export function getApiUrl(endpoint: string): string {
  return `${TEST_CONFIG.API_BASE_URL}${endpoint}`;
}

// Helper function to validate configuration
export function validateConfig(): void {
  console.log('🔧 E2E Test Configuration:');
  console.log(`  Frontend URL: ${TEST_CONFIG.FRONTEND_URL}`);
  console.log(`  Backend URL: ${TEST_CONFIG.BACKEND_URL}`);
  console.log(`  API Base URL: ${TEST_CONFIG.API_BASE_URL}`);
  console.log(`  CI Mode: ${TEST_CONFIG.IS_CI}`);
  console.log(`  Debug Mode: ${TEST_CONFIG.IS_DEBUG}`);
}
