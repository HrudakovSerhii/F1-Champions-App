import React from 'react';

import { Race } from '../../../types';

import SeasonWinnersTableRow from './SeasonWinnersTableRow';

type RacesWinnersTableProps = {
  tableData: Race[] | undefined;
};

export const tableHeaderData = [
  'Driver',
  'Laps',
  'Race Time',
  'Race location',
  'Constructor',
];

/**
 * NOTE: Table structure can be dynamically assembled from data fields using config object.
 * This will make table more generic but more complex to support
 **/
const SeasonWinnersTable: React.FC<RacesWinnersTableProps> = ({
  tableData,
}) => {
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
            key={tableRowData.raceName + tableRowData.round}
            {...tableRowData}
          />
        ))}
      </tbody>
    </table>
  );
};

export default SeasonWinnersTable;
