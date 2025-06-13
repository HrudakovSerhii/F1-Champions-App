import {
  filterWinnersBySeasonRange,
  selectWinnerBySeason,
} from '../hooksUtils';

import { StandingItem } from '../../types';

const testData: StandingItem[] = [
  { season: '2004', round: '1', DriverStandings: [] },
  { season: '2005', round: '2', DriverStandings: [] },
  { season: '2005', round: '3', DriverStandings: [] },
  { season: '2006', round: '4', DriverStandings: [] },
  { season: '2006', round: '5', DriverStandings: [] },
  { season: '2024', round: '6', DriverStandings: [] },
];

describe('App utils', () => {
  describe('filterWinnersBySeasonRange', () => {
    it('returns all items within the default season range', () => {
      const result = filterWinnersBySeasonRange(testData);

      expect(result).toMatchObject([
        { season: '2005', round: '2' },
        { season: '2005', round: '3' },
        { season: '2006', round: '4' },
        { season: '2006', round: '5' },
        { season: '2024', round: '6' },
      ]);
    });

    it('returns only items within the specified season range', () => {
      const result = filterWinnersBySeasonRange(testData, [2004, 2005]);

      expect(result).toMatchObject([
        { round: '1' },
        { round: '2' },
        { round: '3' },
      ]);
    });

    it('returns an empty array when no items are within the season range', () => {
      const result = filterWinnersBySeasonRange(testData, [1990, 1999]);

      expect(result).toEqual([]);
    });
  });

  describe('selectWinnerBySeason', () => {
    it('should return correct item for first appearance of searched season in data list', () => {
      const result = selectWinnerBySeason(testData, '2005');

      expect(result).toEqual({
        season: '2005',
        round: '2',
        DriverStandings: [],
      });
    });

    it('should return undefined if data does not contain provided season items', () => {
      const result = selectWinnerBySeason(testData, '2007');

      expect(result).toBeUndefined();
    });
  });
});
