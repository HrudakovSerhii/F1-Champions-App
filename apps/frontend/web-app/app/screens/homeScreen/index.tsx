import useSeasonsWinners from '../../hooks/useSeasonsWinners';

import Spinner from '../../components/Spinner';
import ScreenTitle from '../../components/ScreenTitle';
import SeasonWinnerCard from './components/SeasonWinnerCard';

import { SEASONS_RANGE } from '../../constants';
import { TEST_IDS } from '@f1-app/e2e-testids';

const HomeScreen = () => {
  const { data, loading } = useSeasonsWinners();

  const pageTitle = `${SEASONS_RANGE[0]}-${SEASONS_RANGE[1]} Seasons Winners`;

  return (
    <div
      className="seasons-winners flex flex-col w-full"
      data-testid={TEST_IDS.HOME_SCREEN.CHAMPIONS_SECTION}
    >
      {loading && (
        <Spinner
          title={`Loading ${pageTitle}`}
          data-testid={TEST_IDS.HOME_SCREEN.LOADING_SPINNER}
        />
      )}
      {!loading && data?.length && (
        <div className="flex flex-col items-center">
          <ScreenTitle
            title={pageTitle}
            data-testid={TEST_IDS.HOME_SCREEN.PAGE_TITLE}
          />
          <div className="w-full max-w-screen-xl px-4">
            <div
              className="grid grid-cols-[repeat(auto-fill,190px)] gap-4 justify-items-start justify-center"
              data-testid={TEST_IDS.HOME_SCREEN.CHAMPIONS_LIST}
            >
              {data?.map((seasonWinner, index) => (
                <SeasonWinnerCard
                  key={seasonWinner.season}
                  index={index}
                  {...seasonWinner}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
