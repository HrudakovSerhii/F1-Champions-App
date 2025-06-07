import { useEffect } from 'react';

import useRemoteData, { RemoteData } from './useRemoteData';
import { useSeasonsWinnersListLocal } from './useLocalState';

import {
  ALL_SEASON_WINNERS_PATH,
  F1_CHAMPIONS_API_PATH,
} from '../constants/apiConstants';

import { SEASONS_RANGE } from '../constants';

import type { SeasonWinner } from '@f1-app/api-types';

type UseSeasonsWinners = Omit<
  RemoteData<SeasonWinner[] | undefined>,
  'fetchRemoteData'
>;

/**
 * Hook to request list of winners for every season of F1 championship. Using useRemoteData default state props.
 * @return UseSeasonsWinners
 */
const useSeasonsWinners: () => UseSeasonsWinners = () => {
  const winnersListState = useSeasonsWinnersListLocal((state) => ({
    items: state.items,
    update: state.update,
  }));

  const { data, loading, error, fetchRemoteData } = useRemoteData<
    SeasonWinner[]
  >(F1_CHAMPIONS_API_PATH);

  useEffect(() => {
    const [minYear, maxYear] = SEASONS_RANGE;
    const queryParams = new URLSearchParams({
      minYear: minYear.toString(),
      maxYear: maxYear.toString(),
    });

    fetchRemoteData(
      `${ALL_SEASON_WINNERS_PATH}?${queryParams.toString()}`
    ).finally();
  }, []);

  useEffect(() => {
    if (data?.length) {
      winnersListState.update(data);
    }
  }, [data]);

  return {
    loading,
    error,
    data: winnersListState.items,
  };
};

export default useSeasonsWinners;
