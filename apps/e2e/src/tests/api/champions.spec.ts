import { test, expect } from '@playwright/test';
import { API_ENDPOINTS, TEST_DATA, getApiUrl } from '@/constants';

test.describe('F1 Champions API - Champions Endpoints', () => {
  test.describe('GET /f1/champions - All Champions', () => {
    test('should return champions with default parameters', async ({
      request,
    }) => {
      const response = await request.get(getApiUrl(API_ENDPOINTS.CHAMPIONS));

      expect(response.status()).toBe(200);

      const body = await response.json();

      // Assert MRData structure
      expect(body).toHaveProperty('MRData');
      expect(body.MRData).toHaveProperty('limit');
      expect(body.MRData).toHaveProperty('offset');
      expect(body.MRData).toHaveProperty('series');
      expect(body.MRData).toHaveProperty('total');
      expect(body.MRData).toHaveProperty('StandingsTable');

      // Assert default values
      expect(body.MRData.limit).toBe('30');
      expect(body.MRData.offset).toBe('0');
      expect(body.MRData.series).toBe('f1');

      // Assert standings structure
      expect(body.MRData.StandingsTable).toHaveProperty('StandingsLists');
      expect(Array.isArray(body.MRData.StandingsTable.StandingsLists)).toBe(
        true
      );

      // Assert we have champions data
      expect(body.MRData.StandingsTable.StandingsLists.length).toBeGreaterThan(
        0
      );
    });

    test('should handle pagination parameters', async ({ request }) => {
      const limit = 5;
      const offset = 10;
      const response = await request.get(
        `${getApiUrl(API_ENDPOINTS.CHAMPIONS)}?limit=${limit}&offset=${offset}`
      );

      expect(response.status()).toBe(200);

      const body = await response.json();

      expect(body.MRData.limit).toBe(limit.toString());
      expect(body.MRData.offset).toBe(offset.toString());

      // Verify we don't exceed the limit
      expect(
        body.MRData.StandingsTable.StandingsLists.length
      ).toBeLessThanOrEqual(limit);
    });

    test('should validate limit parameter boundaries', async ({ request }) => {
      // Test minimum limit
      const minResponse = await request.get(
        `${getApiUrl(API_ENDPOINTS.CHAMPIONS)}?limit=1`
      );
      expect(minResponse.status()).toBe(200);

      const minBody = await minResponse.json();
      expect(minBody.MRData.limit).toBe('1');
      expect(
        minBody.MRData.StandingsTable.StandingsLists.length
      ).toBeLessThanOrEqual(1);

      // Test maximum limit
      const maxResponse = await request.get(
        `${getApiUrl(API_ENDPOINTS.CHAMPIONS)}?limit=100`
      );
      expect(maxResponse.status()).toBe(200);

      const maxBody = await maxResponse.json();
      expect(maxBody.MRData.limit).toBe('100');
    });

    test('should reject invalid limit parameter', async ({ request }) => {
      // Test limit too high
      const highLimitResponse = await request.get(
        `${getApiUrl(API_ENDPOINTS.CHAMPIONS)}?limit=101`
      );
      expect(highLimitResponse.status()).toBe(400);

      // Test negative limit
      const negativeLimitResponse = await request.get(
        `${getApiUrl(API_ENDPOINTS.CHAMPIONS)}?limit=-1`
      );
      expect(negativeLimitResponse.status()).toBe(400);

      // Test non-numeric limit
      const nonNumericResponse = await request.get(
        `${getApiUrl(API_ENDPOINTS.CHAMPIONS)}?limit=abc`
      );
      expect(nonNumericResponse.status()).toBe(400);
    });

    test('should validate champion data structure', async ({ request }) => {
      const response = await request.get(
        `${getApiUrl(API_ENDPOINTS.CHAMPIONS)}?limit=1`
      );

      expect(response.status()).toBe(200);

      const body = await response.json();
      const standings = body.MRData.StandingsTable.StandingsLists;

      if (standings.length > 0) {
        const firstStanding = standings[0];

        // Assert standing structure
        expect(firstStanding).toHaveProperty('season');
        expect(firstStanding).toHaveProperty('round');
        expect(firstStanding).toHaveProperty('DriverStandings');

        // Assert driver standings
        expect(Array.isArray(firstStanding.DriverStandings)).toBe(true);

        if (firstStanding.DriverStandings.length > 0) {
          const champion = firstStanding.DriverStandings[0];

          // Assert champion structure
          expect(champion).toHaveProperty('position');
          expect(champion).toHaveProperty('positionText');
          expect(champion).toHaveProperty('points');
          expect(champion).toHaveProperty('wins');
          expect(champion).toHaveProperty('Driver');
          expect(champion).toHaveProperty('Constructors');

          // Assert driver structure
          expect(champion.Driver).toHaveProperty('driverId');
          expect(champion.Driver).toHaveProperty('givenName');
          expect(champion.Driver).toHaveProperty('familyName');
          expect(champion.Driver).toHaveProperty('dateOfBirth');
          expect(champion.Driver).toHaveProperty('nationality');
          expect(champion.Driver).toHaveProperty('url');

          // Assert constructors structure
          expect(Array.isArray(champion.Constructors)).toBe(true);
          if (champion.Constructors.length > 0) {
            const constructor = champion.Constructors[0];
            expect(constructor).toHaveProperty('constructorId');
            expect(constructor).toHaveProperty('name');
            expect(constructor).toHaveProperty('nationality');
            expect(constructor).toHaveProperty('url');
          }
        }
      }
    });

    test('should return champions for specific season', async ({ request }) => {
      const season = TEST_DATA.VALID_SEASONS[0]; // Use first valid season from TEST_DATA
      const response = await request.get(
        `${getApiUrl(API_ENDPOINTS.CHAMPIONS)}?season=${season}`
      );

      expect(response.status()).toBe(200);

      const body = await response.json();
      const standings = body.MRData.StandingsTable.StandingsLists;

      if (standings.length > 0) {
        // All standings should be for the requested season
        standings.forEach((standing: any) => {
          expect(standing.season).toBe(season);
        });
      }
    });

    test('should handle invalid season format', async ({ request }) => {
      // Use invalid seasons from TEST_DATA
      for (const invalidSeason of TEST_DATA.INVALID_SEASONS) {
        const response = await request.get(
          `${getApiUrl(API_ENDPOINTS.CHAMPIONS)}?season=${invalidSeason}`
        );
        expect(response.status()).toBe(400);
      }
    });

    test('should handle non-existent season gracefully', async ({
      request,
    }) => {
      // Test season before F1 started (1949 or earlier)
      const response = await request.get(
        `${getApiUrl(API_ENDPOINTS.CHAMPIONS)}?season=1949`
      );

      // Should return 200 with empty data or 404, both are acceptable
      expect([200, 404]).toContain(response.status());

      if (response.status() === 200) {
        const body = await response.json();
        expect(body.MRData.StandingsTable.StandingsLists.length).toBe(0);
      }
    });

    test('should handle future season appropriately', async ({ request }) => {
      const futureYear = new Date().getFullYear() + 10;
      const response = await request.get(
        `${getApiUrl(API_ENDPOINTS.CHAMPIONS)}?season=${futureYear}`
      );

      // Should return 200 with empty data or 404, both are acceptable
      expect([200, 404]).toContain(response.status());

      if (response.status() === 200) {
        const body = await response.json();
        expect(body.MRData.StandingsTable.StandingsLists.length).toBe(0);
      }
    });

    test('should return total count of champions', async ({ request }) => {
      const response = await request.get(getApiUrl(API_ENDPOINTS.CHAMPIONS));

      expect(response.status()).toBe(200);

      const body = await response.json();

      // Assert total is a numeric string
      expect(body.MRData.total).toBeDefined();
      expect(parseInt(body.MRData.total)).toBeGreaterThan(0);

      // Total should be reasonable for F1 history (1950 onwards)
      const currentYear = new Date().getFullYear();
      const expectedMaxTotal = currentYear - 1950 + 1;
      expect(parseInt(body.MRData.total)).toBeLessThanOrEqual(expectedMaxTotal);
    });

    test('should respond within acceptable time', async ({ request }) => {
      const startTime = Date.now();
      const response = await request.get(getApiUrl(API_ENDPOINTS.CHAMPIONS));
      const responseTime = Date.now() - startTime;

      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    });

    test('should return consistent data across multiple requests', async ({
      request,
    }) => {
      // Make two identical requests
      const response1 = await request.get(
        `${getApiUrl(API_ENDPOINTS.CHAMPIONS)}?limit=5`
      );
      const response2 = await request.get(
        `${getApiUrl(API_ENDPOINTS.CHAMPIONS)}?limit=5`
      );

      expect(response1.status()).toBe(200);
      expect(response2.status()).toBe(200);

      const body1 = await response1.json();
      const body2 = await response2.json();

      // Data should be consistent
      expect(body1.MRData.total).toBe(body2.MRData.total);
      expect(body1.MRData.StandingsTable.StandingsLists.length).toBe(
        body2.MRData.StandingsTable.StandingsLists.length
      );
    });
  });

  test.describe('Performance and Load', () => {
    test('should handle concurrent requests', async ({ request }) => {
      const concurrentRequests = 5;
      const requests = [];

      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(
          request.get(`${getApiUrl(API_ENDPOINTS.CHAMPIONS)}?limit=10`)
        );
      }

      const responses = await Promise.all(requests);

      // All requests should succeed
      responses.forEach((response) => {
        expect(response.status()).toBe(200);
      });
    });

    test('should handle edge case parameters', async ({ request }) => {
      // Test offset without results
      const largeOffsetResponse = await request.get(
        `${getApiUrl(API_ENDPOINTS.CHAMPIONS)}?offset=10000`
      );
      expect(largeOffsetResponse.status()).toBe(200);

      const body = await largeOffsetResponse.json();
      expect(body.MRData.StandingsTable.StandingsLists.length).toBe(0);
    });
  });
});
