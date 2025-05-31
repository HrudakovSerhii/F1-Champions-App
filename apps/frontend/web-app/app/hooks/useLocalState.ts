import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { StandingItem } from '../types';

type SeasonsWinnersListLocal = {
  items: StandingItem[];
  update: (items: StandingItem[]) => void;
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
