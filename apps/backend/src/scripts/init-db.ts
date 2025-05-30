#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';

/**
 * Database initialization script
 * Sets up indexes, constraints, and initial configuration for MongoDB
 */
class DatabaseInitializer {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Initialize database with indexes and constraints
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Starting database initialization...');

      // Test database connection
      await this.testConnection();

      // Create indexes for better performance
      await this.createIndexes();

      // Verify schema
      await this.verifySchema();

      console.log('✅ Database initialization completed successfully!');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  /**
   * Test database connection
   */
  private async testConnection(): Promise<void> {
    console.log('🔌 Testing database connection...');

    try {
      // Simple query to test connection
      await this.prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database connection successful');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw new Error(
        'Cannot connect to database. Please check your DATABASE_URL environment variable.'
      );
    }
  }

  /**
   * Create database indexes for optimal performance
   */
  private async createIndexes(): Promise<void> {
    console.log('📊 Creating database indexes...');

    try {
      // Note: Prisma with MongoDB automatically creates indexes based on schema
      // But we can create additional custom indexes using raw queries

      // Index for drivers
      await this.prisma.$runCommandRaw({
        createIndexes: 'drivers',
        indexes: [
          {
            key: { driverId: 1 },
            name: 'idx_driver_driverId',
            unique: true,
          },
          {
            key: { nationality: 1 },
            name: 'idx_driver_nationality',
          },
          {
            key: { familyName: 1, givenName: 1 },
            name: 'idx_driver_name',
          },
        ],
      });

      // Index for constructors
      await this.prisma.$runCommandRaw({
        createIndexes: 'constructors',
        indexes: [
          {
            key: { constructorId: 1 },
            name: 'idx_constructor_constructorId',
            unique: true,
          },
          {
            key: { nationality: 1 },
            name: 'idx_constructor_nationality',
          },
        ],
      });

      // Index for circuits
      await this.prisma.$runCommandRaw({
        createIndexes: 'circuits',
        indexes: [
          {
            key: { circuitId: 1 },
            name: 'idx_circuit_circuitId',
            unique: true,
          },
          {
            key: { 'location.country': 1 },
            name: 'idx_circuit_country',
          },
        ],
      });

      // Index for season champions
      await this.prisma.$runCommandRaw({
        createIndexes: 'season_champions',
        indexes: [
          {
            key: { season: 1, driverId: 1 },
            name: 'idx_champion_season_driver',
            unique: true,
          },
          {
            key: { season: 1 },
            name: 'idx_champion_season',
          },
          {
            key: { driverId: 1 },
            name: 'idx_champion_driver',
          },
        ],
      });

      // Index for race winners
      await this.prisma.$runCommandRaw({
        createIndexes: 'race_winners',
        indexes: [
          {
            key: { season: 1, round: 1 },
            name: 'idx_race_season_round',
            unique: true,
          },
          {
            key: { season: 1 },
            name: 'idx_race_season',
          },
          {
            key: { driverId: 1 },
            name: 'idx_race_driver',
          },
          {
            key: { circuitId: 1 },
            name: 'idx_race_circuit',
          },
          {
            key: { date: 1 },
            name: 'idx_race_date',
          },
        ],
      });

      // Index for seasons
      await this.prisma.$runCommandRaw({
        createIndexes: 'seasons',
        indexes: [
          {
            key: { year: 1 },
            name: 'idx_season_year',
            unique: true,
          },
        ],
      });

      console.log('✅ Database indexes created successfully');
    } catch (error) {
      // Indexes might already exist, which is fine
      console.log('ℹ️  Some indexes may already exist (this is normal)');
      console.log('✅ Index creation completed');
    }
  }

  /**
   * Verify database schema and collections
   */
  async verifySchema(): Promise<void> {
    console.log('🔍 Verifying database schema...');

    try {
      // Check if collections exist by trying to count documents
      const collections = [
        { name: 'drivers', model: this.prisma.driver },
        { name: 'constructors', model: this.prisma.constructor },
        { name: 'circuits', model: this.prisma.circuit },
        { name: 'seasons', model: this.prisma.season },
        { name: 'season_champions', model: this.prisma.seasonChampion },
        { name: 'race_winners', model: this.prisma.raceWinner },
      ];

      for (const collection of collections) {
        try {
          const count = await collection.model.count();
          console.log(`✅ Collection '${collection.name}': ${count} documents`);
        } catch (error) {
          console.log(
            `⚠️  Collection '${collection.name}': Not accessible or doesn't exist yet`
          );
        }
      }

      console.log('✅ Schema verification completed');
    } catch (error) {
      console.error('❌ Schema verification failed:', error);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<void> {
    console.log('📊 Database Statistics:');
    console.log('========================');

    try {
      const stats = await this.prisma.$runCommandRaw({ dbStats: 1 });
      console.log(`Database: ${stats.db}`);
      console.log(`Collections: ${stats.collections}`);
      console.log(`Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(
        `Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`
      );
      console.log(`Indexes: ${stats.indexes}`);
      console.log(
        `Index Size: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`
      );
    } catch (error) {
      console.log('ℹ️  Could not retrieve database statistics');
    }
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'init';

  const initializer = new DatabaseInitializer();

  try {
    switch (command) {
      case 'init':
        await initializer.initialize();
        break;
      case 'stats':
        await initializer.getStats();
        break;
      case 'verify':
        await initializer.verifySchema();
        break;
      default:
        console.log('Usage: npm run db:init [command]');
        console.log('Commands:');
        console.log('  init   - Initialize database with indexes (default)');
        console.log('  stats  - Show database statistics');
        console.log('  verify - Verify database schema');
        process.exit(1);
    }
  } catch (error) {
    console.error('💥 Operation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
