import { test, expect } from '@playwright/test';
import { API_ENDPOINTS, TEST_DATA, getApiUrl } from '@/constants';

// Helper function to handle rate-limited requests
async function makeRequestWithRetry(request: any, url: string, maxRetries = 5) {
  // Add initial delay before first request
  await new Promise((resolve) => setTimeout(resolve, 2000));

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await request.get(url);

      if (response.status() !== 429) {
        return response;
      }

      console.log(
        `Rate limited on attempt ${attempt}/${maxRetries} for URL: ${url}`
      );

      if (attempt === maxRetries) {
        throw new Error(
          `Rate limited after ${maxRetries} attempts for URL: ${url}`
        );
      }

      // Longer delays between retries: 2s, 4s, 8s, 16s, 32s
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Waiting ${delay / 1000} seconds before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      console.log(
        `Request failed on attempt ${attempt}/${maxRetries}: ${error.message}`
      );
      // Wait before retry on any error
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

test.describe('F1 Champions API - Seasons Endpoints', () => {
  // Add a delay between test cases
  test.beforeEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });

  test.describe('GET /v1/winners - All Seasons Winners', () => {
    test('should return seasons winners with default parameters', async ({
      request,
    }) => {
      // We used minYear and maxYear params in order to prevent backend to run requests to Jolpi API too much (from 1950 till 2025)
      const minYear = 2015;
      const maxYear = 2023;
      const response = await makeRequestWithRetry(
        request,
        `${getApiUrl(
          API_ENDPOINTS.SEASONS_WINNERS
        )}?minYear=${minYear}&maxYear=${maxYear}`
      );

      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);

      if (body.length > 0) {
        const seasonWinner = body[0];
        expect(seasonWinner).toHaveProperty('season');
        expect(seasonWinner).toHaveProperty('wins');
        expect(seasonWinner).toHaveProperty('driver');
        expect(seasonWinner).toHaveProperty('constructor');

        expect(seasonWinner.driver).toHaveProperty('familyName');
        expect(seasonWinner.driver).toHaveProperty('givenName');
        expect(seasonWinner.driver).toHaveProperty('url');
        expect(seasonWinner.driver).toHaveProperty('nationality');
        expect(seasonWinner.driver).toHaveProperty('driverId');

        expect(seasonWinner.constructor).toHaveProperty('name');
        expect(seasonWinner.constructor).toHaveProperty('url');
        expect(seasonWinner.constructor).toHaveProperty('nationality');
      }
    });

    test('should handle year range parameters', async ({ request }) => {
      const minYear = 2020;
      const maxYear = 2023;
      const response = await makeRequestWithRetry(
        request,
        `${getApiUrl(
          API_ENDPOINTS.SEASONS_WINNERS
        )}?minYear=${minYear}&maxYear=${maxYear}`
      );

      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);

      if (body.length > 0) {
        body.forEach((seasonWinner: any) => {
          const year = parseInt(seasonWinner.season);
          expect(year).toBeGreaterThanOrEqual(minYear);
          expect(year).toBeLessThanOrEqual(maxYear);
        });
      }
    });

    test('should validate year range logic (minYear > maxYear)', async ({
      request,
    }) => {
      const response = await makeRequestWithRetry(
        request,
        `${getApiUrl(API_ENDPOINTS.SEASONS_WINNERS)}?minYear=2023&maxYear=2022`
      );

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body).toHaveProperty('error');
      expect(body.error).toHaveProperty('code', 'YEAR_RANGE_LOGIC_ERROR');
      expect(body.error).toHaveProperty('message');
      expect(body.error.message).toContain('cannot be greater than');
    });

    test('should validate year parameter format', async ({ request }) => {
      const validResponse = await makeRequestWithRetry(
        request,
        `${getApiUrl(API_ENDPOINTS.SEASONS_WINNERS)}?minYear=2020&maxYear=2023`
      );
      expect(validResponse.status()).toBe(200);
    });

    test('should reject invalid year parameters', async ({ request }) => {
      for (const invalidYear of TEST_DATA.INVALID_SEASONS) {
        const response = await makeRequestWithRetry(
          request,
          `${getApiUrl(API_ENDPOINTS.SEASONS_WINNERS)}?minYear=${invalidYear}`
        );

        expect(response.status()).toBe(400);

        const body = await response.json();
        expect(body).toHaveProperty('error');
        expect(body.error).toHaveProperty('code');
        expect(body.error).toHaveProperty('message');

        const expectedCodes = [
          'MINYEAR_REQUIRED',
          'MINYEAR_FORMAT_TYPE_ERROR',
          'MINYEAR_FORMAT_ERROR',
          'MINYEAR_RANGE_ERROR',
        ];
        expect(expectedCodes).toContain(body.error.code);

        // Add delay between requests to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    });

    test('should handle edge case years', async ({ request }) => {
      const response = await makeRequestWithRetry(
        request,
        `${getApiUrl(API_ENDPOINTS.SEASONS_WINNERS)}?minYear=1949&maxYear=1949`
      );

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body).toHaveProperty('error');
      expect(body.error).toHaveProperty('code', 'MINYEAR_RANGE_ERROR');
      expect(body.error).toHaveProperty('message');
      expect(body.error.message).toContain('must be between');
    });

    test('should return consistent data across multiple requests', async ({
      request,
    }) => {
      const response1 = await makeRequestWithRetry(
        request,
        `${getApiUrl(API_ENDPOINTS.SEASONS_WINNERS)}?minYear=2020&maxYear=2023`
      );
      const response2 = await makeRequestWithRetry(
        request,
        `${getApiUrl(API_ENDPOINTS.SEASONS_WINNERS)}?minYear=2020&maxYear=2023`
      );

      expect(response1.status()).toBe(200);
      expect(response2.status()).toBe(200);

      const body1 = await response1.json();
      const body2 = await response2.json();

      expect(body1.length).toBe(body2.length);
      if (body1.length > 0 && body2.length > 0) {
        expect(body1[0].season).toBe(body2[0].season);
      }
    });
  });

  test.describe('Performance and Load', () => {
    test('should handle concurrent requests', async ({ request }) => {
      const concurrentRequests = 3;
      const requests = [];

      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(request.get(getApiUrl(API_ENDPOINTS.SEASONS_WINNERS)));
      }

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.status()).toBe(200);
      });
    });

    test('should respond within acceptable time', async ({ request }) => {
      const startTime = Date.now();
      const response = await request.get(
        getApiUrl(API_ENDPOINTS.SEASONS_WINNERS)
      );
      const responseTime = Date.now() - startTime;

      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(2000);
    });
  });

  test.describe('Error Handling', () => {
    test('should return proper error structure for invalid requests', async ({
      request,
    }) => {
      const response = await makeRequestWithRetry(
        request,
        getApiUrl(API_ENDPOINTS.SEASON_WINNERS('invalid'))
      );

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body).toHaveProperty('error');
      expect(body.error).toHaveProperty('code', 'SEASON_FORMAT_TYPE_ERROR');
      expect(body.error).toHaveProperty('message', 'Season must be a number');
    });

    test('should return correct content type for errors', async ({
      request,
    }) => {
      const response = await makeRequestWithRetry(
        request,
        getApiUrl(API_ENDPOINTS.SEASON_WINNERS('invalid'))
      );

      expect(response.headers()['content-type']).toContain('application/json');
    });
  });
});
