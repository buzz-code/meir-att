import React, { useMemo } from 'react';

import Table from '../../../common-modules/client/components/table/Table';

const getColumns = () => [
  { field: 'student_name', title: 'תלמידה' },
  { field: 'klasses_1', title: 'כיתת אם' },
  { field: 'klasses_2', title: 'מסלול' },
  { field: 'klasses_3', title: 'התמחות' },
  { field: 'klasses_null', title: 'התמחות נוספת' },
];
const getFilters = () => [
  { field: 'students.name', label: 'תלמידה', type: 'text', operator: 'like' },
  { field: 'klasses.name', label: 'כיתה', type: 'text', operator: 'like' },
];

const StudentKlassesKlassTypeontainer = ({ entity, title }) => {
  const columns = useMemo(() => getColumns(), []);
  const filters = useMemo(() => getFilters(), []);

  return (
    <Table
      entity={entity}
      title={title}
      columns={columns}
      filters={filters}
      disableAdd={true}
      disableDelete={true}
      disableUpdate={true}
    />
  );
};

export default StudentKlassesKlassTypeontainer;
