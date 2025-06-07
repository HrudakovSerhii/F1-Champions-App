export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
export const F1_CHAMPIONS_API_PATH = API_BASE_URL + '/api/v1';

export const ALL_SEASON_WINNERS_PATH = '/f1/winners';

export const SEASON_WINNERS_PATH = '/f1/season/{seasonYear}/winners';
