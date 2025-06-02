#!/usr/bin/env ts-node

import { SeedData } from '../types/seed.types';
import { TransformationService } from '../utils/api.utils';

const fs = require('fs');
const path = require('path');
import mockData from '../assets/mock-data.json';

/**
 * CLI script to generate seed files for MongoDB
 * Usage: npm run seed:generate [format] [output-path]
 * Formats: mongodb, prisma
 */
class SeedGenerator {
  private transformationService: TransformationService;

  constructor() {
    this.transformationService = new TransformationService();
  }

  /**
   * Extract and transform seed data from mock data
   */
  extractSeedData(): SeedData {
    console.log('Extracting seed data using TransformationService...');

    const standingsData = mockData.seasonChampionsResponse;
    const raceData = mockData.raceWinnersResponse;

    const seedData = this.transformationService.transformJolpicaToSeedData(
      standingsData,
      raceData
    );

    console.log('✅ Seed data extracted successfully');
    console.log(
      `📊 Extracted: ${seedData.drivers.length} drivers, ${seedData.constructors.length} constructors, ${seedData.circuits.length} circuits, ${seedData.seasons.length} seasons, ${seedData.seasonWinners.length} season winners, ${seedData.raceWinners.length} race winners`
    );

    return seedData;
  }

  private async generateMongoSeed(
    seedData: SeedData,
    outputPath: string
  ): Promise<void> {
    const mongoScript = `// MongoDB Seed Script
// Generated on ${new Date().toISOString()}

use f1_champions_db;

// Insert drivers
db.drivers.insertMany(${JSON.stringify(seedData.drivers, null, 2)});

// Insert constructors
db.constructors.insertMany(${JSON.stringify(seedData.constructors, null, 2)});

// Insert circuits
db.circuits.insertMany(${JSON.stringify(seedData.circuits, null, 2)});

// Insert seasons
db.seasons.insertMany(${JSON.stringify(seedData.seasons, null, 2)});

print("✅ Basic seed data inserted successfully!");
print("📊 Total records:");
print("- Drivers: ${seedData.drivers.length}");
print("- Constructors: ${seedData.constructors.length}");
print("- Circuits: ${seedData.circuits.length}");
print("- Seasons: ${seedData.seasons.length}");
print("⚠️  Note: Season winners and race winners need reference resolution");
print("   Use the Prisma seed script for complete data insertion");
`;

    await this.ensureDirectoryExists(outputPath);
    await fs.promises.writeFile(outputPath, mongoScript);
    console.log(`✅ MongoDB seed script generated: ${outputPath}`);
  }

  private async generatePrismaSeed(
    seedData: SeedData,
    outputPath: string
  ): Promise<void> {
    const prismaScript = `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting database seeding...');

  try {
    console.log('🧹 Clearing existing data...');
    await prisma.raceWinner.deleteMany({});
    await prisma.seasonWinner.deleteMany({});
    await prisma.circuit.deleteMany({});
    await prisma.driver.deleteMany({});
    await prisma.constructor.deleteMany({});
    await prisma.season.deleteMany({});

    console.log('🏎️  Seeding constructors...');
    const constructors = await Promise.all([
${seedData.constructors
  .map(
    (constructor, index) => `      prisma.constructor.create({
        data: {
          constructorId: "${constructor.constructorId}",
          name: "${constructor.name}",
          nationality: "${constructor.nationality}",
          url: "${constructor.url}"
        },
      })`
  )
  .join(',\n')}
    ]);

    const constructorIdToDbIdMap = new Map();
${seedData.constructors
  .map(
    (constructor, index) =>
      `    constructorIdToDbIdMap.set("${constructor.constructorId}", constructors[${index}].id);`
  )
  .join('\n')}

    console.log('👨‍🏁 Seeding drivers...');
    const drivers = await Promise.all([
${seedData.drivers
  .map(
    (driver) => `      prisma.driver.create({
        data: {
          driverId: "${driver.driverId}",
          givenName: "${driver.givenName}",
          familyName: "${driver.familyName}",
          dateOfBirth: new Date("${driver.dateOfBirth}"),
          nationality: "${driver.nationality}",
          url: "${driver.url}",
          constructorId: constructorIdToDbIdMap.get("${driver.constructorId}")!
        },
      })`
  )
  .join(',\n')}
    ]);

    console.log('🏁 Seeding circuits...');
    const circuits = await Promise.all([
${seedData.circuits
  .map(
    (circuit) => `      prisma.circuit.create({
        data: {
          circuitId: "${circuit.circuitId}",
          name: "${circuit.name}",
          url: "${circuit.url}"
        },
      })`
  )
  .join(',\n')}
    ]);

    console.log('📅 Seeding seasons...');
    await Promise.all([
${seedData.seasons
  .map(
    (season) => `      prisma.season.create({
        data: {
          year: "${season.year}"
        },
      })`
  )
  .join(',\n')}
    ]);

    const driverMap = new Map(drivers.map((d: any) => [d.driverId, d.id]));
    const circuitMap = new Map(circuits.map((c: any) => [c.circuitId, c.id]));

    console.log('🏆 Seeding season winners...');
    const seasonWinnersData = ${JSON.stringify(
      seedData.seasonWinners,
      null,
      2
    )};
    await Promise.all(
      seasonWinnersData.map((winner: any) =>
        prisma.seasonWinner.create({
          data: {
            season: winner.season,
            position: winner.position,
            positionText: winner.positionText,
            points: winner.points,
            wins: winner.wins,
            round: winner.round,
            driverId: driverMap.get(winner.driverRef)!,
            constructorId: constructorIdToDbIdMap.get(winner.constructorRef)!,
          },
        })
      )
    );

    console.log('🥇 Seeding race winners...');
    const raceWinnersData = ${JSON.stringify(seedData.raceWinners, null, 2)};
    await Promise.all(
      raceWinnersData.map((race: any) =>
        prisma.raceWinner.create({
          data: {
            season: race.season,
            round: race.round,
            raceName: race.raceName,
            date: new Date(race.date),
            time: race.time,
            url: race.url,
            winnerDetails: race.winnerDetails,
            circuitId: circuitMap.get(race.circuitRef)!,
            driverId: driverMap.get(race.driverRef)!,
            constructorId: constructorIdToDbIdMap.get(race.constructorRef)!,
          },
        })
      )
    );

    console.log('✅ Database seeding completed successfully!');
    console.log('📊 Total records created:');
    console.log('- Drivers:', drivers.length);
    console.log('- Constructors:', constructors.length);
    console.log('- Circuits:', circuits.length);
    console.log('- Seasons:', ${seedData.seasons.length});
    console.log('- Season Winners:', ${seedData.seasonWinners.length});
    console.log('- Race Winners:', ${seedData.raceWinners.length});

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(async () => {
    console.log('🎉 Seeding completed successfully!');
  })
  .catch(async (e) => {
    console.error('💥 Seeding failed:', e);
    process.exit(1);
  });
`;

    await this.ensureDirectoryExists(outputPath);
    await fs.promises.writeFile(outputPath, prismaScript);
    console.log(`✅ Prisma seed script generated: ${outputPath}`);
  }

  private async ensureDirectoryExists(filePath: string): Promise<void> {
    const dir = path.dirname(filePath);
    await fs.promises.mkdir(dir, { recursive: true });
  }

  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const format = (args[0] || 'prisma') as 'mongodb' | 'prisma';
    const outputPath =
      args[1] ||
      `./prisma/seed-${format}.${format === 'mongodb' ? 'js' : 'ts'}`;

    console.log(`🎯 Generating ${format} seed file...`);
    console.log(`📁 Output path: ${outputPath}`);

    try {
      const seedData = this.extractSeedData();

      switch (format) {
        case 'mongodb':
          await this.generateMongoSeed(seedData, outputPath);
          break;
        case 'prisma':
          await this.generatePrismaSeed(seedData, outputPath);
          break;
        default:
          throw new Error(
            `Unsupported format: ${format}. Use: mongodb or prisma`
          );
      }

      console.log(`\n🎉 Seed generation completed!`);
      console.log(`📊 Summary:`);
      console.log(`- Format: ${format}`);
      console.log(`- Output: ${outputPath}`);
      console.log(
        `- Records: ${
          seedData.drivers.length +
          seedData.constructors.length +
          seedData.circuits.length +
          seedData.seasons.length +
          seedData.seasonWinners.length +
          seedData.raceWinners.length
        } total`
      );
    } catch (error) {
      console.error('❌ Error generating seed file:', error);
      process.exit(1);
    }
  }

  /**
   * Public method to generate Prisma seed file at specified path
   */
  async generatePrismaSeedFile(outputPath: string): Promise<void> {
    const seedData = this.extractSeedData();
    await this.generatePrismaSeed(seedData, outputPath);
  }
}

if (require.main === module) {
  const generator = new SeedGenerator();
  generator.run();
}

// Export for use by other scripts
export { SeedGenerator };
