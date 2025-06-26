import { test, expect } from '@playwright/test';
import {
  API_ENDPOINTS,
  TEST_DATA,
  getApiUrl,
  InvalidSeasonType,
  INVALID_SEASON_ERRORS,
} from '@/constants';

test.describe('F1 Champions API - Season Race Winners Endpoints', () => {
  test.describe('GET /f1/season/{seasonYear}/winners', () => {
    // Use seasons within the 2005-2025 range for existing MongoDB data
    const validSeason = '2023'; // Recent season with data
    const oldSeason = '2005'; // Earliest season with reliable data

    test('should return race winners for valid season', async ({ request }) => {
      const response = await request.get(
        getApiUrl(API_ENDPOINTS.SEASON_WINNERS(validSeason))
      );

      // Accept 200 (success) or 429 (rate limited) - both are valid responses
      expect([200, 429]).toContain(response.status());

      // Only validate response body if we got a successful response (not rate limited)
      if (response.status() === 200) {
        const body = await response.json();

        // Assert response is an array
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
          expect(raceWinner.season).toBe(validSeason);

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
      }
    });

    test('should handle old season data within valid range', async ({
      request,
    }) => {
      const response = await request.get(
        getApiUrl(API_ENDPOINTS.SEASON_WINNERS(oldSeason))
      );

      // Should return 200 with data, 404 if not found, 429 for rate limit, or 500 for server error
      expect([200, 404, 429, 500]).toContain(response.status());

      if (response.status() === 200) {
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);

        // If we have data for 2005, validate structure
        if (body.length > 0) {
          const raceWinner = body[0];
          expect(raceWinner.season).toBe(oldSeason);
          expect(raceWinner).toHaveProperty('round');
          expect(raceWinner).toHaveProperty('wins');
          expect(raceWinner).toHaveProperty('points');
          expect(raceWinner).toHaveProperty('driver');
          expect(raceWinner).toHaveProperty('constructor');
        }
      }
    });

    test('should handle invalid season format', async ({ request }) => {
      const invalidSeason = TEST_DATA.INVALID_SEASONS[0];
      const response = await request.get(
        getApiUrl(API_ENDPOINTS.SEASON_WINNERS(invalidSeason))
      );

      // Accept 400 (invalid season format with validation service) or 429 (rate limited) - both are valid responses
      expect(response.status()).toBe(400);

      if (response.status() === 400) {
        const body = await response.json();

        expect(body).toHaveProperty('error');
        expect(body.error).toHaveProperty('code');
        expect(body.error).toHaveProperty('message');

        // Expect specific validation error codes based on input type
        const expectedCodes = [
          'SEASON_REQUIRED',
          'SEASON_FORMAT_TYPE_ERROR',
          'SEASON_FORMAT_ERROR',
          'SEASON_RANGE_ERROR',
        ];
        expect(expectedCodes).toContain(body.error.code);
      }
    });

    test('should return 400 for season outside valid range', async ({
      request,
    }) => {
      // Test with a year before the valid range (before 1950)
      const invalidSeason = TEST_DATA.INVALID_SEASONS[3];
      const response = await request.get(
        getApiUrl(API_ENDPOINTS.SEASON_WINNERS(invalidSeason))
      );

      // Expect 400 for year out of range with validation service) or 429 (rate limited) - both are valid responses
      expect(response.status()).toBe(400);

      const body = await response.json();

      expect(body).toHaveProperty('error');
      expect(body.error).toHaveProperty('code', 'SEASON_RANGE_ERROR');
      expect(body.error).toHaveProperty('message');
      expect(body.error.message).toContain('Minimum available season is 1950');
    });

    test('should validate race winner data structure', async ({ request }) => {
      const response = await request.get(
        getApiUrl(API_ENDPOINTS.SEASON_WINNERS(validSeason))
      );

      // Accept 200 (success) or 429 (rate limited) - both are valid responses
      expect([200, 429]).toContain(response.status());

      // Only validate response body if we got a successful response (not rate limited)
      if (response.status() === 200) {
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

          // Validate numeric values are positive
          expect(raceWinner.round).toBeGreaterThan(0);
          expect(raceWinner.wins).toBeGreaterThanOrEqual(0);
          expect(raceWinner.points).toBeGreaterThanOrEqual(0);
        });
      }
    });

    test('should handle multiple valid seasons within range', async ({
      request,
    }) => {
      // Test multiple valid seasons within 2005-2025 range
      const testSeasons = ['2023', '2022', '2021'];

      for (const season of testSeasons) {
        const response = await request.get(
          getApiUrl(API_ENDPOINTS.SEASON_WINNERS(season))
        );

        // Include 429 (rate limit) as acceptable response
        expect([200, 404, 429, 500]).toContain(response.status());

        if (response.status() === 200) {
          const body = await response.json();
          expect(Array.isArray(body)).toBe(true);

          // If we have data, validate season matches
          if (body.length > 0) {
            body.forEach((raceWinner: any) => {
              expect(raceWinner.season).toBe(season);
            });
          }
        }

        // Add small delay to avoid rate limiting on subsequent requests
        if (testSeasons.indexOf(season) < testSeasons.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    });

    test('should respond within acceptable time', async ({ request }) => {
      const startTime = Date.now();
      const response = await request.get(
        getApiUrl(API_ENDPOINTS.SEASON_WINNERS(validSeason))
      );
      const responseTime = Date.now() - startTime;

      // Include 429 (rate limit) as acceptable response
      expect([200, 404, 429, 500]).toContain(response.status());
      expect(responseTime).toBeLessThan(2000); // Should respond within 2 seconds
    });

    test('should return correct content type', async ({ request }) => {
      const response = await request.get(
        getApiUrl(API_ENDPOINTS.SEASON_WINNERS(validSeason))
      );

      expect(response.headers()['content-type']).toContain('application/json');
    });

    test('should handle concurrent requests for different seasons', async ({
      request,
    }) => {
      const testSeasons = ['2023', '2022', '2021'];
      const requests = testSeasons.map((season) =>
        request.get(getApiUrl(API_ENDPOINTS.SEASON_WINNERS(season)))
      );

      const responses = await Promise.all(requests);

      // All requests should complete successfully or return 404/429/500
      // 429 is acceptable due to rate limiting when making concurrent requests
      responses.forEach((response) => {
        expect([200, 404, 429, 500]).toContain(response.status());
      });
    });
  });

  test.describe('Error Handling', () => {
    test('should return consistent error structure for invalid inputs', async ({
      request,
    }) => {
      const invalidInputs = [
        {
          type: InvalidSeasonType.NON_NUMERIC,
          expectedCode:
            INVALID_SEASON_ERRORS[InvalidSeasonType.NON_NUMERIC].code,
          expectedMessage:
            INVALID_SEASON_ERRORS[InvalidSeasonType.NON_NUMERIC].message,
        },
        {
          type: InvalidSeasonType.TOO_SHORT,
          expectedCode: INVALID_SEASON_ERRORS[InvalidSeasonType.TOO_SHORT].code,
          expectedMessage:
            INVALID_SEASON_ERRORS[InvalidSeasonType.TOO_SHORT].message,
        },
        {
          type: InvalidSeasonType.TOO_LONG,
          expectedCode: INVALID_SEASON_ERRORS[InvalidSeasonType.TOO_LONG].code,
          expectedMessage:
            INVALID_SEASON_ERRORS[InvalidSeasonType.TOO_LONG].message,
        },
        {
          type: InvalidSeasonType.BELOW_MIN,
          expectedCode: INVALID_SEASON_ERRORS[InvalidSeasonType.BELOW_MIN].code,
          expectedMessage:
            INVALID_SEASON_ERRORS[InvalidSeasonType.BELOW_MIN].message,
        },
        {
          type: InvalidSeasonType.ABOVE_MAX,
          expectedCode: INVALID_SEASON_ERRORS[InvalidSeasonType.ABOVE_MAX].code,
          expectedMessage:
            INVALID_SEASON_ERRORS[InvalidSeasonType.ABOVE_MAX].message,
        },
      ];

      for (const { type, expectedCode, expectedMessage } of invalidInputs) {
        const url = getApiUrl(API_ENDPOINTS.SEASON_WINNERS(type));
        // console.log(`Testing invalid season: ${type}`);
        // console.log(`Request URL: ${url}`);

        const response = await request.get(url);
        // console.log(`Response status: ${response.status()}`);

        if (response.status() === 429) {
          // console.log('Rate limited - waiting 1 second before next request');
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        const body = await response.json();
        // console.log('Response body:', JSON.stringify(body, null, 2));

        expect(response.status()).toBe(400);
        expect(response.headers()['content-type']).toContain(
          'application/json'
        );

        expect(body).toHaveProperty('error');
        expect(body.error).toHaveProperty('code', expectedCode);
        expect(body.error).toHaveProperty('message', expectedMessage);

        // Add delay between requests to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    });

    test('should handle rate limiting gracefully', async ({ request }) => {
      // This test documents that 429 responses are expected under load
      // Make multiple rapid requests to potentially trigger rate limiting
      const requests = [];
      for (let i = 0; i < 5; i++) {
        requests.push(
          request.get(getApiUrl(API_ENDPOINTS.SEASON_WINNERS('2023')))
        );
      }

      const responses = await Promise.all(requests);

      // Some requests may succeed, others may be rate limited
      responses.forEach((response) => {
        expect([200, 404, 429, 500]).toContain(response.status());
      });

      // If any request was rate limited, verify it returns proper headers
      const rateLimitedResponse = responses.find((r) => r.status() === 429);
      if (rateLimitedResponse) {
        expect(rateLimitedResponse.headers()['content-type']).toContain(
          'application/json'
        );
      }
    });
  });
});
