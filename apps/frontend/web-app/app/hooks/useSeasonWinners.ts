import { useEffect, useState } from 'react';

import useRemoteData, { RemoteData } from './useRemoteData';

import {
  F1_CHAMPIONS_API_PATH,
  SEASON_WINNERS_PATH,
} from '../constants/ergastApiConstans';

import type { SeasonRaceWinner } from '@f1-app/api-types';

type UseSeasonWinners = Omit<
  RemoteData<SeasonRaceWinner[] | undefined>,
  'fetchRemoteData'
>;

/**
 * Hook to request list of winners for each race in selected season of F1 championship. Re-using useRemoteData default state props.
 * API GET request to retreat list of winners for each race in selected season
 * @param season {string} season value representing year of the races season
 * @return UseSeasonWinners
 */
export const useSeasonWinners: (season: string) => UseSeasonWinners = (
  season: string
) => {
  const [seasonWinnerList, setSeasonWinnerList] =
    useState<SeasonRaceWinner[]>();

  const { data, loading, error, fetchRemoteData } = useRemoteData<
    SeasonRaceWinner[]
  >(F1_CHAMPIONS_API_PATH);

  useEffect(() => {
    if (!loading) {
      fetchRemoteData(
        SEASON_WINNERS_PATH.replace('{seasonYear}', season)
      ).finally();
    }
  }, [season]);

  useEffect(() => {
    if (data) {
      setSeasonWinnerList(data);
    }
  }, [data]);

  return {
    loading,
    error,
    data: seasonWinnerList,
  };
};

export default useSeasonWinners;
