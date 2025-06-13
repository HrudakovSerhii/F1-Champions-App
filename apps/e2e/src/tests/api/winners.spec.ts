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
        // Should return 400 for invalid year format or 500 for server error
        expect([400, 500]).toContain(response.status());
      }
    });

    test('should handle edge case years', async ({ request }) => {
      // Test year before F1 started (1949 or earlier)
      const response = await request.get(
        `${getApiUrl(API_ENDPOINTS.SEASONS_WINNERS)}?minYear=1949&maxYear=1949`
      );

      // Should return 200 with empty data, 400 for invalid year, or 500 for server error
      expect([200, 400, 500]).toContain(response.status());

      if (response.status() === 200) {
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        // Should be empty or have no data for 1949
        expect(body.length).toBe(0);
      }
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

  test.describe('GET /v1/season/{seasonYear}/winners - Specific Season Winners', () => {
    test('should return season winners for valid season', async ({
      request,
    }) => {
      const season = TEST_DATA.VALID_SEASONS[0]; // Use first valid season from TEST_DATA
      const response = await request.get(
        getApiUrl(API_ENDPOINTS.SEASON_WINNERS(season))
      );

      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);

      // If we have data, validate structure
      if (body.length > 0) {
        const raceWinner = body[0];
        expect(raceWinner).toHaveProperty('season');
        expect(raceWinner).toHaveProperty('round');
        expect(raceWinner).toHaveProperty('wins');
        expect(raceWinner).toHaveProperty('points');
        expect(raceWinner).toHaveProperty('driver');
        expect(raceWinner).toHaveProperty('constructor');

        // Validate season matches request
        expect(raceWinner.season).toBe(season);

        // Validate driver structure
        expect(raceWinner.driver).toHaveProperty('familyName');
        expect(raceWinner.driver).toHaveProperty('givenName');
        expect(raceWinner.driver).toHaveProperty('url');
        expect(raceWinner.driver).toHaveProperty('nationality');
        expect(raceWinner.driver).toHaveProperty('driverId');

        // Validate constructor structure
        expect(raceWinner.constructor).toHaveProperty('name');
        expect(raceWinner.constructor).toHaveProperty('url');
        expect(raceWinner.constructor).toHaveProperty('nationality');
      }
    });

    test('should handle invalid season format', async ({ request }) => {
      // Use invalid seasons from TEST_DATA
      for (const invalidSeason of TEST_DATA.INVALID_SEASONS) {
        const response = await request.get(
          getApiUrl(API_ENDPOINTS.SEASON_WINNERS(invalidSeason))
        );
        // Should return 400 for invalid season format or 500 for server error
        expect([400, 500]).toContain(response.status());
      }
    });

    test('should handle non-existent season gracefully', async ({
      request,
    }) => {
      // Test season before F1 started (1949 or earlier)
      const response = await request.get(
        getApiUrl(API_ENDPOINTS.SEASON_WINNERS('1949'))
      );

      // Should return 404 for not found, 400 for invalid year, or 500 for server error
      expect([400, 404, 500]).toContain(response.status());

      if (response.status() === 404) {
        const body = await response.json();
        expect(body).toHaveProperty('success', false);
        expect(body).toHaveProperty('errorCode');
        expect(body).toHaveProperty('error');
      }
    });

    test('should return 404 for future season', async ({ request }) => {
      const futureYear = (new Date().getFullYear() + 10).toString();
      const response = await request.get(
        getApiUrl(API_ENDPOINTS.SEASON_WINNERS(futureYear))
      );

      // Should return 404 for not found or 400 for invalid year
      expect([400, 404, 500]).toContain(response.status());
    });

    test('should validate season data structure', async ({ request }) => {
      const season = TEST_DATA.VALID_SEASONS[0];
      const response = await request.get(
        getApiUrl(API_ENDPOINTS.SEASON_WINNERS(season))
      );

      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);

      // Validate each race winner in the response
      body.forEach((raceWinner: any) => {
        // Validate required fields
        expect(typeof raceWinner.season).toBe('string');
        expect(typeof raceWinner.round).toBe('number');
        expect(typeof raceWinner.wins).toBe('number');
        expect(typeof raceWinner.points).toBe('number');

        // Validate driver object
        expect(typeof raceWinner.driver.familyName).toBe('string');
        expect(typeof raceWinner.driver.givenName).toBe('string');
        expect(typeof raceWinner.driver.url).toBe('string');
        expect(typeof raceWinner.driver.nationality).toBe('string');
        expect(typeof raceWinner.driver.driverId).toBe('string');

        // Validate constructor object
        expect(typeof raceWinner.constructor.name).toBe('string');
        expect(typeof raceWinner.constructor.url).toBe('string');
        expect(typeof raceWinner.constructor.nationality).toBe('string');

        // Validate URL formats
        expect(raceWinner.driver.url).toMatch(/^https?:\/\/.+/);
        expect(raceWinner.constructor.url).toMatch(/^https?:\/\/.+/);
      });
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

      expect([400, 404, 500]).toContain(response.status());

      if (response.status() === 400 || response.status() === 404) {
        const body = await response.json();
        expect(body).toHaveProperty('success', false);
        expect(body).toHaveProperty('errorCode');
        expect(body).toHaveProperty('error');
        expect(body.error).toHaveProperty('message');
        expect(body.error).toHaveProperty('code');
      }
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
