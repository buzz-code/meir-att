import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
  { field: 'student_comment', title: 'הערה לתלמידה', editable: 'never' },
  { field: 'klasses_1', title: 'כיתת אם' },
  { field: 'klasses_2', title: 'מסלול' },
  { field: 'klasses_3', title: 'התמחות' },
  { field: 'klasses_null', title: 'התמחות נוספת' },
];
const getFilters = ({ students, klasses }) => [
  { field: 'student_tz', label: 'תעודת זהות', type: 'text', operator: 'like' },
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
  { field: 'att_reports.report_date', label: 'מתאריך', type: 'date' },
  { field: 'att_reports.report_date', label: 'עד תאריך', type: 'date' },
  { field: 'att_reports.half', label: 'מחצית', type: 'text' },
  { field: 'lessons.name', label: 'שם שיעור מכיל', type: 'text' },
];

const getActions = (handleDownloadStudentReport) => [
  {
    icon: 'download',
    tooltip: 'הורד דוח לתלמידה',
    onClick: handleDownloadStudentReport,
  },
];

const StudentKlassesKlassTypeontainer = ({ entity, title }) => {
  const dispatch = useDispatch();
  const {
    GET: { '../get-edit-data': editData },
  } = useSelector((state) => state[entity]);

  const [conditions, setConditions] = useState({});

  const columns = useMemo(() => getColumns(editData || {}), [editData]);
  const filters = useMemo(() => getFilters(editData || {}), [editData]);

  const handleDownloadStudentReport = useCallback(
    (e, selectedRows) => {
      const personalNote = prompt('הודעה לתלמידה');
      return dispatch(
        crudAction.download(entity, 'POST', '../download-student-report', {
          klass: conditions[2]?.value,
          ids: selectedRows.map((item) => item.student_tz),
          personalNote,
          startDate: conditions[3]?.value,
          endDate: conditions[4]?.value,
          half: conditions[5]?.value,
          lessonName: conditions[6]?.value,
        })
      );
    },
    [entity, conditions]
  );

  const actions = useMemo(() => getActions(handleDownloadStudentReport), [
    handleDownloadStudentReport,
  ]);

  useEffect(() => {
    dispatch(crudAction.customHttpRequest(entity, 'GET', '../get-edit-data'));
  }, []);

  return (
    <Table
      entity={entity}
      title={title}
      columns={columns}
      filters={filters}
      additionalActions={actions}
      disableAdd={true}
      disableDelete={true}
      disableUpdate={true}
      onConditionUpdate={setConditions}
      isBulkDelete={true}
    />
  );
};

export default StudentKlassesKlassTypeontainer;
