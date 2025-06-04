export interface Race {
  season: string;
  round: string;
  url: string;
  raceName: string;
  Circuit: Circuit;
  date: string;
  Results: Result[];
}

export interface Circuit {
  circuitId: string;
  url: string;
  circuitName: string;
  Location: Location;
}

export interface Location {
  lat: string;
  long: string;
  locality: string;
  country: string;
}

export interface Result {
  number: string;
  position: string;
  positionText: string;
  points: string;
  Driver: Driver;
  Constructor: Constructor;
  grid: string;
  laps: string;
  status: string;
  Time?: Time;
}

export interface Driver {
  driverId: string;
  url: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
}

export interface Constructor {
  constructorId: string;
  url: string;
  name: string;
  nationality: string;
}

export interface Time {
  millis?: string;
  time: string;
}

// Types for jolpi-driver-standing-mock-data.json

export interface JolpiRaceTableMRData {
  MRData: MRDataRaceTable;
}

export interface MRDataRaceTable {
  xmlns: string;
  series: string;
  url: string;
  limit: string;
  offset: string;
  total: string;
  RaceTable: RaceTable;
}

export interface RaceTable {
  Races: Race[];
}

export interface JolpiDriverStandingMRData {
  MRData: MRDataDriverStanding;
}

export interface MRDataDriverStanding {
  xmlns: string;
  series: string;
  url: string;
  limit: string;
  offset: string;
  total: string;
  StandingsTable: StandingsTable;
}

export interface StandingsTable {
  season: string;
  round: string;
  StandingsLists: StandingsList[];
}

export interface StandingsList {
  season: string;
  round: string;
  DriverStandings: DriverStanding[];
}

export interface DriverStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: Driver;
  Constructors: Constructor[];
}
