import React from 'react';

import SeasonWinnersTableRow from './SeasonWinnersTableRow';

import type { SeasonRaceWinner } from '@f1-app/api-types';

type RacesWinnersTableProps = {
  tableData: SeasonRaceWinner[] | undefined;
};

export const tableHeaderData = ['Driver', 'Points', 'Rounds', 'Wins', 'Constructor'];

/**
 * NOTE: Table structure can be dynamically assembled from data fields using config object.
 * This will make table more generic but more complex to support
 **/
const SeasonWinnersTable: React.FC<RacesWinnersTableProps> = ({
  tableData,
}) => {
  tableData?.sort((a, b) => a.points + b.points);

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
        {tableData?.map((tableRowData) => (
          <SeasonWinnersTableRow
            key={tableRowData.season + tableRowData.round}
            {...tableRowData}
          />
        ))}
      </tbody>
    </table>
  );
};

export default SeasonWinnersTable;
