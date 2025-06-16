import { Test } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  describe('getApiInfo', () => {
    it('should return comprehensive API information', () => {
      const result = service.getApiInfo();

      expect(result).toHaveProperty('name', 'F1 Champions API');
      expect(result).toHaveProperty('version', '1.0.0');
      expect(result).toHaveProperty(
        'description',
        'API for retrieving Formula 1 championship data including season winners and season race results'
      );
      expect(result).toHaveProperty('documentation');
      expect(result).toHaveProperty('health');
      expect(result).toHaveProperty('endpoints');
      expect(result).toHaveProperty('features');
      expect(result).toHaveProperty('rateLimit');

      // Validate endpoints structure
      expect(Array.isArray(result.endpoints)).toBe(true);
      expect(result.endpoints.length).toBeGreaterThan(0);
      result.endpoints.forEach((endpoint) => {
        expect(endpoint).toHaveProperty('path');
        expect(endpoint).toHaveProperty('method');
        expect(endpoint).toHaveProperty('description');
        expect(endpoint).toHaveProperty('tag');
      });

      // Validate features
      expect(Array.isArray(result.features)).toBe(true);
      expect(result.features.length).toBeGreaterThan(0);

      // Validate rate limit structure
      expect(result.rateLimit).toHaveProperty('requests', 30);
      expect(result.rateLimit).toHaveProperty('window', '1 minute');
    });
  });
});
