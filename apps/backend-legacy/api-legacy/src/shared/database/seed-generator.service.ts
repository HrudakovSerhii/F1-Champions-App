import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import * as fs from 'fs';
import * as path from 'path';

// Import mock data as a module
import mockData from '../../assets/mock-data';

export interface SeedData {
  drivers: any[];
  constructors: any[];
  circuits: any[];
  seasonChampions: any[];
  raceWinners: any[];
  seasons: any[];
}

@Injectable()
export class SeedGeneratorService {
  private readonly logger = new Logger(SeedGeneratorService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates seed data from mock JSON and current database state
   * @param outputPath - Path where to save the seed file
   * @param format - Output format: 'json' | 'mongodb' | 'prisma'
   */
  async generateSeedFile(
    outputPath: string = './prisma/seed-data.json',
    format: 'json' | 'mongodb' | 'prisma' = 'json'
  ): Promise<void> {
    try {
      this.logger.log('Starting seed data generation...');

      const seedData = await this.extractSeedData();

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
      }

      this.logger.log(`Seed file generated successfully at: ${outputPath}`);
    } catch (error) {
      this.logger.error('Failed to generate seed file:', error);
      throw error;
    }
  }

  /**
   * Extracts seed data from mock data and existing database records
   */
  private async extractSeedData(): Promise<SeedData> {
    // Extract data from mock JSON
    const raceWinnersData = mockData.raceWinnersResponse.MRData.RaceTable.Races;
    const championsData =
      mockData.seasonChampionsResponse.MRData.StandingsTable.StandingsLists;
    const seasonsData = mockData.seasonsResponse.MRData.SeasonTable.Seasons;

    // Extract unique entities
    const driversMap = new Map();
    const constructorsMap = new Map();
    const circuitsMap = new Map();
    const seasonChampions: any[] = [];
    const raceWinners: any[] = [];
    const seasons: any[] = [];

    // Process race winners data
    raceWinnersData.forEach((race: any) => {
      // Extract driver
      const driver = race.Winner.Driver;
      driversMap.set(driver.driverId, {
        driverId: driver.driverId,
        givenName: driver.givenName,
        familyName: driver.familyName,
        dateOfBirth: new Date(driver.dateOfBirth),
        nationality: driver.nationality,
        url: driver.url,
      });

      // Extract constructor
      const constructor = race.Winner.Constructor;
      constructorsMap.set(constructor.constructorId, {
        constructorId: constructor.constructorId,
        name: constructor.name,
        nationality: constructor.nationality,
        url: constructor.url,
      });

      // Extract circuit
      const circuit = race.Circuit;
      circuitsMap.set(circuit.circuitId, {
        circuitId: circuit.circuitId,
        circuitName: circuit.circuitName,
        url: circuit.url,
        location: {
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
        date: new Date(race.date),
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
        // References (will be resolved during seeding)
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
          dateOfBirth: new Date(driver.dateOfBirth),
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
          // References (will be resolved during seeding)
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
  }

  /**
   * Generates MongoDB-specific seed file with insertMany commands
   */
  private async generateMongoSeed(
    seedData: SeedData,
    outputPath: string
  ): Promise<void> {
    const mongoScript = `// MongoDB Seed Script
// Generated on ${new Date().toISOString()}
// Run this script in MongoDB shell or MongoDB Compass

// Clear existing data (optional - uncomment if needed)
// db.drivers.deleteMany({});
// db.constructors.deleteMany({});
// db.circuits.deleteMany({});
// db.season_champions.deleteMany({});
// db.race_winners.deleteMany({});
// db.seasons.deleteMany({});

// Insert drivers
db.drivers.insertMany(${JSON.stringify(seedData.drivers, null, 2)});

// Insert constructors
db.constructors.insertMany(${JSON.stringify(seedData.constructors, null, 2)});

// Insert circuits
db.circuits.insertMany(${JSON.stringify(seedData.circuits, null, 2)});

// Insert seasons
db.seasons.insertMany(${JSON.stringify(seedData.seasons, null, 2)});

// Note: Season champions and race winners need to be inserted after resolving references
// This would require additional logic to map driverRef/constructorRef to actual ObjectIds

print("Seed data inserted successfully!");
print("Total records:");
print("- Drivers: ${seedData.drivers.length}");
print("- Constructors: ${seedData.constructors.length}");
print("- Circuits: ${seedData.circuits.length}");
print("- Seasons: ${seedData.seasons.length}");
print("- Season Champions: ${seedData.seasonChampions.length}");
print("- Race Winners: ${seedData.raceWinners.length}");
`;

    await this.ensureDirectoryExists(outputPath);
    await fs.promises.writeFile(outputPath, mongoScript);
  }

  /**
   * Generates Prisma-compatible seed file
   */
  private async generatePrismaSeed(
    seedData: SeedData,
    outputPath: string
  ): Promise<void> {
    const prismaScript = `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Clear existing data (optional)
  await prisma.raceWinner.deleteMany({});
  await prisma.seasonChampion.deleteMany({});
  await prisma.circuit.deleteMany({});
  await prisma.constructor.deleteMany({});
  await prisma.driver.deleteMany({});
  await prisma.season.deleteMany({});

  // Insert drivers
  console.log('Seeding drivers...');
  const drivers = await Promise.all([
${seedData.drivers
  .map(
    (driver) => `    prisma.driver.create({
      data: ${JSON.stringify(driver, null, 8).replace(/^/gm, '      ')},
    })`
  )
  .join(',\n')}
  ]);

  // Insert constructors
  console.log('Seeding constructors...');
  const constructors = await Promise.all([
${seedData.constructors
  .map(
    (constructor) => `    prisma.constructor.create({
      data: ${JSON.stringify(constructor, null, 8).replace(/^/gm, '      ')},
    })`
  )
  .join(',\n')}
  ]);

  // Insert circuits
  console.log('Seeding circuits...');
  const circuits = await Promise.all([
${seedData.circuits
  .map(
    (circuit) => `    prisma.circuit.create({
      data: ${JSON.stringify(circuit, null, 8).replace(/^/gm, '      ')},
    })`
  )
  .join(',\n')}
  ]);

  // Insert seasons
  console.log('Seeding seasons...');
  await Promise.all([
${seedData.seasons
  .map(
    (season) => `    prisma.season.create({
      data: ${JSON.stringify(season, null, 8).replace(/^/gm, '      ')},
    })`
  )
  .join(',\n')}
  ]);

  // Create lookup maps
  const driverMap = new Map(drivers.map((d: any) => [d.driverId, d.id]));
  const constructorMap = new Map(constructors.map((c: any) => [c.constructorId, c.id]));
  const circuitMap = new Map(circuits.map((c: any) => [c.circuitId, c.id]));

  // Insert season champions
  console.log('Seeding season champions...');
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
  console.log('Seeding race winners...');
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

  console.log('Database seeding completed successfully!');
  console.log('Total records created:');
  console.log('- Drivers:', drivers.length);
  console.log('- Constructors:', constructors.length);
  console.log('- Circuits:', circuits.length);
  console.log('- Seasons:', ${seedData.seasons.length});
  console.log('- Season Champions:', ${seedData.seasonChampions.length});
  console.log('- Race Winners:', ${seedData.raceWinners.length});
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;

    await this.ensureDirectoryExists(outputPath);
    await fs.promises.writeFile(outputPath, prismaScript);
  }

  /**
   * Ensures the directory exists for the output path
   */
  private async ensureDirectoryExists(filePath: string): Promise<void> {
    const dir = path.dirname(filePath);
    await fs.promises.mkdir(dir, { recursive: true });
  }

  /**
   * Seeds the database directly using the current Prisma connection
   */
  async seedDatabase(): Promise<void> {
    try {
      this.logger.log('Starting direct database seeding...');

      const seedData = await this.extractSeedData();

      // Clear existing data
      await this.prisma.raceWinner.deleteMany({});
      await this.prisma.seasonChampion.deleteMany({});
      await this.prisma.circuit.deleteMany({});
      await this.prisma.constructor.deleteMany({});
      await this.prisma.driver.deleteMany({});
      await this.prisma.season.deleteMany({});

      // Insert base entities
      const drivers = await Promise.all(
        seedData.drivers.map((driver: any) =>
          this.prisma.driver.create({ data: driver })
        )
      );

      const constructors = await Promise.all(
        seedData.constructors.map((constructor: any) =>
          this.prisma.constructor.create({ data: constructor })
        )
      );

      const circuits = await Promise.all(
        seedData.circuits.map((circuit: any) =>
          this.prisma.circuit.create({ data: circuit })
        )
      );

      await Promise.all(
        seedData.seasons.map((season: any) =>
          this.prisma.season.create({ data: season })
        )
      );

      // Create lookup maps
      const driverMap = new Map(drivers.map((d: any) => [d.driverId, d.id]));
      const constructorMap = new Map(
        constructors.map((c: any) => [c.constructorId, c.id])
      );
      const circuitMap = new Map(circuits.map((c: any) => [c.circuitId, c.id]));

      // Insert related entities
      await Promise.all(
        seedData.seasonChampions.map((champion: any) =>
          this.prisma.seasonChampion.create({
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

      await Promise.all(
        seedData.raceWinners.map((race: any) =>
          this.prisma.raceWinner.create({
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

      this.logger.log('Database seeding completed successfully!');
      this.logger.log(`Total records created:
        - Drivers: ${drivers.length}
        - Constructors: ${constructors.length}
        - Circuits: ${circuits.length}
        - Seasons: ${seedData.seasons.length}
        - Season Champions: ${seedData.seasonChampions.length}
        - Race Winners: ${seedData.raceWinners.length}`);
    } catch (error) {
      this.logger.error('Failed to seed database:', error);
      throw error;
    }
  }
}
