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
          <div className="w-full max-w-screen-xl px-4">
            <div className="grid grid-cols-[repeat(auto-fill,190px)] gap-4 justify-items-start justify-center">
              {data?.map((seasonWinner) => (
                <SeasonWinnerCard key={seasonWinner.season} {...seasonWinner} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
