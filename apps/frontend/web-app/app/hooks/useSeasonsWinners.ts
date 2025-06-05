import { useEffect } from 'react';

import useRemoteData, { RemoteData } from './useRemoteData';
import { useSeasonsWinnersListLocal } from './useLocalState';

import {
  ALL_SEASON_WINNERS_PATH,
  F1_CHAMPIONS_API_PATH,
} from '../constants/apiConstants';

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
    fetchRemoteData(ALL_SEASON_WINNERS_PATH).finally();
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
