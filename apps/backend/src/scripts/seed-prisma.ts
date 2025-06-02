import { PrismaClient } from '@prisma/client';
import { SeedGenerator } from './generate-seed';

const prisma = new PrismaClient();

/**
 * Prisma Seed Executor
 * Uses SeedGenerator to extract seed data and execute Prisma seeding directly
 */
class PrismaSeedExecutor {
  private seedGenerator: SeedGenerator;

  constructor() {
    this.seedGenerator = new SeedGenerator();
  }

  /**
   * Execute seeding using data from SeedGenerator
   */
  async execute(): Promise<void> {
    try {
      console.log('🚀 Starting Prisma seeding via SeedGenerator...');

      // Get seed data from SeedGenerator
      console.log('📊 Extracting seed data...');
      const seedData = await this.seedGenerator.extractSeedData();

      // Execute seeding with extracted data
      console.log('🧹 Clearing existing data...');
      await prisma.raceWinner.deleteMany({});
      await prisma.seasonWinner.deleteMany({});
      await prisma.circuit.deleteMany({});
      await prisma.driver.deleteMany({});
      await prisma.constructor.deleteMany({});
      await prisma.season.deleteMany({});

      console.log('🏎️  Seeding constructors...');
      const constructors = await Promise.all(
        seedData.constructors.map((constructor) =>
          prisma.constructor.create({
            data: {
              constructorId: constructor.constructorId,
              name: constructor.name,
              nationality: constructor.nationality,
              url: constructor.url,
            },
          })
        )
      );

      const constructorIdToDbIdMap = new Map();
      seedData.constructors.forEach((constructor, index) => {
        constructorIdToDbIdMap.set(
          constructor.constructorId,
          constructors[index].id
        );
      });

      console.log('👨‍🏁 Seeding drivers...');
      const drivers = await Promise.all(
        seedData.drivers.map((driver) =>
          prisma.driver.create({
            data: {
              driverId: driver.driverId,
              givenName: driver.givenName,
              familyName: driver.familyName,
              dateOfBirth: new Date(driver.dateOfBirth),
              nationality: driver.nationality,
              url: driver.url,
              constructorId: constructorIdToDbIdMap.get(driver.constructorId)!,
            },
          })
        )
      );

      console.log('🏁 Seeding circuits...');
      const circuits = await Promise.all(
        seedData.circuits.map((circuit) =>
          prisma.circuit.create({
            data: {
              circuitId: circuit.circuitId,
              name: circuit.name,
              url: circuit.url,
            },
          })
        )
      );

      console.log('📅 Seeding seasons...');
      await Promise.all(
        seedData.seasons.map((season) =>
          prisma.season.create({
            data: {
              year: season.year,
            },
          })
        )
      );

      const driverMap = new Map(drivers.map((d: any) => [d.driverId, d.id]));
      const circuitMap = new Map(circuits.map((c: any) => [c.circuitId, c.id]));

      console.log('🏆 Seeding season winners...');
      await Promise.all(
        seedData.seasonWinners.map((winner) =>
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
      await Promise.all(
        seedData.raceWinners.map((race) =>
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
      console.log('- Seasons:', seedData.seasons.length);
      console.log('- Season Winners:', seedData.seasonWinners.length);
      console.log('- Race Winners:', seedData.raceWinners.length);
    } catch (error) {
      console.error('❌ Prisma seeding failed:', error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  const executor = new PrismaSeedExecutor();
  await executor.execute();
}

// Auto-execute when run directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('🎉 Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}
