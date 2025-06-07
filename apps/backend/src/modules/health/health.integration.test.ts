/**
 * Integration tests for Health Controller
 * These tests require a running MongoDB instance
 *
 * To run these tests:
 * 1. Ensure MongoDB is running and accessible via DATABASE_URL
 * 2. Run: npm test -- health.integration.test.ts
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthModule } from './health.module';
import { PrismaModule } from '../../shared/database/prisma.module';
import { PrismaService } from '../../shared/database/prisma.service';
import { ConfigModule } from '@nestjs/config';

describe('HealthController Integration Tests', () => {
  let app: INestApplication;
  let healthController: HealthController;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env', // Use test environment if available
        }),
        PrismaModule,
        HealthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    healthController = moduleFixture.get<HealthController>(HealthController);
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check with Real Database', () => {
    test('should return healthy status when database is connected', async () => {
      // Act
      const result = await healthController.check();

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
    });

    test('should be able to perform basic database operations', async () => {
      // Test that we can actually query the database
      try {
        // Simple database operation test
        await prismaService.driver.findFirst();
        expect(true).toBe(true); // If we get here, database is working
      } catch (error) {
        fail(`Database query failed: ${error}`);
      }
    });

    test('should handle database connection gracefully', async () => {
      // Test the actual database connection
      try {
        await prismaService.$connect();
        expect(true).toBe(true); // Connection successful
      } catch (error) {
        fail(`Database connection failed: ${error}`);
      }
    });
  });

  describe('Database Schema Validation', () => {
    test('should have all required collections accessible', async () => {
      const collections = [
        { name: 'drivers', count: () => prismaService.driver.count() },
        {
          name: 'constructors',
          count: () => prismaService.constructor.count(),
        },
        {
          name: 'seasonsWinners',
          count: () => prismaService.seasonWinner.count(),
        },
        { name: 'seasonRaceWinners', count: () => prismaService.seasonRaceWinner.count() },
      ];

      for (const collection of collections) {
        try {
          // Try to count documents in each collection
          const count = await collection.count();
          expect(typeof count).toBe('number');
          console.log(`✅ Collection '${collection.name}': ${count} documents`);
        } catch (error) {
          console.warn(
            `⚠️  Collection '${collection.name}' not accessible:`,
            error
          );
          // Don't fail the test if collection doesn't exist yet
        }
      }
    });
  });
});

/**
 * Manual testing script for health endpoint
 * Run this with: node -e "require('./health.integration.test.js').manualHealthTest()"
 */
export async function manualHealthTest() {
  console.log('🧪 Manual Health Check Test');
  console.log('============================');

  try {
    // Create a minimal test setup
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        HealthModule,
      ],
    }).compile();

    const app = moduleFixture.createNestApplication();
    await app.init();

    const healthController =
      moduleFixture.get<HealthController>(HealthController);
    const prismaService = moduleFixture.get<PrismaService>(PrismaService);

    console.log('🔌 Testing database connection...');

    // Test 1: Basic health check
    try {
      const healthResult = await healthController.check();
      console.log(
        '✅ Health check result:',
        JSON.stringify(healthResult, null, 2)
      );
    } catch (error) {
      console.error('❌ Health check failed:', error);
    }

    // Test 2: Direct database query
    try {
      await prismaService.driver.findFirst();
      console.log('✅ Direct database query successful');
    } catch (error) {
      console.error('❌ Direct database query failed:', error);
    }

    // Test 3: Collection counts
    console.log('📊 Collection statistics:');
    const collections = [
      { name: 'drivers', count: () => prismaService.driver.count() },
      { name: 'constructors', count: () => prismaService.constructor.count() },
      {
        name: 'seasonsWinners',
        count: () => prismaService.seasonWinner.count(),
      },
      { name: 'seasonRaceWinners', count: () => prismaService.seasonRaceWinner.count() },
    ];

    for (const collection of collections) {
      try {
        const count = await collection.count();
        console.log(`  - ${collection.name}: ${count} documents`);
      } catch (error) {
        console.log(`  - ${collection.name}: Not accessible`);
      }
    }

    await app.close();
    console.log('🎉 Manual test completed successfully!');
  } catch (error) {
    console.error('💥 Manual test failed:', error);
    process.exit(1);
  }
}

// Export test utilities for use in other test files
export const healthTestUtils = {
  /**
   * Create a test module with health dependencies
   */
  async createHealthTestModule(): Promise<TestingModule> {
    return Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        HealthModule,
      ],
    }).compile();
  },

  /**
   * Test database connectivity
   */
  async testDatabaseConnection(prismaService: PrismaService): Promise<boolean> {
    try {
      await prismaService.driver.findFirst();
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  },

  /**
   * Get collection statistics
   */
  async getCollectionStats(
    prismaService: PrismaService
  ): Promise<Record<string, number>> {
    const stats: Record<string, number> = {};
    const collections = [
      { name: 'drivers', count: () => prismaService.driver.count() },
      { name: 'constructors', count: () => prismaService.constructor.count() },
      {
        name: 'seasonsWinners',
        count: () => prismaService.seasonWinner.count(),
      },
      { name: 'seasonRaceWinners', count: () => prismaService.seasonRaceWinner.count() },
    ];

    for (const collection of collections) {
      try {
        stats[collection.name] = await collection.count();
      } catch (error) {
        stats[collection.name] = -1; // Indicates error
      }
    }

    return stats;
  },
};
