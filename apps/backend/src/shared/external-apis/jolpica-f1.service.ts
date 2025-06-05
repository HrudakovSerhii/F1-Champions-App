import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import type { JolpiDriverStandingMRData } from '../../types';

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
    yearsRange: string[]
  ): Promise<Array<JolpiDriverStandingMRData | null>> {
    try {
      return await Promise.all(
        yearsRange.map((year) => this.getSeasonWinners(year))
      );
    } catch (error) {
      this.logger.error(
        'Failed to fetch season champions from Jolpica F1 API:',
        error
      );

      return [];
    }
  }

  async getSeasonWinners(
    season: string
  ): Promise<JolpiDriverStandingMRData | null> {
    try {
      // https://api.jolpi.ca/ergast/f1/2024/driverstandings/
      const url = `${this.baseUrl}/${season}/driverstandings`;
      this.logger.log(url);
      const response = await firstValueFrom(
        this.httpService.get<JolpiDriverStandingMRData>(url)
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to season race winners for season ${season} from Jolpica F1 API:`,
        error
      );

      return null;
    }
  }
}
