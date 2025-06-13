import { test, expect } from '@playwright/test';
import { API_ENDPOINTS, TEST_DATA, getApiUrl } from '@/constants';

test.describe('F1 Champions API - Seasons Endpoints', () => {
  test.describe('GET /v1/seasons-winners - All Seasons Winners', () => {
    test('should return seasons winners with default parameters', async ({
      request,
    }) => {
      const response = await request.get(
        getApiUrl(API_ENDPOINTS.SEASONS_WINNERS)
      );

      expect(response.status()).toBe(200);

      const body = await response.json();

      // Assert response is an array
      expect(Array.isArray(body)).toBe(true);

      // If we have data, validate structure
      if (body.length > 0) {
        const seasonWinner = body[0];
        expect(seasonWinner).toHaveProperty('season');
        expect(seasonWinner).toHaveProperty('wins');
        expect(seasonWinner).toHaveProperty('driver');
        expect(seasonWinner).toHaveProperty('constructor');

        // Validate driver structure
        expect(seasonWinner.driver).toHaveProperty('familyName');
        expect(seasonWinner.driver).toHaveProperty('givenName');
        expect(seasonWinner.driver).toHaveProperty('url');
        expect(seasonWinner.driver).toHaveProperty('nationality');
        expect(seasonWinner.driver).toHaveProperty('driverId');

        // Validate constructor structure
        expect(seasonWinner.constructor).toHaveProperty('name');
        expect(seasonWinner.constructor).toHaveProperty('url');
        expect(seasonWinner.constructor).toHaveProperty('nationality');
      }
    });

    test('should handle year range parameters', async ({ request }) => {
      const minYear = '2020';
      const maxYear = '2023';
      const response = await request.get(
        `${getApiUrl(
          API_ENDPOINTS.SEASONS_WINNERS
        )}?minYear=${minYear}&maxYear=${maxYear}`
      );

      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);

      // If we have data, verify years are within range
      if (body.length > 0) {
        body.forEach((seasonWinner: any) => {
          const year = parseInt(seasonWinner.season);
          expect(year).toBeGreaterThanOrEqual(parseInt(minYear));
          expect(year).toBeLessThanOrEqual(parseInt(maxYear));
        });
      }
    });

    test('should validate year range logic (minYear > maxYear)', async ({
      request,
    }) => {
      // Test invalid range where minYear is greater than maxYear
      const response = await request.get(
        `${getApiUrl(API_ENDPOINTS.SEASONS_WINNERS)}?minYear=2023&maxYear=2022`
      );

      // Should return 400 for invalid range logic
      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body).toHaveProperty('error');
      expect(body.error).toHaveProperty('code', 'YEAR_RANGE_LOGIC_ERROR');
      expect(body.error).toHaveProperty('message');
      expect(body.error.message).toContain('cannot be greater than');
    });

    test('should validate year parameter format', async ({ request }) => {
      // Test valid 4-digit year
      const validResponse = await request.get(
        `${getApiUrl(API_ENDPOINTS.SEASONS_WINNERS)}?minYear=2020&maxYear=2023`
      );
      expect(validResponse.status()).toBe(200);
    });

    test('should reject invalid year parameters', async ({ request }) => {
      // Test invalid year formats from TEST_DATA
      for (const invalidYear of TEST_DATA.INVALID_SEASONS) {
        const response = await request.get(
          `${getApiUrl(API_ENDPOINTS.SEASONS_WINNERS)}?minYear=${invalidYear}`
        );
        // Should return 400 for invalid year format with validation service
        expect(response.status()).toBe(400);

        const body = await response.json();
        expect(body).toHaveProperty('error');
        expect(body.error).toHaveProperty('code');
        expect(body.error).toHaveProperty('message');

        // Expect specific validation error codes based on input type
        const expectedCodes = [
          'MINYEAR_REQUIRED',
          'MINYEAR_FORMAT_TYPE_ERROR',
          'MINYEAR_FORMAT_ERROR',
          'MINYEAR_RANGE_ERROR',
        ];
        expect(expectedCodes).toContain(body.error.code);
      }
    });

    test('should handle edge case years', async ({ request }) => {
      // Test year before F1 started (1949 or earlier)
      const response = await request.get(
        `${getApiUrl(API_ENDPOINTS.SEASONS_WINNERS)}?minYear=1949&maxYear=1949`
      );

      // Should return 400 for year out of range with validation service
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
      // Make two identical requests
      const response1 = await request.get(
        `${getApiUrl(API_ENDPOINTS.SEASONS_WINNERS)}?minYear=2020&maxYear=2023`
      );
      const response2 = await request.get(
        `${getApiUrl(API_ENDPOINTS.SEASONS_WINNERS)}?minYear=2020&maxYear=2023`
      );

      expect(response1.status()).toBe(200);
      expect(response2.status()).toBe(200);

      const body1 = await response1.json();
      const body2 = await response2.json();

      // Data should be consistent
      expect(body1.length).toBe(body2.length);
      if (body1.length > 0 && body2.length > 0) {
        expect(body1[0].season).toBe(body2[0].season);
      }
    });
  });

  test.describe('Performance and Load', () => {
    test('should handle concurrent requests', async ({ request }) => {
      const concurrentRequests = 5;
      const requests = [];

      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(request.get(getApiUrl(API_ENDPOINTS.SEASONS_WINNERS)));
      }

      const responses = await Promise.all(requests);

      // All requests should succeed
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
      expect(responseTime).toBeLessThan(2000); // Should respond within 2 seconds
    });
  });

  test.describe('Error Handling', () => {
    test('should return proper error structure for invalid requests', async ({
      request,
    }) => {
      // Test with invalid season format
      const response = await request.get(
        getApiUrl(API_ENDPOINTS.SEASON_WINNERS('invalid'))
      );

      // Should return 400 with specific validation error structure
      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body).toHaveProperty('error');
      expect(body.error).toHaveProperty('code', 'SEASON_FORMAT_TYPE_ERROR');
      expect(body.error).toHaveProperty('message', 'Season must be a number');
    });

    test('should return correct content type for errors', async ({
      request,
    }) => {
      const response = await request.get(
        getApiUrl(API_ENDPOINTS.SEASON_WINNERS('invalid'))
      );

      expect(response.headers()['content-type']).toContain('application/json');
    });
  });
});
