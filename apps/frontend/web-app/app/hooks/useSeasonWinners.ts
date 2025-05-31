import { useEffect, useState } from 'react';

import useRemoteData, { RemoteData } from './useRemoteData';

import {
  ROOT_ERGAST_API_PATH,
  SEASON_WINNERS_PATH,
} from '../constants/ergastApiConstans';

import { Race, SeasonData } from '../types';

type UseSeasonWinners = Omit<RemoteData<Race[] | undefined>, 'fetchRemoteData'>;

/**
 * Hook to request list of winners for each race in selected season of F1 championship. Re-using useRemoteData default state props.
 * API GET request to retreat list of winners for each race in selected season
 * @param seasonId {string} season value representing year of the races season
 * @return UseSeasonWinners
 */
export const useSeasonWinners: (seasonId: string) => UseSeasonWinners = (
  seasonId
) => {
  const [raceWinnersList, setRaceWinnersList] = useState<Race[]>();

  const { data, loading, error, fetchRemoteData } =
    useRemoteData<SeasonData>(ROOT_ERGAST_API_PATH);

  useEffect(() => {
    if (!loading) {
      fetchRemoteData(SEASON_WINNERS_PATH.replace('{seasonId}', seasonId));
    }
  }, [seasonId, fetchRemoteData]);

  useEffect(() => {
    if (data) {
      // We select deeply nested data and store it to local state for easy access
      const updatedRaceWinnersList = data?.MRData.RaceTable.Races;

      setRaceWinnersList(updatedRaceWinnersList);
    }
  }, [data]);

  return {
    loading,
    error,
    data: raceWinnersList,
  };
};

export default useSeasonWinners;
