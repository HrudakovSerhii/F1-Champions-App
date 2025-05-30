// External API types (Ergast API structure)
export interface ErgastDriver {
  driverId: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
  url: string;
}

export interface ErgastConstructor {
  constructorId: string;
  name: string;
  nationality: string;
  url: string;
}

export interface ErgastCircuit {
  circuitId: string;
  circuitName: string;
  url: string;
  // Note: Location removed from our internal types
  Location?: {
    lat: string;
    long: string;
    locality: string;
    country: string;
  };
}

export interface ErgastRace {
  season: string;
  round: string;
  raceName: string;
  date: string;
  time: string;
  url: string;
  Circuit: ErgastCircuit;
  Winner: {
    Driver: ErgastDriver;
    Constructor: ErgastConstructor;
    number: string;
    position: string;
    points: string;
    laps: string;
    Time: {
      millis: string;
      time: string;
    };
  };
}

export interface ErgastStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: ErgastDriver;
  Constructors: ErgastConstructor[];
}

export interface ErgastStandingsList {
  season: string;
  round: string;
  DriverStandings: ErgastStanding[];
}

export interface ErgastSeason {
  season: string;
  url: string;
}

// Response type for Ergast API seasons endpoint (renamed to avoid conflict)
export interface ErgastSeasonsResponse {
  MRData: {
    limit: string;
    offset: string;
    series: string;
    total: string;
    url: string;
    xmlns: string;
    SeasonTable: {
      Seasons: ErgastSeason[];
    };
  };
}
