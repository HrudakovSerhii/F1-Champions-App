import React, { useMemo } from 'react';

import SeasonWinnersTableRow from './SeasonWinnersTableRow';

import type { SeasonRaceWinner } from '@f1-app/api-types';
import usePreviousSeasonWinner from '../../../hooks/usePreviousSeasonWinner';

type RacesWinnersTableProps = {
  season: string;
  tableData: SeasonRaceWinner[] | undefined;
};

export const tableHeaderData = [
  'Driver',
  'Points',
  'Rounds',
  'Wins',
  'Constructor',
];

const SeasonWinnersTable: React.FC<RacesWinnersTableProps> = ({
  season,
  tableData,
}) => {
  const { data: prevSeasonWinnerData } = usePreviousSeasonWinner(season);

  const sortedTableData = useMemo(() => {
    if (!tableData) return [];

    return [...tableData].sort((a, b) => b.points - a.points);
  }, [tableData]);

  return (
    <table className="w-full text-sm text-left">
      <thead className="sticky top-0 bg-gray-50 text-xs text-gray-700 uppercase">
        <tr>
          {tableHeaderData.map((headerTitle) => (
            <th key={headerTitle} scope="col" className="px-6 py-3">
              {headerTitle}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedTableData?.map((tableRowData, index) => (
          <SeasonWinnersTableRow
            key={tableRowData.season + tableRowData.driver.driverId}
            wasWinner={
              prevSeasonWinnerData?.driver.driverId ===
              tableRowData.driver.driverId
            }
            isWinner={index === 0}
            {...tableRowData}
          />
        ))}
      </tbody>
    </table>
  );
};

export default SeasonWinnersTable;
