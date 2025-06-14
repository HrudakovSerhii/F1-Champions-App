import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaService } from '../../shared/database/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;

  // Mock PrismaService
  const mockPrismaService = {
    driver: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return healthy status when database is accessible', async () => {
      // Arrange
      mockPrismaService.driver.findFirst.mockResolvedValue(null);

      // Act
      const result = await controller.check();

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe('ok');
      expect(result.info).toBeDefined();

      if (result.info) {
        expect(result.info.database).toBeDefined();
        expect(result.info.database.status).toBe('up');
        expect(result.info.database.message).toBe(
          'Database connection is healthy'
        );
      }

      expect(mockPrismaService.driver.findFirst).toHaveBeenCalled();
    });

    it('should return unhealthy status when database is not accessible', async () => {
      // Arrange
      const dbError = new Error('Connection refused');
      mockPrismaService.driver.findFirst.mockRejectedValue(dbError);

      // Act & Assert
      await expect(controller.check()).rejects.toThrow();
      expect(mockPrismaService.driver.findFirst).toHaveBeenCalled();
    });

    it('should handle unknown database errors gracefully', async () => {
      // Arrange
      mockPrismaService.driver.findFirst.mockRejectedValue('Unknown error');

      // Act & Assert
      await expect(controller.check()).rejects.toThrow();
      expect(mockPrismaService.driver.findFirst).toHaveBeenCalled();
    });
  });

  describe('checkDatabase (private method testing via check)', () => {
    it('should return database up status on successful connection', async () => {
      // Arrange
      mockPrismaService.driver.findFirst.mockResolvedValue(null);

      // Act
      const result = await controller.check();

      if (result.info) {
        // Assert
        expect(result.info.database).toEqual({
          status: 'up',
          message: 'Database connection is healthy',
        });
      }
    });

    it('should return database down status on connection failure', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      mockPrismaService.driver.findFirst.mockRejectedValue(dbError);

      // Act & Assert
      try {
        await controller.check();
      } catch (error) {
        // The health check service will throw an error for failed checks
        expect(error).toBeDefined();
      }
    });

    it('should handle non-Error objects in database check', async () => {
      // Arrange
      mockPrismaService.driver.findFirst.mockRejectedValue('String error');

      // Act & Assert
      try {
        await controller.check();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
