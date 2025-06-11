import { test, expect } from '@playwright/test';
import { TEST_DATA, getApiUrl } from '@/constants';

test.describe('F1 Champions API - Race Winners Endpoints', () => {
  test.describe('GET /f1/seasons/{season}/race-winners', () => {
    const validSeason = TEST_DATA.VALID_SEASONS[0]; // Use from TEST_DATA
    const oldSeason = '1950';
    const invalidSeason = TEST_DATA.INVALID_SEASONS[0]; // Use from TEST_DATA

    test('should return race winners for valid season', async ({ request }) => {
      const response = await request.get(
        getApiUrl(`/f1/seasons/${validSeason}/race-winners`)
      );

      expect(response.status()).toBe(200);

      const body = await response.json();

      // Assert MRData structure
      expect(body).toHaveProperty('MRData');
      expect(body.MRData).toHaveProperty('limit');
      expect(body.MRData).toHaveProperty('offset');
      expect(body.MRData).toHaveProperty('series');
      expect(body.MRData).toHaveProperty('total');
      expect(body.MRData).toHaveProperty('RaceTable');

      // Assert default values
      expect(body.MRData.limit).toBe('30');
      expect(body.MRData.offset).toBe('0');
      expect(body.MRData.series).toBe('f1');

      // Assert race table structure
      expect(body.MRData.RaceTable).toHaveProperty('season');
      expect(body.MRData.RaceTable).toHaveProperty('Races');
      expect(body.MRData.RaceTable.season).toBe(validSeason);
      expect(Array.isArray(body.MRData.RaceTable.Races)).toBe(true);
    });

    test('should handle pagination parameters', async ({ request }) => {
      const limit = 5;
      const offset = 2;
      const response = await request.get(
        `${getApiUrl(
          `/f1/seasons/${validSeason}/race-winners`
        )}?limit=${limit}&offset=${offset}`
      );

      expect(response.status()).toBe(200);

      const body = await response.json();

      expect(body.MRData.limit).toBe(limit.toString());
      expect(body.MRData.offset).toBe(offset.toString());

      // Verify we don't exceed the limit
      expect(body.MRData.RaceTable.Races.length).toBeLessThanOrEqual(limit);
    });

    test('should validate race data structure', async ({ request }) => {
      const response = await request.get(
        `${getApiUrl(`/f1/seasons/${validSeason}/race-winners`)}?limit=1`
      );

      expect(response.status()).toBe(200);

      const body = await response.json();
      const races = body.MRData.RaceTable.Races;

      if (races.length > 0) {
        const race = races[0];

        // Assert race structure
        expect(race).toHaveProperty('season');
        expect(race).toHaveProperty('round');
        expect(race).toHaveProperty('raceName');
        expect(race).toHaveProperty('date');
        expect(race).toHaveProperty('url');
        expect(race).toHaveProperty('Circuit');
        expect(race).toHaveProperty('Results');

        // Assert season matches requested season
        expect(race.season).toBe(validSeason);

        // Assert circuit structure
        expect(race.Circuit).toHaveProperty('circuitId');
        expect(race.Circuit).toHaveProperty('circuitName');
        expect(race.Circuit).toHaveProperty('url');
        expect(race.Circuit).toHaveProperty('Location');

        // Assert location structure
        expect(race.Circuit.Location).toHaveProperty('lat');
        expect(race.Circuit.Location).toHaveProperty('long');
        expect(race.Circuit.Location).toHaveProperty('locality');
        expect(race.Circuit.Location).toHaveProperty('country');

        // Assert results structure (race winners)
        expect(Array.isArray(race.Results)).toBe(true);

        if (race.Results.length > 0) {
          const winner = race.Results[0];

          // Assert winner structure
          expect(winner).toHaveProperty('number');
          expect(winner).toHaveProperty('position');
          expect(winner).toHaveProperty('points');
          expect(winner).toHaveProperty('Driver');
          expect(winner).toHaveProperty('Constructor');

          // Winner should be in position 1
          expect(winner.position).toBe('1');

          // Assert driver structure
          expect(winner.Driver).toHaveProperty('driverId');
          expect(winner.Driver).toHaveProperty('givenName');
          expect(winner.Driver).toHaveProperty('familyName');
          expect(winner.Driver).toHaveProperty('dateOfBirth');
          expect(winner.Driver).toHaveProperty('nationality');
          expect(winner.Driver).toHaveProperty('url');

          // Assert constructor structure
          expect(winner.Constructor).toHaveProperty('constructorId');
          expect(winner.Constructor).toHaveProperty('name');
          expect(winner.Constructor).toHaveProperty('nationality');
          expect(winner.Constructor).toHaveProperty('url');

          // Assert time structure if present
          if (winner.Time) {
            expect(winner.Time).toHaveProperty('time');
          }
        }
      }
    });

    test('should validate date format in race data', async ({ request }) => {
      const response = await request.get(
        `${getApiUrl(`/f1/seasons/${validSeason}/race-winners`)}?limit=1`
      );

      expect(response.status()).toBe(200);

      const body = await response.json();
      const races = body.MRData.RaceTable.Races;

      if (races.length > 0) {
        const race = races[0];

        // Date should be in YYYY-MM-DD format
        expect(race.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

        // Date should be valid
        const raceDate = new Date(race.date);
        expect(raceDate.getTime()).not.toBeNaN();

        // Date should be in the requested season year
        expect(raceDate.getFullYear().toString()).toBe(validSeason);
      }
    });

    test('should validate limit parameter boundaries', async ({ request }) => {
      // Test minimum limit
      const minResponse = await request.get(
        `${getApiUrl(`/f1/seasons/${validSeason}/race-winners`)}?limit=1`
      );
      expect(minResponse.status()).toBe(200);

      const minBody = await minResponse.json();
      expect(minBody.MRData.limit).toBe('1');
      expect(minBody.MRData.RaceTable.Races.length).toBeLessThanOrEqual(1);

      // Test maximum limit
      const maxResponse = await request.get(
        `${getApiUrl(`/f1/seasons/${validSeason}/race-winners`)}?limit=100`
      );
      expect(maxResponse.status()).toBe(200);

      const maxBody = await maxResponse.json();
      expect(maxBody.MRData.limit).toBe('100');
    });

    test('should reject invalid limit parameter', async ({ request }) => {
      // Test limit too high
      const highLimitResponse = await request.get(
        `${getApiUrl(`/f1/seasons/${validSeason}/race-winners`)}?limit=101`
      );
      expect(highLimitResponse.status()).toBe(400);

      // Test negative limit
      const negativeLimitResponse = await request.get(
        `${getApiUrl(`/f1/seasons/${validSeason}/race-winners`)}?limit=-1`
      );
      expect(negativeLimitResponse.status()).toBe(400);

      // Test non-numeric limit
      const nonNumericResponse = await request.get(
        `${getApiUrl(`/f1/seasons/${validSeason}/race-winners`)}?limit=abc`
      );
      expect(nonNumericResponse.status()).toBe(400);
    });

    test('should handle invalid season format', async ({ request }) => {
      const response = await request.get(
        getApiUrl(`/f1/seasons/${invalidSeason}/race-winners`)
      );

      expect(response.status()).toBe(400);
    });

    test('should handle non-existent season', async ({ request }) => {
      // Test season before F1 started
      const response = await request.get(
        getApiUrl('/f1/seasons/1949/race-winners')
      );

      // Should return 404 or 200 with empty data
      expect([200, 404]).toContain(response.status());

      if (response.status() === 200) {
        const body = await response.json();
        expect(body.MRData.RaceTable.Races.length).toBe(0);
      }
    });

    test('should handle future season appropriately', async ({ request }) => {
      const futureYear = new Date().getFullYear() + 10;
      const response = await request.get(
        getApiUrl(`/f1/seasons/${futureYear}/race-winners`)
      );

      // Should return 404 or 200 with empty data
      expect([200, 404]).toContain(response.status());

      if (response.status() === 200) {
        const body = await response.json();
        expect(body.MRData.RaceTable.Races.length).toBe(0);
      }
    });

    test('should return reasonable number of races per season', async ({
      request,
    }) => {
      const response = await request.get(
        getApiUrl(`/f1/seasons/${validSeason}/race-winners`)
      );

      expect(response.status()).toBe(200);

      const body = await response.json();
      const totalRaces = parseInt(body.MRData.total);

      // Modern F1 seasons typically have 20-25 races
      expect(totalRaces).toBeGreaterThan(15);
      expect(totalRaces).toBeLessThan(30);
    });

    test('should return races in chronological order', async ({ request }) => {
      const response = await request.get(
        `${getApiUrl(`/f1/seasons/${validSeason}/race-winners`)}?limit=10`
      );

      expect(response.status()).toBe(200);

      const body = await response.json();
      const races = body.MRData.RaceTable.Races;

      if (races.length > 1) {
        for (let i = 1; i < races.length; i++) {
          const prevRace = races[i - 1];
          const currRace = races[i];

          // Round numbers should increase or dates should be in order
          const prevRound = parseInt(prevRace.round);
          const currRound = parseInt(currRace.round);

          expect(currRound).toBeGreaterThan(prevRound);
        }
      }
    });

    test('should respond within acceptable time', async ({ request }) => {
      const startTime = Date.now();
      const response = await request.get(
        getApiUrl(`/f1/seasons/${validSeason}/race-winners`)
      );
      const responseTime = Date.now() - startTime;

      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    });

    test('should handle historical season data', async ({ request }) => {
      const response = await request.get(
        getApiUrl(`/f1/seasons/${oldSeason}/race-winners`)
      );

      expect(response.status()).toBe(200);

      const body = await response.json();

      // 1950 was the first F1 season, should have race data
      expect(body.MRData.RaceTable.season).toBe(oldSeason);
      expect(body.MRData.RaceTable.Races.length).toBeGreaterThan(0);

      // First season had fewer races than modern seasons
      const totalRaces = parseInt(body.MRData.total);
      expect(totalRaces).toBeLessThan(15);
    });

    test('should return consistent data across multiple requests', async ({
      request,
    }) => {
      // Make two identical requests
      const response1 = await request.get(
        `${getApiUrl(`/f1/seasons/${validSeason}/race-winners`)}?limit=5`
      );
      const response2 = await request.get(
        `${getApiUrl(`/f1/seasons/${validSeason}/race-winners`)}?limit=5`
      );

      expect(response1.status()).toBe(200);
      expect(response2.status()).toBe(200);

      const body1 = await response1.json();
      const body2 = await response2.json();

      // Data should be consistent
      expect(body1.MRData.total).toBe(body2.MRData.total);
      expect(body1.MRData.RaceTable.Races.length).toBe(
        body2.MRData.RaceTable.Races.length
      );

      // First race should be the same
      if (
        body1.MRData.RaceTable.Races.length > 0 &&
        body2.MRData.RaceTable.Races.length > 0
      ) {
        expect(body1.MRData.RaceTable.Races[0].round).toBe(
          body2.MRData.RaceTable.Races[0].round
        );
      }
    });

    test('should handle edge cases with offset', async ({ request }) => {
      // Test large offset
      const largeOffsetResponse = await request.get(
        `${getApiUrl(`/f1/seasons/${validSeason}/race-winners`)}?offset=100`
      );
      expect(largeOffsetResponse.status()).toBe(200);

      const body = await largeOffsetResponse.json();
      expect(body.MRData.RaceTable.Races.length).toBe(0);
    });

    test('should validate geographic coordinates', async ({ request }) => {
      const response = await request.get(
        `${getApiUrl(`/f1/seasons/${validSeason}/race-winners`)}?limit=1`
      );

      expect(response.status()).toBe(200);

      const body = await response.json();
      const races = body.MRData.RaceTable.Races;

      if (races.length > 0) {
        const location = races[0].Circuit.Location;

        // Validate latitude and longitude are valid numbers
        const lat = parseFloat(location.lat);
        const long = parseFloat(location.long);

        expect(lat).toBeGreaterThanOrEqual(-90);
        expect(lat).toBeLessThanOrEqual(90);
        expect(long).toBeGreaterThanOrEqual(-180);
        expect(long).toBeLessThanOrEqual(180);
      }
    });
  });

  test.describe('Performance and Load', () => {
    test('should handle concurrent requests for different seasons', async ({
      request,
    }) => {
      // Use valid seasons from TEST_DATA
      const seasons = TEST_DATA.VALID_SEASONS.slice(0, 3); // Use first 3 valid seasons
      const requests = seasons.map((season) =>
        request.get(
          `${getApiUrl(`/f1/seasons/${season}/race-winners`)}?limit=5`
        )
      );

      const responses = await Promise.all(requests);

      // All requests should succeed
      responses.forEach((response) => {
        expect(response.status()).toBe(200);
      });
    });

    test('should handle multiple pagination requests', async ({ request }) => {
      const testSeason = TEST_DATA.VALID_SEASONS[0]; // Use first valid season
      const paginationRequests = [
        await request.get(
          `${getApiUrl(
            `/f1/seasons/${testSeason}/race-winners`
          )}?limit=5&offset=0`
        ),
        await request.get(
          `${getApiUrl(
            `/f1/seasons/${testSeason}/race-winners`
          )}?limit=5&offset=5`
        ),
        await request.get(
          `${getApiUrl(
            `/f1/seasons/${testSeason}/race-winners`
          )}?limit=5&offset=10`
        ),
      ];

      const responses = await Promise.all(paginationRequests);

      responses.forEach((response) => {
        expect(response.status()).toBe(200);
      });

      // Verify pagination is working correctly
      const bodies = await Promise.all(responses.map((r) => r.json()));

      // Each page should have different race rounds (if enough races exist)
      if (
        bodies[0].MRData.RaceTable.Races.length > 0 &&
        bodies[1].MRData.RaceTable.Races.length > 0
      ) {
        const firstPageFirstRace = bodies[0].MRData.RaceTable.Races[0].round;
        const secondPageFirstRace = bodies[1].MRData.RaceTable.Races[0].round;
        expect(firstPageFirstRace).not.toBe(secondPageFirstRace);
      }
    });
  });
});
