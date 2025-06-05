#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';

import { ExternalDataParserService } from '../shared/transformers';

import jolpiMockData from '../assets/jolpi-driver-standing-mock-data.json';

import type { JolpiDriverStandingMRData } from '../types';

/**
 * Simplified Seed Generator
 * Direct flow: Jolpica → API Types → Database (via Prisma)
 */
class SeedGenerator {
  private prisma: PrismaClient;

  constructor(
    private readonly externalDataParserService: ExternalDataParserService
  ) {
    this.prisma = new PrismaClient();
  }

  async seedDatabase(standingsData: JolpiDriverStandingMRData): Promise<void> {
    const raceTableBDData =
      this.externalDataParserService.extractDBDataFromJolpiDriversStandingList(
        standingsData.MRData.StandingsTable.StandingsLists
      );

    try {
      const drivers = await Promise.all(
        raceTableBDData.drivers.map((driver) =>
          this.prisma.driver.create({
            data: driver,
          })
        )
      );

      const constructors = await Promise.all(
        raceTableBDData.constructors.map((constructor) =>
          this.prisma.constructor.create({
            data: constructo,
          })
        )
      );

      const seasonWinners = await Promise.all(
        raceTableBDData.seasonWinners.map((seasonWinner) =>
          this.prisma.seasonWinner.create({
            data: seasonWinner,
          })
        )
      );

      const seasonRaceWinners = await Promise.all(
        raceTableBDData.seasonRaceWinners.map((seasonRaceWinner) =>
          this.prisma.seasonRaceWinner.create({
            data: seasonRaceWinne,
          })
        )
      );

      console.log('✅ Database seeding completed successfully!');
      console.log('📊 Total records created:');
      console.log('- Drivers:', drivers.length);
      console.log('- Constructors:', constructors.length);
      console.log('- Season Winners:', seasonWinners.length);
      console.log('- Race Winners:', seasonRaceWinners.length);
    } catch (error) {
      console.error('❌ Error during seeding:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async cleanup(): Promise<void> {
    await this.prisma.driver.deleteMany({});
    await this.prisma.constructor.deleteMany({});
    await this.prisma.seasonWinner.deleteMany({});
    await this.prisma.seasonRaceWinner.deleteMany({});
  }

  async run(): Promise<void> {
    try {
      await this.cleanup();
      await this.seedDatabase(jolpiMockData);
    } catch (error) {
      console.error(error);
      process.exit(1);
    } finally {
      await this.prisma.$disconnect();
    }
  }
}

if (require.main === module) {
  const externalDataParserService = new ExternalDataParserService();
  const generator = new SeedGenerator(externalDataParserService);

  generator.run().finally();
}

// Export for use by other scripts
export { SeedGenerator };
