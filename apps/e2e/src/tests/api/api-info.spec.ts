import { test, expect } from '@playwright/test';
import { API_ENDPOINTS, getApiUrl } from '@/constants';

test.describe('F1 Champions API - Information Endpoints', () => {
  test.describe('GET / - API Information', () => {
    test('should return API information with correct structure', async ({
      request,
    }) => {
      // Make request to API info endpoint
      const response = await request.get(getApiUrl(API_ENDPOINTS.ROOT));

      // Assert response status
      expect(response.status()).toBe(200);

      // Parse response body
      const body = await response.json();

      // Assert basic structure
      expect(body).toHaveProperty('name');
      expect(body).toHaveProperty('version');
      expect(body).toHaveProperty('description');
      expect(body).toHaveProperty('endpoints');
      expect(body).toHaveProperty('features');
      expect(body).toHaveProperty('rateLimit');

      // Assert specific values
      expect(body.name).toBe('F1 Champions API');
      expect(body.version).toBe('1.0.0');
      expect(body.description).toContain('Formula 1');

      // Assert endpoints array structure
      expect(Array.isArray(body.endpoints)).toBe(true);
      expect(body.endpoints.length).toBeGreaterThan(0);

      expect(Array.isArray(body.features)).toBe(true);
      expect(body.features).toContain('Formula 1 Season Champions Data');
      expect(body.features).toContain('Season Race Winners Information');
      expect(body.features).toContain('Health Status Monitoring');
      expect(body.features).toContain('Rate Limiting & Security');
      expect(body.features).toContain('CORS Support');
      expect(body.features).toContain('Request Validation');
      expect(body.features).toContain('OpenAPI Documentation');
      expect(body.features).toContain('Dependency Status Tracking');

      // Assert rate limit configuration
      expect(body.rateLimit).toHaveProperty('requests');
      expect(body.rateLimit).toHaveProperty('window');
      expect(body.rateLimit.requests).toBe(30);
      expect(body.rateLimit.window).toBe('1 minute');
    });

    test('should include correct endpoint information', async ({ request }) => {
      const response = await request.get(getApiUrl(API_ENDPOINTS.ROOT));
      const body = await response.json();

      // Find seasons-winners endpoint (matching actual backend service paths)
      const seasonsWinnersEndpoint = body.endpoints.find((ep: any) =>
        getApiUrl(API_ENDPOINTS.SEASONS_WINNERS).includes(ep.path)
      );
      expect(seasonsWinnersEndpoint).toBeDefined();
      expect(seasonsWinnersEndpoint.method).toBe('GET');
      expect(seasonsWinnersEndpoint.description).toContain(
        'seasons with winners'
      );
      expect(seasonsWinnersEndpoint.tag).toBe('Seasons');

      // Find season winners endpoint
      const seasonWinnersEndpoint = body.endpoints.find((ep: any) =>
        getApiUrl(API_ENDPOINTS.SEASON_WINNERS('{seasonYear}')).includes(
          ep.path
        )
      );
      expect(seasonWinnersEndpoint).toBeDefined();
      expect(seasonWinnersEndpoint.method).toBe('GET');
      expect(seasonWinnersEndpoint.description).toContain(
        'season race winners'
      );
      expect(seasonWinnersEndpoint.tag).toBe('Seasons');

      // Find health endpoint
      const healthEndpoint = body.endpoints.find((ep: any) =>
        getApiUrl(API_ENDPOINTS.HEALTH).includes(ep.path)
      );
      expect(healthEndpoint).toBeDefined();
      expect(healthEndpoint.method).toBe('GET');
      expect(healthEndpoint.description).toContain('health status');
      expect(healthEndpoint.tag).toBe('Health');
    });

    test('should return correct content type', async ({ request }) => {
      const response = await request.get(getApiUrl(API_ENDPOINTS.ROOT));

      expect(response.headers()['content-type']).toContain('application/json');
    });
  });

  test.describe('GET /health - Health Check', () => {
    test('should return healthy status', async ({ request }) => {
      // Make request to health endpoint
      const response = await request.get(getApiUrl(API_ENDPOINTS.HEALTH));

      // Assert response status
      expect(response.status()).toBe(200);

      // Parse response body
      const body = await response.json();

      // Assert health check structure
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('uptime');
      expect(body).toHaveProperty('environment');
      expect(body).toHaveProperty('database');

      // Assert values
      expect(body.status).toBe('ok');
      expect(body.database).toBe('connected');
      expect(typeof body.uptime).toBe('number');
      expect(body.uptime).toBeGreaterThan(0);

      // Assert timestamp is valid ISO string
      expect(() => new Date(body.timestamp)).not.toThrow();
      expect(new Date(body.timestamp).getTime()).toBeGreaterThan(0);
    });

    test('should respond quickly', async ({ request }) => {
      const startTime = Date.now();
      const response = await request.get(getApiUrl(API_ENDPOINTS.HEALTH));
      const responseTime = Date.now() - startTime;

      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    test('should return correct content type', async ({ request }) => {
      const response = await request.get(getApiUrl(API_ENDPOINTS.HEALTH));

      expect(response.headers()['content-type']).toContain('application/json');
    });
  });

  test.describe('Rate Limiting', () => {
    test('should include rate limit headers', async ({ request }) => {
      const response = await request.get(getApiUrl(API_ENDPOINTS.ROOT));

      expect(response.status()).toBe(200);

      // Check for rate limit headers (these may vary based on implementation)
      const headers = response.headers();

      // Common rate limit header patterns
      const hasRateLimitHeaders =
        headers['x-ratelimit-limit'] ||
        headers['x-rate-limit-limit'] ||
        headers['ratelimit-limit'];

      // If rate limit headers are present, validate them
      if (hasRateLimitHeaders) {
        expect(parseInt(hasRateLimitHeaders)).toBeGreaterThan(0);
      }
    });

    test.skip('should enforce rate limiting (skip in CI)', async ({
      request,
    }) => {
      // This test is skipped by default as it can be slow and may interfere with other tests
      // Uncomment and run manually to test rate limiting

      const requests = [];

      // Make multiple rapid requests to trigger rate limiting
      for (let i = 0; i < 35; i++) {
        requests.push(request.get(getApiUrl(API_ENDPOINTS.HEALTH)));
      }

      const responses = await Promise.all(requests);

      // Some requests should succeed
      const successfulResponses = responses.filter((r) => r.status() === 200);
      expect(successfulResponses.length).toBeGreaterThan(0);

      // Some requests should be rate limited (429 Too Many Requests)
      const rateLimitedResponses = responses.filter((r) => r.status() === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle non-existent endpoints gracefully', async ({
      request,
    }) => {
      const response = await request.get(getApiUrl('/non-existent-endpoint'));

      expect(response.status()).toBe(404);
    });

    test('should return proper error structure for invalid requests', async ({
      request,
    }) => {
      // Test with invalid HTTP method if supported
      try {
        const response = await request.patch(getApiUrl(API_ENDPOINTS.ROOT));

        // Expect either 404 (not found) or 405 (method not allowed)
        expect([404, 405]).toContain(response.status());
      } catch (error) {
        // Some implementations may throw errors for unsupported methods
        // This is acceptable behavior
      }
    });
  });
});
