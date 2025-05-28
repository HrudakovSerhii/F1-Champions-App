import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import type {
  RaceWinnersResponse,
  SeasonChampionsResponse,
} from '../../types/types.js';

import { ERGAST_API } from '../../constants/constants.js';

@Injectable()
export class JolpicaF1Service {
  private readonly logger = new Logger(JolpicaF1Service.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.baseUrl = this.configService.get<string>(
      'JOLPICA_F1_API_URL',
      ERGAST_API
    );
  }

  async getSeasonChampions(
    limit?: number,
    offset?: number,
    season?: string
  ): Promise<SeasonChampionsResponse | null> {
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());
      if (season) params.append('season', season);

      const url = `${this.baseUrl}/driverStandings/1.json?${params.toString()}`;
      this.logger.debug(`Fetching season champions from: ${url}`);

      const response = await firstValueFrom(
        this.httpService.get<SeasonChampionsResponse>(url)
      );

      this.logger.log(`Successfully fetched season champions data`);
      return response.data;
    } catch (error) {
      this.logger.error(
        'Failed to fetch season champions from Jolpica F1 API:',
        error
      );
      return null;
    }
  }

  async getRaceWinners(
    season: string,
    limit?: number,
    offset?: number
  ): Promise<RaceWinnersResponse | null> {
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());

      const url = `${
        this.baseUrl
      }/${season}/results/1.json?${params.toString()}`;
      this.logger.debug(
        `Fetching race winners for season ${season} from: ${url}`
      );

      const response = await firstValueFrom(
        this.httpService.get<RaceWinnersResponse>(url)
      );

      this.logger.log(
        `Successfully fetched race winners data for season ${season}`
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch race winners for season ${season} from Jolpica F1 API:`,
        error
      );
      return null;
    }
  }

  // async getSeasons(): Promise<string[]> {
  //   try {
  //     const url = `${this.baseUrl}/seasons.json?limit=100`;
  //     this.logger.debug(`Fetching seasons from: ${url}`);
  //
  //     const response = await firstValueFrom(
  //       this.httpService.get<SeasonsResponse>(url)
  //     );
  //
  //     const seasons =
  //       response.data?.MRData?.SeasonTable?.Seasons?.map(
  //         (season) => season.season
  //       ) || [];
  //     this.logger.log(`Successfully fetched ${seasons.length} seasons`);
  //     return seasons;
  //   } catch (error) {
  //     this.logger.error('Failed to fetch seasons from Jolpica F1 API:', error);
  //     return [];
  //   }
  // }
}
