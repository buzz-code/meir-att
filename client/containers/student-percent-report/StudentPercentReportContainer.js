import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';
import {
  getPropsForAutoComplete,
  getPropsForHideZeroValues,
} from '../../../common-modules/client/utils/formUtil';

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
  { field: 'klasses_name', title: 'כיתות' },
  {
    field: 'lesson_id',
    title: 'שיעור',
    columnOrder: 'lessons.name',
    ...getPropsForAutoComplete('lesson_id', lessons, 'key'),
  },
  // { field: 'report_date', title: 'תאריך הדיווח', type: 'date' },
  { field: 'how_many_lessons', title: 'מספר שיעורים', type: 'numeric' },
  {
    field: 'abs_count',
    title: 'חיסורים',
    type: 'numeric',
    ...getPropsForHideZeroValues('abs_count'),
  },
  // { field: 'approved_abs_count', title: 'חיסורים מאושרים', type: 'numeric' },
  // { field: 'sheet_name', title: 'חודש דיווח' },
  // { field: 'absnce_count', title: 'חיסורים מאושרים', editable: 'never' },
  { field: 'percents_formatted', title: 'אחוזים', columnOrder: 'percents' },
  {
    field: 'grade',
    title: 'ציון',
    type: 'numeric',
    ...getPropsForHideZeroValues('grade'),
  },
  { field: 'att_grade_effect', title: 'קשר נוכחות ציון' },
  { field: 'grade_affected', title: 'ציון סופי' },
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
  {
    field: 'klasses.key',
    label: 'כיתה',
    type: 'list',
    operator: 'eq',
    list: klasses,
    idField: 'key',
  },
  {
    field: 'lessons.key',
    label: 'שיעור',
    type: 'list',
    operator: 'eq',
    list: lessons,
    idField: 'key',
  },
  {
    field: 'att_reports_and_grades.report_date',
    label: 'מתאריך',
    type: 'date',
    operator: 'date-before',
  },
  {
    field: 'att_reports_and_grades.report_date',
    label: 'עד תאריך',
    type: 'date',
    operator: 'date-after',
  },
  // { field: 'abs_count', label: 'חיסורים', type: 'text', operator: 'like' },
  // { field: 'approved_abs_count', label: 'חיסורים מאושרים', type: 'text', operator: 'like' },
  // { field: 'sheet_name', label: 'חודש דיווח', type: 'text', operator: 'like' },
  // { field: 'comments', label: 'הערות', type: 'text', operator: 'like' },
];

const StudentPercentReportContainer = ({ entity, title }) => {
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

export default StudentPercentReportContainer;
