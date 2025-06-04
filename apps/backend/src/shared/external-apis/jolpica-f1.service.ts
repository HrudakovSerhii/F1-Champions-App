import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import type {
  JolpiRaceTableMRData,
  JolpiDriverStandingMRData,
} from '../../types';

import { JOLPI_API_BASE_URL } from '../../constants/constants';

@Injectable()
export class JolpicaF1Service {
  private readonly logger = new Logger(JolpicaF1Service.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.baseUrl = this.configService.get<string>(
      'JOLPI_API_BASE_URL',
      JOLPI_API_BASE_URL
    );
  }

  async getSeasonsWinners(
    limit?: number,
    offset?: number
  ): Promise<JolpiRaceTableMRData | null> {
    try {
      const params = new URLSearchParams();

      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());

      // https://api.jolpi.ca/ergast/f1/results/
      const url = `${this.baseUrl}/results`;

      const response = await firstValueFrom(
        this.httpService.get<JolpiRaceTableMRData>(url)
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        'Failed to fetch season champions from Jolpica F1 API:',
        error
      );

      return null;
    }
  }

  async getSeasonRaceWinners(
    season: string,
    limit?: number,
    offset?: number
  ): Promise<JolpiDriverStandingMRData | null> {
    try {
      const params = new URLSearchParams();

      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());

      // https://api.jolpi.ca/ergast/f1/2024/driverstandings/
      const url = `${this.baseUrl}${season}/driverstandings`;

      const response = await firstValueFrom(
        this.httpService.get<JolpiDriverStandingMRData>(url)
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
}
