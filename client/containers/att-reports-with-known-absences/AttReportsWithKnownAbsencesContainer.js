import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';
import { getPropsForAutoComplete } from '../../../common-modules/client/utils/formUtil';

const getColumns = ({ students }) => [
  { field: 'student_tz', title: 'תז תלמידה' },
  {
    field: 'student_tz',
    title: 'תלמידה',
    columnOrder: 'students.name',
    ...getPropsForAutoComplete('student_tz', students, 'tz'),
  },
  { field: 'student_base_klass', title: 'כיתת בסיס' },
  { field: 'klass_name', title: 'כיתה' },
  { field: 'how_many_lessons', title: 'מספר שיעורים', type: 'numeric' },
  { field: 'abs_count', title: 'חיסורים', type: 'numeric' },
  { field: 'percents_formatted', title: 'אחוזים', columnOrder: 'percents' },
  // { field: 'approved_abs_count', title: 'חיסורים מאושרים', type: 'numeric' },
  { field: 'known_absences_1', title: 'חיסורים שאושרו עם קוד 1', type: 'numeric' },
  { field: 'known_absences_2', title: 'חיסורים שאושרו עם קוד 2', type: 'numeric' },
];
const getFilters = ({ students, klasses }) => [
  { field: 'student_tz', label: 'תז תלמידה', type: 'text', operator: 'like' },
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
  { field: 'report_date', label: 'מתאריך', type: 'date', operator: 'date-before' },
  { field: 'report_date', label: 'עד תאריך', type: 'date', operator: 'date-after' },
  { field: 'abs_count', label: 'חיסורים', type: 'text', operator: 'like' },
  // { field: 'approved_abs_count', label: 'חיסורים מאושרים', type: 'text', operator: 'like' },
  { field: 'known_absences_1', label: 'חיסורים שאושרו עם קוד 1', type: 'text', operator: 'like' },
  { field: 'known_absences_2', label: 'חיסורים שאושרו עם קוד 2', type: 'text', operator: 'like' },
];

const AttReportsWithKnownAbsencesContainer = ({ entity, title }) => {
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

export default AttReportsWithKnownAbsencesContainer;
