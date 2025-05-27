export const CORS_ORIGIN =
  process.env.NODE_ENV === 'production'
    ? ['https://hrudakovserhii.github.io']
    : ['http://localhost:3000', 'http://localhost:4200'];

export const API_GLOBAL_PREFIX = 'api/v1';

export const ERGAST_API = 'https://api.jolpi.ca/ergast/f1';

export const THROTTLER_LENGTH = 60000; // 1 minute
export const THROTTLER_LIMIT = 30; // 30 request per minute
