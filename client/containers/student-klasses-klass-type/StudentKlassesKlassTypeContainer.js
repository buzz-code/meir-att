import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';
import { getPropsForAutoComplete } from '../../../common-modules/client/utils/formUtil';

const getColumns = ({ students, klasses }) => [
  { field: 'student_tz', title: 'תז', editable: 'never' },
  {
    field: 'student_tz',
    title: 'תלמידה',
    columnOrder: 'students.name',
    ...getPropsForAutoComplete('student_tz', students, 'tz'),
  },
  { field: 'klasses_1', title: 'כיתת אם' },
  { field: 'klasses_2', title: 'מסלול' },
  { field: 'klasses_3', title: 'התמחות' },
  { field: 'klasses_null', title: 'התמחות נוספת' },
];
const getFilters = ({ students, klasses }) => [
  { field: 'תלמידה', label: 'תעודת זהות', type: 'text', operator: 'like' },
  {
    field: 'students.tz',
    label: 'תלמידה',
    type: 'list',
    operator: 'eq',
    list: students,
    idField: 'tz',
  },
  {
    field: 'klasses.key',
    label: 'כיתה',
    type: 'list',
    operator: 'eq',
    list: klasses,
    idField: 'key',
  },
];

const StudentKlassesKlassTypeontainer = ({ entity, title }) => {
  const dispatch = useDispatch();
  const {
    GET: { '../get-edit-data': editData },
  } = useSelector((state) => state[entity]);

  const columns = useMemo(() => getColumns(editData || {}), [editData]);
  const filters = useMemo(() => getFilters(editData || {}), [editData]);

  useEffect(() => {
    dispatch(crudAction.customHttpRequest(entity, 'GET', '../get-edit-data'));
  }, []);

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
