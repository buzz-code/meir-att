import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';
import { getPropsForAutoComplete } from '../../../common-modules/client/utils/formUtil';

const getColumns = ({ students, teachers, klasses, lessons }) => [
  { field: 'student_tz', title: 'תז תלמידה' },
  {
    field: 'student_tz',
    title: 'תלמידה',
    columnOrder: 'students.name',
    ...getPropsForAutoComplete('student_tz', students, 'tz'),
  },
  {
    field: 'teacher_id',
    title: 'מורה',
    columnOrder: 'teachers.name',
    ...getPropsForAutoComplete('teacher_id', teachers, 'tz'),
  },
  // {
  //   field: 'klass_id',
  //   title: 'כיתה',
  //   columnOrder: 'klasses.name',
  //   ...getPropsForAutoComplete('klass_id', klasses, 'key'),
  // },
  {
    field: 'lesson_id',
    title: 'שיעור',
    columnOrder: 'lessons.name',
    ...getPropsForAutoComplete('lesson_id', lessons, 'key'),
  },
  { field: 'report_date', title: 'תאריך הדיווח', type: 'date' },
  { field: 'abs_count', title: 'חיסורים', type: 'numeric' },
  // { field: 'approved_abs_count', title: 'חיסורים מאושרים', type: 'numeric' },
  { field: 'grade', title: 'ציון' },
  { field: 'comments', title: 'הערות' },
];
const getFilters = ({ students, teachers, klasses, lessons }) => [
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
    field: 'teachers.tz',
    label: 'מורה',
    type: 'list',
    operator: 'eq',
    list: teachers,
    idField: 'tz',
  },
  // {
  //   field: 'klasses.key',
  //   label: 'כיתה',
  //   type: 'list',
  //   operator: 'eq',
  //   list: klasses,
  //   idField: 'key',
  // },
  {
    field: 'lessons.key',
    label: 'שיעור',
    type: 'list',
    operator: 'eq',
    list: lessons,
    idField: 'key',
  },
  { field: 'report_date', label: 'מתאריך', type: 'date', operator: 'date-before' },
  { field: 'report_date', label: 'עד תאריך', type: 'date', operator: 'date-after' },
  { field: 'abs_count', label: 'חיסורים', type: 'text', operator: 'like' },
  // { field: 'approved_abs_count', label: 'חיסורים מאושרים', type: 'text', operator: 'like' },
  { field: 'grade', label: 'ציון', type: 'text', operator: 'like' },
];

const AttReportsAndGradesContainer = ({ entity, title }) => {
  const dispatch = useDispatch();
  const {
    GET: { 'get-edit-data': editData },
  } = useSelector((state) => state[entity]);

  const columns = useMemo(() => getColumns(editData || {}), [editData]);
  const filters = useMemo(() => getFilters(editData || {}), [editData]);

  useEffect(() => {
    dispatch(crudAction.customHttpRequest(entity, 'GET', 'get-edit-data'));
  }, []);

  return (
    <Table
      entity={entity}
      title={title}
      columns={columns}
      filters={filters}
      disableAdd={true}
      disableUpdate={true}
      disableDelete={true}
    />
  );
};

export default AttReportsAndGradesContainer;
