import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting database seeding...');

  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    await prisma.raceWinner.deleteMany({});
    await prisma.seasonWinner.deleteMany({}); // Updated model name
    await prisma.circuit.deleteMany({});
    await prisma.driver.deleteMany({});
    await prisma.constructor.deleteMany({});
    await prisma.season.deleteMany({});

    // Insert constructors first (needed for driver relations)
    console.log('🏎️  Seeding constructors...');
    const constructors = await Promise.all([
      prisma.constructor.create({
        data: {
          name: 'Red Bull',
          nationality: 'Austrian',
          url: 'http://en.wikipedia.org/wiki/Red_Bull_Racing',
        },
      }),
      prisma.constructor.create({
        data: {
          name: 'Mercedes',
          nationality: 'German',
          url: 'http://en.wikipedia.org/wiki/Mercedes-Benz_in_Formula_One',
        },
      }),
    ]);

    // Create lookup map for constructors by name (since constructorId is not stored)
    const constructorNameMap = new Map();
    constructorNameMap.set('Red Bull', constructors[0].id);
    constructorNameMap.set('Mercedes', constructors[1].id);

    // Insert drivers with constructor relationships
    console.log('👨‍🏁 Seeding drivers...');
    const drivers = await Promise.all([
      prisma.driver.create({
        data: {
          driverId: 'max_verstappen',
          givenName: 'Max',
          familyName: 'Verstappen',
          dateOfBirth: new Date(
            'Tue Sep 30 1997 02:00:00 GMT+0200 (Central European Summer Time)'
          ),
          nationality: 'Dutch',
          url: 'http://en.wikipedia.org/wiki/Max_Verstappen',
          constructorId: constructorNameMap.get('Unknown')!,
        },
      }),
      prisma.driver.create({
        data: {
          driverId: 'hamilton',
          givenName: 'Lewis',
          familyName: 'Hamilton',
          dateOfBirth: new Date(
            'Mon Jan 07 1985 01:00:00 GMT+0100 (Central European Standard Time)'
          ),
          nationality: 'British',
          url: 'http://en.wikipedia.org/wiki/Lewis_Hamilton',
          constructorId: constructorNameMap.get('Unknown')!,
        },
      }),
    ]);

    // Insert circuits
    console.log('🏁 Seeding circuits...');
    const circuits = await Promise.all([
      prisma.circuit.create({
        data: {
          circuitId: 'bahrain_international',
          name: 'Bahrain International Circuit', // Updated field name
          url: 'http://en.wikipedia.org/wiki/Bahrain_International_Circuit',
        },
      }),
      prisma.circuit.create({
        data: {
          circuitId: 'jeddah_corniche',
          name: 'Jeddah Corniche Circuit', // Updated field name
          url: 'http://en.wikipedia.org/wiki/Jeddah_Corniche_Circuit',
        },
      }),
    ]);

    // Insert seasons
    console.log('📅 Seeding seasons...');
    await Promise.all([
      prisma.season.create({
        data: {
          year: '2023',
        },
      }),
      prisma.season.create({
        data: {
          year: '2022',
        },
      }),
      prisma.season.create({
        data: {
          year: '2021',
        },
      }),
      prisma.season.create({
        data: {
          year: '2020',
        },
      }),
    ]);

    // Create lookup maps for references
    const driverMap = new Map(drivers.map((d: any) => [d.driverId, d.id]));
    const circuitMap = new Map(circuits.map((c: any) => [c.circuitId, c.id]));

    // Insert season winners (updated from season champions)
    console.log('🏆 Seeding season winners...');
    const seasonWinnersData = [
      {
        season: '2023',
        position: '1',
        positionText: '1',
        points: '0',
        wins: '19',
        round: '22',
        driverRef: 'max_verstappen',
        constructorRef: 'red_bull',
      },
      {
        season: '2022',
        position: '1',
        positionText: '1',
        points: '0',
        wins: '15',
        round: '22',
        driverRef: 'max_verstappen',
        constructorRef: 'red_bull',
      },
      {
        season: '2021',
        position: '1',
        positionText: '1',
        points: '0',
        wins: '10',
        round: '22',
        driverRef: 'max_verstappen',
        constructorRef: 'red_bull',
      },
      {
        season: '2020',
        position: '1',
        positionText: '1',
        points: '0',
        wins: '11',
        round: '17',
        driverRef: 'hamilton',
        constructorRef: 'mercedes',
      },
    ];
    await Promise.all(
      seasonWinnersData.map((winner: any) => {
        // Find constructor name by constructorRef
        const constructorObj = [
          {
            name: 'Red Bull',
            nationality: 'Austrian',
            url: 'http://en.wikipedia.org/wiki/Red_Bull_Racing',
          },
          {
            name: 'Mercedes',
            nationality: 'German',
            url: 'http://en.wikipedia.org/wiki/Mercedes-Benz_in_Formula_One',
          },
        ].find((c: any) => c.constructorId === winner.constructorRef);
        const constructorName = constructorObj
          ? constructorObj.name
          : 'Unknown';

        return prisma.seasonWinner.create({
          // Updated model name
          data: {
            season: winner.season,
            position: winner.position,
            positionText: winner.positionText,
            points: winner.points,
            wins: winner.wins,
            round: winner.round,
            driverId: driverMap.get(winner.driverRef)!,
            constructorId: constructorNameMap.get(constructorName)!,
          },
        });
      })
    );

    // Insert race winners
    console.log('🥇 Seeding race winners...');
    const raceWinnersData = [
      {
        season: '2023',
        round: '1',
        raceName: 'Bahrain Grand Prix',
        date: '2023-03-05',
        time: '15:00:00Z',
        url: 'https://en.wikipedia.org/wiki/2023_Bahrain_Grand_Prix',
        winnerDetails: {
          number: '1',
          position: '1',
          points: '25',
          laps: '57',
          time: {
            millis: '0',
            time: '1:30:34.195',
          },
        },
        driverRef: 'max_verstappen',
        constructorRef: 'red_bull',
        circuitRef: 'bahrain_international',
      },
      {
        season: '2023',
        round: '2',
        raceName: 'Saudi Arabian Grand Prix',
        date: '2023-03-19',
        time: '15:00:00Z',
        url: 'https://en.wikipedia.org/wiki/2023_Saudi_Arabian_Grand_Prix',
        winnerDetails: {
          number: '1',
          position: '1',
          points: '25',
          laps: '50',
          time: {
            millis: '0',
            time: '1:20:51.753',
          },
        },
        driverRef: 'max_verstappen',
        constructorRef: 'red_bull',
        circuitRef: 'jeddah_corniche',
      },
    ];
    await Promise.all(
      raceWinnersData.map((race: any) => {
        // Find constructor name by constructorRef
        const constructorObj = [
          {
            name: 'Red Bull',
            nationality: 'Austrian',
            url: 'http://en.wikipedia.org/wiki/Red_Bull_Racing',
          },
          {
            name: 'Mercedes',
            nationality: 'German',
            url: 'http://en.wikipedia.org/wiki/Mercedes-Benz_in_Formula_One',
          },
        ].find((c: any) => c.constructorId === race.constructorRef);
        const constructorName = constructorObj
          ? constructorObj.name
          : 'Unknown';

        return prisma.raceWinner.create({
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
            constructorId: constructorNameMap.get(constructorName)!,
          },
        });
      })
    );

    console.log('✅ Database seeding completed successfully!');
    console.log('📊 Total records created:');
    console.log('- Drivers:', drivers.length);
    console.log('- Constructors:', constructors.length);
    console.log('- Circuits:', circuits.length);
    console.log('- Seasons:', 4);
    console.log('- Season Winners:', 4); // Updated label
    console.log('- Race Winners:', 2);
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
