import {
  filterWinnersBySeasonRange,
  selectWinnerBySeason,
} from '../hooksUtils';

import { StandingItem } from '../../types';
import type { SeasonWinner } from '@f1-app/api-types';

const standingItemTestData: StandingItem[] = [
  { season: '2004', round: '1', DriverStandings: [] },
  { season: '2005', round: '2', DriverStandings: [] },
  { season: '2005', round: '3', DriverStandings: [] },
  { season: '2006', round: '4', DriverStandings: [] },
  { season: '2006', round: '5', DriverStandings: [] },
  { season: '2024', round: '6', DriverStandings: [] },
];

const seasonWinnerTestData: SeasonWinner[] = [
  {
    season: '2004',
    wins: 13,
    driver: {
      driverId: 'michael_schumacher',
      familyName: 'Schumacher',
      givenName: 'Michael',
      nationality: 'German',
      url: 'http://example.com/drivers/michael_schumacher'
    },
    constructor: {
      name: 'Ferrari',
      nationality: 'Italian',
      url: 'http://example.com/constructors/ferrari'
    }
  },
  {
    season: '2005',
    wins: 7,
    driver: {
      driverId: 'fernando_alonso',
      familyName: 'Alonso',
      givenName: 'Fernando',
      nationality: 'Spanish',
      url: 'http://example.com/drivers/fernando_alonso'
    },
    constructor: {
      name: 'Renault',
      nationality: 'French',
      url: 'http://example.com/constructors/renault'
    }
  },
  {
    season: '2006',
    wins: 7,
    driver: {
      driverId: 'fernando_alonso',
      familyName: 'Alonso',
      givenName: 'Fernando',
      nationality: 'Spanish',
      url: 'http://example.com/drivers/fernando_alonso'
    },
    constructor: {
      name: 'Renault',
      nationality: 'French',
      url: 'http://example.com/constructors/renault'
    }
  },
  {
    season: '2024',
    wins: 19,
    driver: {
      driverId: 'max_verstappen',
      familyName: 'Verstappen',
      givenName: 'Max',
      nationality: 'Dutch',
      url: 'http://example.com/drivers/max_verstappen'
    },
    constructor: {
      name: 'Red Bull Racing',
      nationality: 'Austrian',
      url: 'http://example.com/constructors/red_bull_racing'
    }
  }
];

describe('App utils', () => {
  describe('filterWinnersBySeasonRange', () => {
    it('returns all items within the default season range', () => {
      const result = filterWinnersBySeasonRange(standingItemTestData);

      expect(result).toMatchObject([
        { season: '2005', round: '2' },
        { season: '2005', round: '3' },
        { season: '2006', round: '4' },
        { season: '2006', round: '5' },
        { season: '2024', round: '6' },
      ]);
    });

    it('returns only items within the specified season range', () => {
      const result = filterWinnersBySeasonRange(standingItemTestData, [2004, 2005]);

      expect(result).toMatchObject([
        { round: '1' },
        { round: '2' },
        { round: '3' },
      ]);
    });

    it('returns an empty array when no items are within the season range', () => {
      const result = filterWinnersBySeasonRange(standingItemTestData, [1990, 1999]);

      expect(result).toEqual([]);
    });
  });

  describe('selectWinnerBySeason', () => {
    it('should return correct item for first appearance of searched season in data list', () => {
      const result = selectWinnerBySeason(seasonWinnerTestData, '2005');

      expect(result).toEqual({
        season: '2005',
        wins: 7,
        driver: {
          driverId: 'fernando_alonso',
          familyName: 'Alonso',
          givenName: 'Fernando',
          nationality: 'Spanish',
          url: 'http://example.com/drivers/fernando_alonso'
        },
        constructor: {
          name: 'Renault',
          nationality: 'French',
          url: 'http://example.com/constructors/renault'
        }
      });
    });

    it('should return undefined if data does not contain provided season items', () => {
      const result = selectWinnerBySeason(seasonWinnerTestData, '2007');

      expect(result).toBeUndefined();
    });
  });
});
