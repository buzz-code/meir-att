import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';
import { getPropsForAutoComplete } from '../../../common-modules/client/utils/formUtil';

const getColumns = ({ students, lessons, klasses }) => [
  { field: 'student_tz', title: 'תז תלמידה', editable: 'never' },
  {
    field: 'student_tz',
    title: 'תלמידה',
    columnOrder: 'students.name',
    ...getPropsForAutoComplete('student_tz', students, 'tz'),
  },
  {
    field: 'lesson_id',
    title: 'שיעור',
    columnOrder: 'lessons.name',
    ...getPropsForAutoComplete('lesson_id', lessons, 'key'),
  },
  {
    field: 'klass_id',
    title: 'כיתה',
    columnOrder: 'klasses.name',
    ...getPropsForAutoComplete('klass_id', klasses, 'key'),
  },
  { field: 'report_month', title: 'חודש דיווח' },
  { field: 'report_date', title: 'תאריך', type: 'date' },
  { field: 'absnce_count', title: 'מספר חיסורים', type: 'numeric' },
  { field: 'absnce_code', title: 'קוד חיסור' },
  { field: 'sender_name', title: 'שם השולחת' },
  { field: 'reason', title: 'פירוט הסיבה' },
  { field: 'comment', title: 'הערה' },
];
const getFilters = ({ students, lessons, klasses }) => [
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
    field: 'lessons.key',
    label: 'שיעור',
    type: 'list',
    operator: 'eq',
    list: lessons,
    idField: 'key',
  },
  {
    field: 'klasses.key',
    label: 'כיתה',
    type: 'list',
    operator: 'eq',
    list: klasses,
    idField: 'key',
  },
  //   { field: 'report_date', label: 'מתאריך', type: 'date', operator: 'date-before' },
  //   { field: 'report_date', label: 'עד תאריך', type: 'date', operator: 'date-after' },
  { field: 'absnce_code', label: 'קוד חיסור', type: 'text', operator: 'like' },
  { field: 'sender_name', label: 'שם השולחת', type: 'text', operator: 'like' },
  { field: 'reason', label: 'פירוט הסיבה', type: 'text', operator: 'like' },
  { field: 'comment', label: 'הערה', type: 'text', operator: 'like' },
];

const KnownAbsencesContainer = ({ entity, title }) => {
  const dispatch = useDispatch();
  const {
    GET: { 'get-edit-data': editData },
  } = useSelector((state) => state[entity]);

  const columns = useMemo(() => getColumns(editData || {}), [editData]);
  const filters = useMemo(() => getFilters(editData || {}), [editData]);

  useEffect(() => {
    dispatch(crudAction.customHttpRequest(entity, 'GET', 'get-edit-data'));
  }, []);

  const manipulateDataToSave = (dataToSave) => ({
    ...dataToSave,
    report_date:
      dataToSave.report_date instanceof Date
        ? dataToSave.report_date.toISOString().substr(0, 10)
        : dataToSave.report_date.substr(0, 10),
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

export default KnownAbsencesContainer;
