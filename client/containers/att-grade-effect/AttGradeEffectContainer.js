import React, { useMemo } from 'react';

import Table from '../../../common-modules/client/components/table/Table';

const getColumns = () => [
  { field: 'percents', title: 'מעל אחוז', type: 'numeric' },
  { field: 'effect', title: 'השפעה', type: 'numeric' },
];
const getFilters = () => [
  { field: 'percents', label: 'מעל אחוז', type: 'text', operator: 'like' },
  { field: 'effect', label: 'השפעה', type: 'text', operator: 'like' },
];

const AttGradeEffectContainer = ({ entity, title }) => {
  const columns = useMemo(() => getColumns(), []);
  const filters = useMemo(() => getFilters(), []);

  return <Table entity={entity} title={title} columns={columns} filters={filters} />;
};

export default AttGradeEffectContainer;
