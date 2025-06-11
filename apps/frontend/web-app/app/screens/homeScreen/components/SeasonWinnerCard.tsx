import React from 'react';
import { Link } from 'react-router-dom';

import { SEASON } from '../../../constants';
import { TEST_IDS, getDynamicTestId } from '@f1-app/e2e-testids';

import { SeasonWinner } from '@f1-app/api-types';

interface SeasonWinnerCardProps extends SeasonWinner {
  index: number;
}

const SeasonWinnerCard: React.FC<SeasonWinnerCardProps> = ({
  season,
  wins,
  driver,
  constructor,
  index,
}) => {
  const { familyName, givenName, url } = driver;
  const { name, url: constructorUrl } = constructor;

  return (
    <div
      className="app-season-winner-card flex flex-grow flex-col w-full p-6 border border-gray-200 rounded-lg shadow"
      data-testid={getDynamicTestId(
        TEST_IDS.HOME_SCREEN.CHAMPION_CARD.CONTAINER,
        { index }
      )}
    >
      <span
        className="text-2xl font-bold tracking-tight text-gray-900"
        data-testid={TEST_IDS.HOME_SCREEN.CHAMPION_CARD.SEASON_YEAR}
      >
        {season}
      </span>

      <Link
        to={url}
        className="mt-2 text-lg font-bold tracking-tight text-gray-600 hover:text-blue-600 hover:underline"
        title={`Link to ${givenName} ${familyName} wikipedia page.`}
        data-testid={TEST_IDS.HOME_SCREEN.CHAMPION_CARD.DRIVER_NAME}
      >
        {givenName} {familyName}
      </Link>

      <p
        className="mt-1 font-normal text-xs text-gray-700"
        data-testid={TEST_IDS.HOME_SCREEN.CHAMPION_CARD.WINS}
      >
        {wins} Wins
      </p>

      <a
        className="mt-1 font-normal text-xs text-gray-700"
        href={constructorUrl}
        target="_blank"
        rel="noreferrer"
        data-testid={TEST_IDS.HOME_SCREEN.CHAMPION_CARD.CONSTRUCTOR}
      >
        {name}
      </a>

      <Link
        to={SEASON.replace(':season', season)}
        className="inline-flex items-center mt-3 px-3 py-2 text-sm font-medium bg-blue-100 hover:bg-blue-200 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg"
        data-testid={TEST_IDS.HOME_SCREEN.CHAMPION_CARD.VIEW_DETAILS}
      >
        Read more
        <svg
          aria-hidden="true"
          className="w-4 h-4 ml-2 -mr-1"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
            clipRule="evenodd"
          ></path>
        </svg>
      </Link>
    </div>
  );
};

export default SeasonWinnerCard;
