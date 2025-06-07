import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { SeasonWinner } from '@f1-app/api-types';

type SeasonsWinnersListLocal = {
  items: SeasonWinner[];
  update: (items: SeasonWinner[]) => void;
};

export const useSeasonsWinnersListLocal = create<SeasonsWinnersListLocal>()(
  devtools(
    persist(
      (set) => ({
        items: [],
        update: (items) => set(() => ({ items })),
      }),
      { name: 'seasons-winners-list-storage' }
    )
  )
);
