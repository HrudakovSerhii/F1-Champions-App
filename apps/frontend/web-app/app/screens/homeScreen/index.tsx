import React from 'react';

import useSeasonsWinners from '../../hooks/useSeasonsWinners';

import { getSeasonsWinnersGroupedData } from '../../utils/renderUtils';

import Spinner from '../../components/Spinner';
import ScreenTitle from '../../components/ScreenTitle';
import SeasonWinnerCard from './components/SeasonWinnerCard';

import { SEASONS_RANGE } from '../../constants';

const HomeScreen = () => {
  const { data, loading } = useSeasonsWinners();

  const pageTitle = `${SEASONS_RANGE[0]}-${SEASONS_RANGE[1]} Seasons Winners`;

  const groupedRenderData = getSeasonsWinnersGroupedData(data || [], 6);

  return (
    <div className="seasons-winners flex flex-col w-full">
      {loading && <Spinner title={`Loading ${pageTitle}`} />}
      {!loading && groupedRenderData?.length && (
        <div className="flex flex-col items-center">
          <ScreenTitle title={pageTitle} />
          <div className="flex flex-col w-full max-w-screen-xl">
            {groupedRenderData?.map((raceGroup, index) => (
              <ul
                className="seasons-winners-list flex overflow-scroll pb-6 px-4"
                key={`seasons-group-ul-${index}`}
              >
                {raceGroup.map((race) => (
                  <SeasonWinnerCard
                    key={`${race.season}-${race.round}`}
                    round={race.round}
                    season={race.season}
                    DriverStandings={race.DriverStandings}
                  />
                ))}
              </ul>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
