import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';
import { getPropsForAutoComplete } from '../../../common-modules/client/utils/formUtil';

const getColumns = ({ teachers, klasses, lessons }) => [
  {
    field: 'teacher_id',
    title: 'מורה',
    columnOrder: 'teachers.name',
    ...getPropsForAutoComplete('teacher_id', teachers, 'tz'),
  },
  {
    field: 'klass_id',
    title: 'כיתה',
    columnOrder: 'klasses.name',
    ...getPropsForAutoComplete('klass_id', klasses, 'key'),
  },
  {
    field: 'lesson_id',
    title: 'שיעור',
    columnOrder: 'lessons.name',
    ...getPropsForAutoComplete('lesson_id', lessons, 'key'),
  },
  { field: 'how_many_lessons', title: 'מספר שיעורים', type: 'numeric' },
  { field: 'sheet_name', title: 'חודש דיווח' },
];
const getFilters = ({ teachers, klasses, lessons }) => [
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
  { field: 'att_reports.report_date', label: 'מתאריך', type: 'date', operator: 'date-before' },
  { field: 'att_reports.report_date', label: 'עד תאריך', type: 'date', operator: 'date-after' },
  { field: 'sheet_name', label: 'חודש דיווח', type: 'text', operator: 'like' },
];

const TeacherSalaryReportContainer = ({ entity, title }) => {
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

export default TeacherSalaryReportContainer;
