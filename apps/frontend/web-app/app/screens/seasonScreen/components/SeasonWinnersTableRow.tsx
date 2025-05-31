import React from 'react';
import { Link } from 'react-router-dom';

import usePreviousSeasonWinner from '../../../hooks/usePreviousSeasonWinner';

import { getFormattedDate } from '../../../utils/renderUtils';

import { Race } from '../../../types';

type RacesWinnersListItemProps = Race;

const SeasonWinnersTableRow: React.FC<RacesWinnersListItemProps> = ({
  url: raceUrl,
  date,
  season,
  raceName,
  Results,
}) => {
  const { data: seasonWinnerData } = usePreviousSeasonWinner(season);

  const { Driver, Constructor, laps, Time } = Results[0];

  const {
    url: driverUrl,
    familyName,
    givenName,
    nationality,
    driverId,
  } = Driver;

  const { time: raceTime } = Time;

  const isWinner =
    driverId === seasonWinnerData?.DriverStandings[0]?.Driver.driverId;
  const winnerClassName = isWinner
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
          <span>{laps}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex">
          <span>{raceTime}</span>
          <img
            src="/assets/chequered-flag-icon.png"
            className="h-4 ml-2"
            alt="chequered flag icon"
          />
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <Link
            to={raceUrl}
            className="font-normal hover:text-blue-600 hover:underline"
          >
            {raceName}
          </Link>
          <span className="font-normal text-xs text-gray-500">
            {getFormattedDate(date)}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <Link
          to={Constructor.url}
          className="font-medium hover:text-blue-600 hover:underline"
        >
          {Constructor.name}
        </Link>
      </td>
    </tr>
  );
};

export default SeasonWinnersTableRow;
