import { getFormattedDate, getSeasonsWinnersGroupedData } from '../renderUtils';

import { StandingItem } from '../../types';

describe('renderUtils', () => {
  describe('getSeasonsWinnersGroupedData', () => {
    const testData: StandingItem[] = [
      { season: '2004', round: '1', DriverStandings: [] },
      { season: '2005', round: '2', DriverStandings: [] },
      { season: '2005', round: '3', DriverStandings: [] },
      { season: '2006', round: '4', DriverStandings: [] },
      { season: '2006', round: '5', DriverStandings: [] },
      { season: '2024', round: '6', DriverStandings: [] },
    ];

    it('should return correct number of groups', () => {
      const groupSize = 2;

      expect(getSeasonsWinnersGroupedData(testData, groupSize)?.length).toEqual(
        testData.length / groupSize
      );
    });

    it('should return empty list if no data provided', () => {
      const groupSize = 2;

      expect(getSeasonsWinnersGroupedData([], groupSize)).toEqual([]);
    });

    it('should return array with single group if groupSize is bigger than provided data size', () => {
      const groupSize = 120;

      expect(getSeasonsWinnersGroupedData(testData, groupSize)).toEqual([
        testData,
      ]);
    });
  });

  describe('getFormattedDate', () => {
    it('should return correctly formatted date string', () => {
      const dateString = '2022-04-25';
      const expectedOutput = 'April 25, 2022';

      expect(getFormattedDate(dateString)).toEqual(expectedOutput);
    });
  });
});
