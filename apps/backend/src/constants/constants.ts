export const CORS_ORIGIN = ['http://localhost:4000'];
export const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://your-production-domain.com/api/v1'
    : 'http://localhost:4000/api/v1';

export const DEFAULT_PORT = 4000;

export const DEFAULT_MIN_YEAR = 2020;
export const DEFAULT_MAX_YEAR = 2025;

export const API_GLOBAL_PREFIX = 'api/v1';

export const DEFAULT_EXTERNAL_API_URL = 'https://api.jolpi.ca/ergast/f1';

export const THROTTLER_LENGTH = 60000; // 1 minute
export const THROTTLER_LIMIT = 30; // 30 request per minute
