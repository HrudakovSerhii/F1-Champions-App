#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';
import { ExternalDataParserService } from '../shared/transformers';

import * as mockData from '../assets/jolpi-driver-standing-mock-data.json';

/**
 * Prisma seeding script
 * This script is executed when running `npx prisma db seed`
 */
async function main() {
  console.log('🌱 Seeding database...');
  
  const prisma = new PrismaClient();
  const externalDataParserService = new ExternalDataParserService();

  try {
    // Clean up existing data
    await prisma.seasonRaceWinner.deleteMany({});
    await prisma.seasonWinner.deleteMany({});
    await prisma.driver.deleteMany({});
    await prisma.constructor.deleteMany({});
    
    // Parse data
    const raceTableDBData = externalDataParserService.extractDBDataFromJolpiDriversStandingList(
      mockData.MRData.StandingsTable.StandingsLists
    );

    // Store data using upsert patterns
    await Promise.all(raceTableDBData.drivers.map(driver =>
      prisma.driver.create({
        data: {
          driverId: driver.driverId,
          givenName: driver.givenName,
          familyName: driver.familyName,
          nationality: driver.nationality,
          url: driver.url
        }
      })
    ));

    await Promise.all(raceTableDBData.constructors.map(constructor =>
      prisma.constructor.create({
        data: {
          name: constructor.name,
          nationality: constructor.nationality,
          url: constructor.url
        }
      })
    ));

    await Promise.all(raceTableDBData.seasonWinners.map(winner =>
      prisma.seasonWinner.create({
        data: {
          season: winner.season,
          wins: winner.wins,
          driverId: winner.driverId,
          constructorId: winner.constructorId
        }
      })
    ));

    await Promise.all(raceTableDBData.seasonRaceWinners.map(raceWinner =>
      prisma.seasonRaceWinner.create({
        data: {
          season: raceWinner.season,
          round: raceWinner.round,
          points: raceWinner.points,
          wins: raceWinner.wins,
          driverId: raceWinner.driverId,
          constructorId: raceWinner.constructorId
        }
      })
    ));

    console.log('✅ Seeding completed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
