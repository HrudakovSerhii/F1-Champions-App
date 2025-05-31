import { MONTH_NAMES } from '../constants';

import { StandingItem } from '../types';

export const getSeasonsWinnersGroupedData = (
  data: StandingItem[],
  groupSize: number = 5
) =>
  data?.reduce((groupedItems, standingItem, index) => {
    const groupIndex = Math.floor(index / groupSize);

    if (groupedItems[groupIndex]) {
      groupedItems[groupIndex] = [...groupedItems[groupIndex], data[index]];
    } else {
      groupedItems.push([data[index]]);
    }

    return groupedItems;
  }, [] as StandingItem[][]);

export const getFormattedDate = (dateString: string) => {
  const date = new Date(dateString);

  return `${
    MONTH_NAMES[date.getMonth()]
  } ${date.getDate()}, ${date.getFullYear()}`;
};
