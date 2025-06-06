#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';
import * as console from 'node:console';

/**
 * Database initialization script with Prisma
 * Sets up indexes and configuration for MongoDB
 */
class PrismaManager {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing database...');
      await this.testConnection();
      await this.createIndexes();
      await this.verifySchema();
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Error:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  private async testConnection(): Promise<void> {
    try {
      await this.prisma.$runCommandRaw({ ping: 1 });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error(
        'Cannot connect to database. Check DATABASE_URL environment variable.'
      );
    }
  }

  private async createIndexes(): Promise<void> {
    const indexConfigs = [
      {
        collection: 'drivers',
        indexes: [
          { key: { driverId: 1 }, name: 'idx_driver_driverId', unique: true },
          { key: { nationality: 1 }, name: 'idx_driver_nationality' },
          { key: { familyName: 1, givenName: 1 }, name: 'idx_driver_name' },
        ],
      },
      {
        collection: 'constructors',
        indexes: [
          { key: { name: 1 }, name: 'idx_constructor_name', unique: true },
          { key: { nationality: 1 }, name: 'idx_constructor_nationality' },
        ],
      },
      {
        collection: 'season_winners',
        indexes: [
          {
            key: { season: 1, driverId: 1, constructorId: 1 },
            name: 'idx_season_winner_unique',
            unique: true,
          },
          { key: { season: 1 }, name: 'idx_season_winner_season' },
          { key: { driverId: 1 }, name: 'idx_season_winner_driver' },
          { key: { constructorId: 1 }, name: 'idx_season_winner_constructor' },
        ],
      },
      {
        collection: 'season_race_winners',
        indexes: [
          {
            key: { season: 1, driverId: 1, constructorId: 1 },
            name: 'idx_season_race_winner_unique',
            unique: true,
          },
          { key: { season: 1 }, name: 'idx_season_race_winner_season' },
          {
            key: { season: 1, round: 1 },
            name: 'idx_season_race_winner_season_round',
          },
          { key: { driverId: 1 }, name: 'idx_season_race_winner_driver' },
          {
            key: { constructorId: 1 },
            name: 'idx_season_race_winner_constructor',
          },
          { key: { points: -1 }, name: 'idx_season_race_winner_points_desc' },
        ],
      },
    ];

    try {
      for (const config of indexConfigs) {
        await this.prisma.$runCommandRaw({
          createIndexes: config.collection,
          indexes: config.indexes,
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Indexes might already exist, which is fine
      console.log('ℹ️  Some indexes may already exist');
    }
  }

  async verifySchema(): Promise<void> {
    const collections = [
      { name: 'drivers', count: () => this.prisma.driver.count({}) },
      { name: 'constructors', count: () => this.prisma.constructor.count({}) },
      {
        name: 'season_winners',
        count: () => this.prisma.seasonWinner.count({}),
      },
      {
        name: 'season_race_winners',
        count: () => this.prisma.seasonRaceWinner.count({}),
      },
    ];

    for (const collection of collections) {
      try {
        await collection.count();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        console.log(`⚠️  Collection '${collection.name}' not accessible`);
      }
    }
  }

  async getStats(): Promise<void> {
    try {
      const stats = (await this.prisma.$runCommandRaw({ dbStats: 1 })) as any;
      console.log('📊 Database Statistics:');
      console.log(`Database: ${stats.db || 'Unknown'}`);
      console.log(`Collections: ${stats.collections || 0}`);
      console.log(
        `Data Size: ${
          stats.dataSize ? (stats.dataSize / 1024 / 1024).toFixed(2) : '0.00'
        } MB`
      );
      console.log(
        `Storage Size: ${
          stats.storageSize
            ? (stats.storageSize / 1024 / 1024).toFixed(2)
            : '0.00'
        } MB`
      );
      console.log(`Indexes: ${stats.indexes || 0}`);
      console.log(
        `Index Size: ${
          stats.indexSize ? (stats.indexSize / 1024 / 1024).toFixed(2) : '0.00'
        } MB`
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.log('ℹ️  Could not retrieve database statistics');
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'init';
  const initializer = new PrismaManager();

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
        console.log('Usage: npx ts-node init-prisma.ts [init|stats|verify]');
        process.exit(1);
    }
  } catch (error) {
    console.error('💥 Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
