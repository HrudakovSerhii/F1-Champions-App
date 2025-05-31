export interface MRData {
  limit: string;
  offset: string;
  series: string;
  total: string;
  url: string;
  xmlns: string;
}

export interface Driver {
  url: string;
  driverId: string;
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
