import React, { useMemo } from 'react';

import Table from '../../../common-modules/client/components/table/Table';

const getColumns = () => [
  { field: 'key', title: 'מזהה' },
  { field: 'name', title: 'שם' },
  { field: 'klasses', title: 'כיתות' },
  { field: 'start_date', title: 'תאריך התחלה', type: 'date' },
  { field: 'end_date', title: 'תאריך סיום', type: 'date' },
];
const getFilters = () => [
  { field: 'key', label: 'מזהה', type: 'text', operator: 'like' },
  { field: 'name', label: 'שם', type: 'text', operator: 'like' },
  { field: 'klasses', label: 'כיתות', type: 'text', operator: 'like' },
];

const LessonsContainer = ({ entity, title }) => {
  const columns = useMemo(() => getColumns(), []);
  const filters = useMemo(() => getFilters(), []);

  const manipulateDataToSave = (dataToSave) => ({
    ...dataToSave,
    start_date:
      dataToSave.start_date instanceof Date
        ? dataToSave.start_date.toISOString().substr(0, 10)
        : dataToSave.start_date != null
        ? dataToSave.start_date.substr(0, 10)
        : null,
    end_date:
      dataToSave.end_date instanceof Date
        ? dataToSave.end_date.toISOString().substr(0, 10)
        : dataToSave.end_date != null
        ? dataToSave.end_date.substr(0, 10)
        : null,
  });

  return (
    <Table
      entity={entity}
      title={title}
      columns={columns}
      filters={filters}
      manipulateDataToSave={manipulateDataToSave}
    />
  );
};

export default LessonsContainer;
