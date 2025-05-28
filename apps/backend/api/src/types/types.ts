import type {
  RaceWinnersResponse,
  SeasonChampionsResponse
} from '@f1-app/api-types' with { 'resolution-mode': 'import' };

/**
 * Response type for Ergast API seasons endpoint
 * Used internally by JolpicaF1Service.getSeasons()
 * Not exposed as a public API endpoint
 */
export interface SeasonsResponse {
  MRData: {
    limit: string;
    offset: string;
    series: string;
    total: string;
    url: string;
    xmlns: string;
    SeasonTable: {
      Seasons: Array<{
        season: string;
        url: string;
      }>;
    };
  };
}

export type {
  RaceWinnersResponse,
  SeasonChampionsResponse
};
