import useSeasonsWinners from '../../hooks/useSeasonsWinners';

import Spinner from '../../components/Spinner';
import ScreenTitle from '../../components/ScreenTitle';
import SeasonWinnerCard from './components/SeasonWinnerCard';

import { SEASONS_RANGE } from '../../constants';

const HomeScreen = () => {
  const { data, loading } = useSeasonsWinners();

  const pageTitle = `${SEASONS_RANGE[0]}-${SEASONS_RANGE[1]} Seasons Winners`;

  return (
    <div className="seasons-winners flex flex-col w-full">
      {loading && <Spinner title={`Loading ${pageTitle}`} />}
      {!loading && data?.length && (
        <div className="flex flex-col items-center">
          <ScreenTitle title={pageTitle} />
          <div className="flex flex-col w-full max-w-screen-xl">
            {data?.map((seasonWinner, index) => (
              <ul
                className="seasons-winners-list flex overflow-scroll pb-6 px-4"
                key={`seasons-group-ul-${index}`}
              >
                <SeasonWinnerCard key={seasonWinner.season} {...seasonWinner} />
              </ul>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
