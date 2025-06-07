// Import shared types from the API types library
import type { Driver, Constructor } from '@f1-app/api-types';

interface MRData {
  xmlns: '';
  series: 'f1';
  url: 'http://api.jolpi.ca/ergast/f1/1972/driverstandings/';
  limit: '30';
  offset: '0';
  total: '42';
}

// Keep local types that don't exist in shared library
export interface DriverStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: Driver;
  Constructors: Constructor[];
}

export interface RaceResult {
  number: string;
  position: string;
  points: string;
  Driver: Driver;
  Constructor: Constructor;
  laps: string;
  Time: {
    millis: string;
    time: string;
  };
}

export interface Race {
  date: string;
  raceName: string;
  round: string;
  season: string;
  time: string;
  url: string;
  Results: RaceResult[];
}

export interface StandingItem {
  round: string;
  season: string;
  DriverStandings: DriverStanding[];
}

export interface SeasonMRData extends MRData {
  RaceTable: {
    position: string;
    season: string;
    Races: Race[];
  };
}

export interface AllSeasonsMRData extends MRData {
  StandingsTable: {
    StandingsLists: StandingItem[];
  };
}

export interface AllSeasonsData {
  MRData: AllSeasonsMRData;
}

export interface SeasonData {
  MRData: SeasonMRData;
}
