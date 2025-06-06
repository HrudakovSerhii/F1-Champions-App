import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import type { JolpiDriverStandingMRData } from '../../types';

import { DEFAULT_EXTERNAL_API_URL } from '../../constants/constants';

@Injectable()
export class JolpicaF1Service {
  private readonly logger = new Logger(JolpicaF1Service.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.baseUrl = this.configService.get<string>(
      'EXTERNAL_API_URL',
      DEFAULT_EXTERNAL_API_URL
    );
  }

  /**
   * Utility function to create delay
   * @param ms - milliseconds to delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generate random delay between min and max milliseconds
   * @param minMs - minimum milliseconds
   * @param maxMs - maximum milliseconds
   */
  private getRandomDelay(minMs: number, maxMs: number): number {
    return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  }

  async getSeasonsWinners(
    yearsRange: string[]
  ): Promise<Array<JolpiDriverStandingMRData | null>> {
    const MIN_DELAY_MS = 2000; // 2 seconds minimum
    const MAX_DELAY_MS = 3000; // 3 seconds maximum

    this.logger.log(
      `Fetching data for ${yearsRange.length} seasons with random rate limiting (${MIN_DELAY_MS}-${MAX_DELAY_MS}ms between requests)`
    );

    const allResults: Array<JolpiDriverStandingMRData | null> = [];
    let successfulRequests = 0;
    let failedRequests = 0;
    let rateLimitedRequests = 0;

    for (let i = 0; i < yearsRange.length; i++) {
      const year = yearsRange[i];

      try {
        // Process individual season request
        const seasonResults = await this.getSeasonWinners(year);

        if (seasonResults) {
          allResults.push(seasonResults);
          successfulRequests++;
        } else {
          allResults.push(null);
          failedRequests++;
        }
      } catch (error: any) {
        if (error?.response?.status === 429) {
          this.logger.warn(
            `Rate limit exceeded (429) for season ${year}. Continuing with remaining seasons...`
          );
          rateLimitedRequests++;
        } else {
          this.logger.error(
            `Failed to fetch data for season ${year}:`,
            error?.message || error
          );
          throw error;
        }
      }

      // Add random delay between requests (except for the last request)
      if (i < yearsRange.length - 1) {
        const randomDelay = this.getRandomDelay(MIN_DELAY_MS, MAX_DELAY_MS);

        await this.delay(randomDelay);
      }
    }

    this.logger.log(
      `Completed fetching data for ${yearsRange.length} seasons. ` +
        `Success: ${successfulRequests}, Failed: ${failedRequests}, Rate Limited: ${rateLimitedRequests}`
    );

    return allResults;
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
