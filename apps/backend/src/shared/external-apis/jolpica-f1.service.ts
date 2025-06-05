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

  /**
   * Utility function to create delay
   * @param ms - milliseconds to delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Split array into chunks of specified size
   * @param array - array to chunk
   * @param chunkSize - size of each chunk
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  async getSeasonsWinners(
    yearsRange: string[]
  ): Promise<Array<JolpiDriverStandingMRData | null>> {
    try {
      const BATCH_SIZE = 2; // Max 2 requests per batch
      const DELAY_BETWEEN_BATCHES_MS = 1000; // 1-second delay between batches

      this.logger.log(
        `Fetching data for ${yearsRange.length} seasons with rate limiting (${BATCH_SIZE} requests per second)`
      );

      // Split years into batches of 2
      const batches = this.chunkArray(yearsRange, BATCH_SIZE);
      const allResults: Array<JolpiDriverStandingMRData | null> = [];

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];

        this.logger.log(
          `Processing batch ${i + 1}/${batches.length}: [${batch.join(', ')}]`
        );

        // Process batch in parallel (max 2 requests)
        const batchResults = await Promise.all(
          batch.map((year) => this.getSeasonWinners(year))
        );

        allResults.push(...batchResults);

        // Add delay between batches (except for the last batch)
        if (i < batches.length - 1) {
          this.logger.debug(
            `Waiting ${DELAY_BETWEEN_BATCHES_MS}ms before next batch...`
          );
          await this.delay(DELAY_BETWEEN_BATCHES_MS);
        }
      }

      this.logger.log(
        `Completed fetching data for ${yearsRange.length} seasons`
      );
      return allResults;
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
