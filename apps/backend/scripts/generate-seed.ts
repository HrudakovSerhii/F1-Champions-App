#!/usr/bin/env ts-node

const fs = require('fs');
const path = require('path');

// Import mock data
const mockData = require('../src/assets/mock-data.json');

// Import types from the shared types library
import type {
  Driver,
  Constructor,
  Circuit,
  SeasonChampion,
  RaceWinner,
} from '@f1-app/api-types';

/**
 * Seed data interfaces using the official API types
 *
 * ✅ SUCCESS: We now use the actual API types from @f1-app/api-types for consistency
 * and proper type safety. The types are resolved using a dedicated tsconfig.json
 * in the scripts directory that properly maps the @f1-app/api-types module.
 *
 * The Driver, Constructor, and Circuit types come directly from the shared types
 * library, ensuring perfect alignment with the API specification. For complex
 * nested types like SeasonChampion and RaceWinner, we compose simplified interfaces
 * from the existing API types, optimized for database seeding.
 *
 * Note: Seed interfaces are composed from API types but flattened for database
 * seeding with reference IDs instead of nested objects.
 *
 * To run this script with proper type resolution:
 * npx ts-node --project scripts/tsconfig.json scripts/generate-seed.ts [format] [output]
 */

// Composed interfaces for seed data (based on API types but optimized for seeding)
// These types compose from the API types but are flattened for database seeding
type SeedSeasonChampion = {
  season: string;
  round: string;
  driverRef: string;
  constructorRef: string;
} & Pick<SeasonChampion, 'position' | 'positionText' | 'points' | 'wins'>;

type SeedRaceWinner = {
  winnerDetails: {
    number: string;
    position: string;
    points: string;
    laps: string;
    time: {
      millis: string;
      time: string;
    };
  };
  driverRef: string;
  constructorRef: string;
  circuitRef: string;
} & Pick<RaceWinner, 'season' | 'round' | 'raceName' | 'date' | 'time' | 'url'>;

interface SeedData {
  drivers: Driver[];
  constructors: Constructor[];
  circuits: Circuit[];
  seasonChampions: SeedSeasonChampion[];
  raceWinners: SeedRaceWinner[];
  seasons: { year: string }[];
}

/**
 * CLI script to generate seed files for MongoDB
 * Usage: npm run seed:generate [format] [output-path]
 * Formats: json, mongodb, prisma
 */
class SeedGenerator {
  /**
   * Extracts seed data from mock JSON
   */
  private extractSeedData(): SeedData {
    console.log('Extracting seed data from mock JSON...');

    const raceWinnersData = mockData.raceWinnersResponse.MRData.RaceTable.Races;
    const championsData =
      mockData.seasonChampionsResponse.MRData.StandingsTable.StandingsLists;
    const seasonsData = mockData.seasonsResponse.MRData.SeasonTable.Seasons;

    // Extract unique entities
    const driversMap = new Map<string, Driver>();
    const constructorsMap = new Map<string, Constructor>();
    const circuitsMap = new Map<string, Circuit>();
    const seasonChampions: SeedSeasonChampion[] = [];
    const raceWinners: SeedRaceWinner[] = [];
    const seasons: { year: string }[] = [];

    // Process race winners data
    raceWinnersData.forEach((race: any) => {
      const driver = race.Winner.Driver;
      const constructor = race.Winner.Constructor;
      const circuit = race.Circuit;

      // Extract unique drivers
      driversMap.set(driver.driverId, {
        driverId: driver.driverId,
        givenName: driver.givenName,
        familyName: driver.familyName,
        dateOfBirth: driver.dateOfBirth,
        nationality: driver.nationality,
        url: driver.url,
      });

      // Extract unique constructors
      constructorsMap.set(constructor.constructorId, {
        constructorId: constructor.constructorId,
        name: constructor.name,
        nationality: constructor.nationality,
        url: constructor.url,
      });

      // Extract unique circuits
      circuitsMap.set(circuit.circuitId, {
        circuitId: circuit.circuitId,
        circuitName: circuit.circuitName,
        url: circuit.url,
        Location: {
          lat: circuit.Location.lat,
          long: circuit.Location.long,
          locality: circuit.Location.locality,
          country: circuit.Location.country,
        },
      });

      // Add race winner
      raceWinners.push({
        season: race.season,
        round: race.round,
        raceName: race.raceName,
        date: race.date,
        time: race.time,
        url: race.url,
        winnerDetails: {
          number: race.Winner.number,
          position: race.Winner.position,
          points: race.Winner.points,
          laps: race.Winner.laps,
          time: {
            millis: race.Winner.Time.millis,
            time: race.Winner.Time.time,
          },
        },
        driverRef: driver.driverId,
        constructorRef: constructor.constructorId,
        circuitRef: circuit.circuitId,
      });
    });

    // Process champions data
    championsData.forEach((standingsList: any) => {
      standingsList.DriverStandings.forEach((standing: any) => {
        const driver = standing.Driver;
        const constructor = standing.Constructors[0];

        // Add driver if not exists
        driversMap.set(driver.driverId, {
          driverId: driver.driverId,
          givenName: driver.givenName,
          familyName: driver.familyName,
          dateOfBirth: driver.dateOfBirth,
          nationality: driver.nationality,
          url: driver.url,
        });

        // Add constructor if not exists
        constructorsMap.set(constructor.constructorId, {
          constructorId: constructor.constructorId,
          name: constructor.name,
          nationality: constructor.nationality,
          url: constructor.url,
        });

        // Add season champion
        seasonChampions.push({
          season: standingsList.season,
          position: standing.position,
          positionText: standing.positionText,
          points: standing.points,
          wins: standing.wins,
          round: standingsList.round,
          driverRef: driver.driverId,
          constructorRef: constructor.constructorId,
        });
      });
    });

    // Process seasons data
    seasonsData.forEach((season: any) => {
      seasons.push({
        year: season.season,
      });
    });

    return {
      drivers: Array.from(driversMap.values()),
      constructors: Array.from(constructorsMap.values()),
      circuits: Array.from(circuitsMap.values()),
      seasonChampions,
      raceWinners,
      seasons,
    };
  }

  /**
   * Generates JSON seed file
   */
  private async generateJsonSeed(
    seedData: SeedData,
    outputPath: string
  ): Promise<void> {
    const jsonData = {
      ...seedData,
      metadata: {
        generatedAt: new Date().toISOString(),
        totalRecords: {
          drivers: seedData.drivers.length,
          constructors: seedData.constructors.length,
          circuits: seedData.circuits.length,
          seasonChampions: seedData.seasonChampions.length,
          raceWinners: seedData.raceWinners.length,
          seasons: seedData.seasons.length,
        },
      },
    };

    await this.ensureDirectoryExists(outputPath);
    await fs.promises.writeFile(outputPath, JSON.stringify(jsonData, null, 2));
    console.log(`✅ JSON seed file generated: ${outputPath}`);
  }

  /**
   * Generates MongoDB shell script
   */
  private async generateMongoSeed(
    seedData: SeedData,
    outputPath: string
  ): Promise<void> {
    const mongoScript = `// MongoDB Seed Script
// Generated on ${new Date().toISOString()}
// Run this script in MongoDB shell: mongosh your-database < ${path.basename(
      outputPath
    )}

// Switch to your database
use f1_champions_db;

// Clear existing data (optional - uncomment if needed)
// db.drivers.deleteMany({});
// db.constructors.deleteMany({});
// db.circuits.deleteMany({});
// db.season_champions.deleteMany({});
// db.race_winners.deleteMany({});
// db.seasons.deleteMany({});

// Insert drivers
print("Inserting drivers...");
db.drivers.insertMany(${JSON.stringify(seedData.drivers, null, 2)});

// Insert constructors
print("Inserting constructors...");
db.constructors.insertMany(${JSON.stringify(seedData.constructors, null, 2)});

// Insert circuits
print("Inserting circuits...");
db.circuits.insertMany(${JSON.stringify(seedData.circuits, null, 2)});

// Insert seasons
print("Inserting seasons...");
db.seasons.insertMany(${JSON.stringify(seedData.seasons, null, 2)});

// For season champions and race winners, you'll need to resolve references manually
// or use the Prisma seed script which handles this automatically

print("✅ Basic seed data inserted successfully!");
print("📊 Total records:");
print("- Drivers: ${seedData.drivers.length}");
print("- Constructors: ${seedData.constructors.length}");
print("- Circuits: ${seedData.circuits.length}");
print("- Seasons: ${seedData.seasons.length}");
print("⚠️  Note: Season champions and race winners need reference resolution");
print("   Use the Prisma seed script for complete data insertion");
`;

    await this.ensureDirectoryExists(outputPath);
    await fs.promises.writeFile(outputPath, mongoScript);
    console.log(`✅ MongoDB seed script generated: ${outputPath}`);
  }

  /**
   * Generates Prisma seed script
   */
  private async generatePrismaSeed(
    seedData: SeedData,
    outputPath: string
  ): Promise<void> {
    const prismaScript = `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting database seeding...');

  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    await prisma.raceWinner.deleteMany({});
    await prisma.seasonChampion.deleteMany({});
    await prisma.circuit.deleteMany({});
    await prisma.constructor.deleteMany({});
    await prisma.driver.deleteMany({});
    await prisma.season.deleteMany({});

    // Insert drivers
    console.log('👨‍🏁 Seeding drivers...');
    const drivers = await Promise.all([
${seedData.drivers
  .map(
    (driver) => `      prisma.driver.create({
        data: ${JSON.stringify(driver, null, 10).replace(/^/gm, '        ')},
      })`
  )
  .join(',\n')}
    ]);

    // Insert constructors
    console.log('🏎️  Seeding constructors...');
    const constructors = await Promise.all([
${seedData.constructors
  .map(
    (constructor) => `      prisma.constructor.create({
        data: ${JSON.stringify(constructor, null, 10).replace(
          /^/gm,
          '        '
        )},
      })`
  )
  .join(',\n')}
    ]);

    // Insert circuits
    console.log('🏁 Seeding circuits...');
    const circuits = await Promise.all([
${seedData.circuits
  .map(
    (circuit) => `      prisma.circuit.create({
        data: ${JSON.stringify(circuit, null, 10).replace(/^/gm, '        ')},
      })`
  )
  .join(',\n')}
    ]);

    // Insert seasons
    console.log('📅 Seeding seasons...');
    await Promise.all([
${seedData.seasons
  .map(
    (season) => `      prisma.season.create({
        data: ${JSON.stringify(season, null, 10).replace(/^/gm, '        ')},
      })`
  )
  .join(',\n')}
    ]);

    // Create lookup maps for references
    const driverMap = new Map(drivers.map((d: any) => [d.driverId, d.id]));
    const constructorMap = new Map(constructors.map((c: any) => [c.constructorId, c.id]));
    const circuitMap = new Map(circuits.map((c: any) => [c.circuitId, c.id]));

    // Insert season champions
    console.log('🏆 Seeding season champions...');
    const seasonChampionsData = ${JSON.stringify(
      seedData.seasonChampions,
      null,
      2
    )};
    await Promise.all(
      seasonChampionsData.map((champion: any) =>
        prisma.seasonChampion.create({
          data: {
            season: champion.season,
            position: champion.position,
            positionText: champion.positionText,
            points: champion.points,
            wins: champion.wins,
            round: champion.round,
            driverId: driverMap.get(champion.driverRef)!,
            constructorId: constructorMap.get(champion.constructorRef)!,
          },
        })
      )
    );

    // Insert race winners
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
            constructorId: constructorMap.get(race.constructorRef)!,
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
    console.log('- Season Champions:', ${seedData.seasonChampions.length});
    console.log('- Race Winners:', ${seedData.raceWinners.length});

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('💥 Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Disconnected from database');
  });
`;

    await this.ensureDirectoryExists(outputPath);
    await fs.promises.writeFile(outputPath, prismaScript);
    console.log(`✅ Prisma seed script generated: ${outputPath}`);
  }

  /**
   * Ensures directory exists
   */
  private async ensureDirectoryExists(filePath: string): Promise<void> {
    const dir = path.dirname(filePath);
    await fs.promises.mkdir(dir, { recursive: true });
  }

  /**
   * Main execution method
   */
  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const format = (args[0] || 'json') as 'json' | 'mongodb' | 'prisma';
    const outputPath =
      args[1] ||
      `./prisma/seed-${format}.${
        format === 'mongodb' ? 'js' : format === 'prisma' ? 'ts' : 'json'
      }`;

    console.log(`🎯 Generating ${format} seed file...`);
    console.log(`📁 Output path: ${outputPath}`);

    try {
      const seedData = this.extractSeedData();

      switch (format) {
        case 'json':
          await this.generateJsonSeed(seedData, outputPath);
          break;
        case 'mongodb':
          await this.generateMongoSeed(seedData, outputPath);
          break;
        case 'prisma':
          await this.generatePrismaSeed(seedData, outputPath);
          break;
        default:
          throw new Error(
            `Unsupported format: ${format}. Use: json, mongodb, or prisma`
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
          seedData.seasonChampions.length +
          seedData.raceWinners.length
        } total`
      );
    } catch (error) {
      console.error('❌ Error generating seed file:', error);
      process.exit(1);
    }
  }
}

// Run the script if called directly
if (require.main === module) {
  const generator = new SeedGenerator();
  generator.run();
}
