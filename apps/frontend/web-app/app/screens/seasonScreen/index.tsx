import React from 'react';
import { useOutletContext } from 'react-router';

import useSeasonWinners from '../../hooks/useSeasonWinners';

import Spinner from '../../components/Spinner';
import ScreenTitle from '../../components/ScreenTitle';

import SeasonWinnersTable from './components/SeasonWinnersTable';

const SeasonScreen: React.FC = () => {
  const { season } = useOutletContext<{ season: string }>();
  const { data, loading } = useSeasonWinners(season);

  return (
    <div className="season-races-winners max-w-screen-xl mx-auto">
      <ScreenTitle title={`Season ${season}`} />
      {loading && <Spinner title={`Loading season ${season} table`} />}
      {!loading && data?.length && (
        <SeasonWinnersTable season={season} tableData={data} />
      )}
    </div>
  );
};

export default SeasonScreen;
