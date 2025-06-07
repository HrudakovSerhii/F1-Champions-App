import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe('getApiInfo', () => {
    it('should return API information', () => {
      const appController = app.get<AppController>(AppController);
      const result = appController.getApiInfo();

      expect(result).toHaveProperty('name', 'F1 Champions API');
      expect(result).toHaveProperty('version', '1.0.0');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('documentation');
      expect(result).toHaveProperty('health');
      expect(result).toHaveProperty('endpoints');
      expect(result).toHaveProperty('features');
      expect(result).toHaveProperty('rateLimit');
      expect(Array.isArray(result.endpoints)).toBe(true);
      expect(Array.isArray(result.features)).toBe(true);
    });
  });
});
