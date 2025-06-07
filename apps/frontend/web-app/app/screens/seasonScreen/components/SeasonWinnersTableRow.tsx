import React from 'react';
import { Link } from 'react-router-dom';

import type { SeasonRaceWinner } from '@f1-app/api-types';

type SeasonWinnersTableRowProps = {
  wasWinner: boolean;
  isWinner: boolean;
} & SeasonRaceWinner;

const SeasonWinnersTableRow: React.FC<SeasonWinnersTableRowProps> = ({
  driver,
  points,
  round,
  wins,
  constructor,
  wasWinner,
  isWinner,
}) => {
  const { url: driverUrl, familyName, givenName, nationality } = driver;

  const winnerClassName = isWinner
    ? 'bg-lime-50 hver:bg-lime-100'
    : wasWinner
    ? 'bg-amber-50 hover:bg-amber-100'
    : 'hover:bg-gray-50';

  return (
    <tr
      className={`app-races-winners-list-item border-b text-gray-600 ${winnerClassName}`}
    >
      <th scope="row" className="flex items-center px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <Link
            to={driverUrl}
            className="text-base font-semibold text-gray-500 hover:text-blue-600 hover:underline"
          >
            {familyName} {givenName}
          </Link>
          <span className="font-normal text-xs text-gray-500">
            {nationality}
          </span>
        </div>
      </th>
      <td className="px-6 py-4">
        <div className="flex">
          <span>{points}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex">
          <span>{round}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex">
          <span>{wins}</span>
          <img
            src="/assets/chequered-flag-icon.png"
            className="h-4 ml-2"
            alt="chequered flag icon"
          />
        </div>
      </td>
      {/*<td className="px-6 py-4">*/}
      {/*  <div className="flex flex-col">*/}
      {/*    <Link*/}
      {/*      to={raceUrl}*/}
      {/*      className="font-normal hover:text-blue-600 hover:underline"*/}
      {/*    >*/}
      {/*      {raceName}*/}
      {/*    </Link>*/}
      {/*    <span className="font-normal text-xs text-gray-500">*/}
      {/*      {getFormattedDate(date)}*/}
      {/*    </span>*/}
      {/*  </div>*/}
      {/*</td>*/}
      <td className="px-6 py-4">
        <Link
          to={constructor.url}
          className="font-medium hover:text-blue-600 hover:underline"
        >
          {constructor.name}
        </Link>
      </td>
    </tr>
  );
};

export default SeasonWinnersTableRow;
