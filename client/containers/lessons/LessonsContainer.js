import React, { useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';
import { getPropsForAutoComplete } from '../../../common-modules/client/utils/formUtil';

const getColumns = ({ teachers, klasses }) => [
  { field: 'key', title: 'מזהה' },
  { field: 'name', title: 'שם' },
  { field: 'klasses', title: 'כיתות' },
  {
    field: 'klasses',
    title: 'כיתה',
    columnOrder: 'klasses.name',
    ...getPropsForAutoComplete('klasses', klasses, 'key'),
  },
  {
    field: 'teacher_id',
    title: 'מורה',
    columnOrder: 'teachers.name',
    ...getPropsForAutoComplete('teacher_id', teachers, 'tz'),
  },
  { field: 'start_date', title: 'תאריך התחלה', type: 'date' },
  { field: 'end_date', title: 'תאריך סיום', type: 'date' },
];
const getFilters = ({ teachers, klasses }) => [
  { field: 'key', label: 'מזהה', type: 'text', operator: 'like' },
  { field: 'name', label: 'שם', type: 'text', operator: 'like' },
  { field: 'klasses', label: 'כיתות', type: 'list', operator: 'eq', list: klasses, idField: 'key' },
  {
    field: 'teacher_id',
    label: 'מורה',
    type: 'list',
    operator: 'eq',
    list: teachers,
    idField: 'tz',
  },
  { field: 'end_date', label: 'מתאריך', type: 'date', operator: 'date-before' },
  { field: 'start_date', label: 'עד תאריך', type: 'date', operator: 'date-after' },
];
const getActions = (
  handleSendEmailWithFileAtt,
  handleDownloadOneFileAtt,
  handleSendEmailWithFileGrade,
  handleDownloadOneFileGrade
) => [
  {
    icon: 'mail',
    tooltip: 'שלח מייל עם קובץ נוכחות',
    onClick: handleSendEmailWithFileAtt,
  },
  {
    icon: 'download',
    tooltip: 'הורד קובץ נוכחות',
    onClick: handleDownloadOneFileAtt,
    position: 'row',
  },
  {
    icon: 'mail',
    tooltip: 'שלח מייל עם קובץ ציונים',
    onClick: handleSendEmailWithFileGrade,
  },
  {
    icon: 'download',
    tooltip: 'הורד קובץ ציונים',
    onClick: handleDownloadOneFileGrade,
    position: 'row',
  },
];

const LessonsContainer = ({ entity, title }) => {
  const dispatch = useDispatch();
  const {
    GET: { 'get-edit-data': editData },
  } = useSelector((state) => state[entity]);

  const handleSendEmailWithFile = useCallback(
    (e, selectedRows, type) => {
      return dispatch(
        crudAction.customHttpRequest(entity, 'POST', 'send-email-with-file', {
          type,
          ids: selectedRows.map((item) => item.id),
        })
      );
    },
    [entity]
  );
  const handleDownloadOneFile = useCallback(
    (e, rowData, type) => {
      dispatch(
        crudAction.download(entity, 'POST', 'download-one-excel', {
          type,
          id: rowData.id,
        })
      );
    },
    [entity]
  );
  const handleSendEmailWithFileAtt = useCallback((a, b) => handleSendEmailWithFile(a, b, 'Att'), [
    handleSendEmailWithFile,
  ]);
  const handleSendEmailWithFileGrade = useCallback(
    (a, b) => handleSendEmailWithFile(a, b, 'Grade'),
    [handleSendEmailWithFile]
  );
  const handleDownloadOneFileAtt = useCallback((a, b) => handleDownloadOneFile(a, b, 'Att'), [
    handleDownloadOneFile,
  ]);
  const handleDownloadOneFileGrade = useCallback((a, b) => handleDownloadOneFile(a, b, 'Grade'), [
    handleDownloadOneFile,
  ]);
  const columns = useMemo(() => getColumns(editData || {}), [editData]);
  const filters = useMemo(() => getFilters(editData || {}), [editData]);
  const actions = useMemo(
    () =>
      getActions(
        handleSendEmailWithFileAtt,
        handleDownloadOneFileAtt,
        handleSendEmailWithFileGrade,
        handleDownloadOneFileGrade
      ),
    [
      handleSendEmailWithFileAtt,
      handleDownloadOneFileAtt,
      handleSendEmailWithFileGrade,
      handleDownloadOneFileGrade,
    ]
  );

  useEffect(() => {
    dispatch(crudAction.customHttpRequest(entity, 'GET', 'get-edit-data'));
  }, []);

  const manipulateDataToSave = (dataToSave) => ({
    ...dataToSave,
    start_date:
      dataToSave.start_date instanceof Date
        ? dataToSave.start_date.toISOString().substr(0, 10)
        : dataToSave.start_date != null
        ? dataToSave.start_date.substr(0, 10)
        : null,
    end_date:
      dataToSave.end_date instanceof Date
        ? dataToSave.end_date.toISOString().substr(0, 10)
        : dataToSave.end_date != null
        ? dataToSave.end_date.substr(0, 10)
        : null,
  });

  return (
    <Table
      entity={entity}
      title={title}
      columns={columns}
      filters={filters}
      additionalActions={actions}
      manipulateDataToSave={manipulateDataToSave}
      isBulkDelete={true}
    />
  );
};

export default LessonsContainer;
