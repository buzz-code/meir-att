import React, { useMemo } from 'react';

import Table from '../../../common-modules/client/components/table/Table';
import { getPropsForAutoComplete } from '../../../common-modules/client/utils/formUtil';

import { reportTypeList } from '../../../server/utils/listHelper';

const getColumns = () => [
  { field: 'tz', title: 'תעודת זהות' },
  { field: 'name', title: 'שם' },
  { field: 'phone', title: 'מספר טלפון' },
  { field: 'phone2', title: '2 מספר טלפון' },
  { field: 'email', title: 'כתובת מייל' },
  {
    field: 'report_type',
    title: 'סוג דיווח',
    ...getPropsForAutoComplete('report_type', reportTypeList),
  },
];
const getFilters = () => [
  { field: 'tz', label: 'תעודת זהות', type: 'text', operator: 'like' },
  { field: 'name', label: 'שם', type: 'text', operator: 'like' },
  { field: 'phone', label: 'מספר טלפון', type: 'text', operator: 'like' },
  { field: 'phone2', label: '2 מספר טלפון', type: 'text', operator: 'like' },
  { field: 'report_type', label: 'סוג דיווח', type: 'list', operator: 'eq', list: reportTypeList },
];

const TeachersContainer = ({ entity, title }) => {
  const columns = useMemo(() => getColumns(), []);
  const filters = useMemo(() => getFilters(), []);

  return (
    <Table entity={entity} title={title} columns={columns} filters={filters} isBulkDelete={true} />
  );
};

export default TeachersContainer;
