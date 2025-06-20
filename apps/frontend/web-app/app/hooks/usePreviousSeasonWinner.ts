import { useEffect, useState } from 'react';

import { useSeasonsWinnersListLocal } from './useLocalState';

import { selectWinnerBySeason } from '../utils/hooksUtils';

import { SEASONS_RANGE } from '../constants';

import type { SeasonWinner } from '@f1-app/api-types';

type UsePreviousSeasonWinner = {
  data: SeasonWinner | undefined;
};

/**
 * Hook access local state data and search winner of previous season in SeasonsWinners list.
 * If SeasonsWinners local state data is not available or empty, UsePreviousSeasonWinner.data is undefined.
 * @param currentSeasonId - current season value
 * @return {UsePreviousSeasonWinner} season winner data for previous season
 */
const usePreviousSeasonWinner: (
  currentSeasonId: string
) => UsePreviousSeasonWinner = (currentSeasonId): UsePreviousSeasonWinner => {
  const winnersListItems = useSeasonsWinnersListLocal((state) => state.items);

  const [seasonWinnerData, setSeasonWinnerData] = useState<
    SeasonWinner | undefined
  >();

  useEffect(() => {
    const season = Number(currentSeasonId);

    if (season && winnersListItems?.length) {
      const prevSeason = season - 1;

      if (prevSeason >= SEASONS_RANGE[0] && prevSeason < SEASONS_RANGE[1]) {
        const winnerItem = selectWinnerBySeason(
          winnersListItems,
          prevSeason.toString()
        );

        setSeasonWinnerData(winnerItem);
      }
    }
  }, [currentSeasonId]);

  return {
    data: seasonWinnerData,
  };
};

export default usePreviousSeasonWinner;
