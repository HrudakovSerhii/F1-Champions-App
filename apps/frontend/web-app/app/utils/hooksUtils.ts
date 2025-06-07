import { StandingItem } from '../types';
import { SEASONS_RANGE } from '../constants';

import type { SeasonWinner } from '@f1-app/api-types';

/**
 * Function filter standingsLists to get winners only for range specified in App requirements.
 * This could be done by using offset param. on StandingItem[] data fetch but wasn't chosen as it will require to fetch
 * current season data first to see current season value.
 * @param data {StandingItem[]} list of season items
 * @param seasonRange {SEASONS_RANGE} tuple of seasons - default to [2005-2023]
 * @return StandingItem[]
 */
// TODO: Review if required
export const filterWinnersBySeasonRange = (
  data: StandingItem[],
  seasonRange: typeof SEASONS_RANGE = SEASONS_RANGE
) =>
  data?.filter(
    (standingItem) =>
      Number(standingItem.season) >= seasonRange[0] &&
      Number(standingItem.season) <= seasonRange[1]
  );

/**
 * Function search and return winner data of specific season
 * @param data {StandingItem[]} list of season items
 * @param season {string} id of the season
 * @return StandingItem
 */
export const selectWinnerBySeason = (data: SeasonWinner[], season: string) =>
  data.find((standingItem) => standingItem.season === season);
