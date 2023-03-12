import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';
import { getPropsForAutoComplete } from '../../../common-modules/client/utils/formUtil';
import { booleanList } from '../../../common-modules/server/utils/list';
import { reportTypeList } from '../../../server/utils/listHelper';

const getColumns = () => [
  { field: 'teacher_name', title: 'מורה' },
  {
    field: 'teacher_report_type',
    title: 'סוג הדיווח של המורה',
    ...getPropsForAutoComplete('teacher_report_type', reportTypeList),
  },
  { field: 'lesson_name', title: 'שיעורים' },
  { field: 'klass_name', title: 'כיתה' },
  {
    field: 'is_report_sent',
    title: 'האם נשלח דיווח',
    type: 'boolean',
    ...getPropsForAutoComplete('is_report_sent', booleanList),
  },
  {
    field: 'is_grades_sent',
    title: 'האם נשלחו ציונים',
    type: 'boolean',
    ...getPropsForAutoComplete('is_grades_sent', booleanList),
  },
];
const getFilters = () => [
  { field: 'lessons.end_date', label: 'שיעור מתאריך', type: 'date', operator: 'date-before' },
  { field: 'lessons.start_date', label: 'עד תאריך', type: 'date', operator: 'date-after' },
  {
    field: 'report_date',
    label: 'דיווח מתאריך',
    type: 'date',
    operator: 'date-before-placeholder',
  },
  { field: 'report_date', label: 'עד תאריך', type: 'date', operator: 'date-after-placeholder' },
  { field: 'sheet_name', label: 'חודש דיווח', type: 'text', operator: null },
  { field: 'teachers.name', label: 'מורה', type: 'text', operator: 'like' },
  { field: 'lessons.name', label: 'שיעור', type: 'text', operator: 'like' },
];
const getActions = (
  handleSendEmailToAll1,
  handleSendEmailToAll2,
  handleSendEmailToAll3,
  handleSendEmailToAll4
) =>
  [
    {
      icon: 'mail',
      tooltip: 'שלח מייל ראשון לכל המורות שלא שלחו דיווח',
      isFreeAction: true,
      onClick: handleSendEmailToAll1,
    },
    {
      icon: 'mail',
      tooltip: 'שלח מייל שני לכל המורות שלא שלחו דיווח',
      isFreeAction: true,
      onClick: handleSendEmailToAll2,
    },
    {
      icon: 'mail',
      tooltip: 'שלח מייל לכל המורות שכן שלחו דיווח',
      isFreeAction: true,
      onClick: handleSendEmailToAll3,
    },
    {
      icon: 'mail',
      tooltip: 'שלח מייל לכל המורות שכן שלחו ציונים',
      isFreeAction: true,
      onClick: handleSendEmailToAll4,
    },
  ].flatMap((item) => [item, { ...item, isFreeAction: false }]);

const TeacherReportStatusContainer = ({ entity, title }) => {
  const dispatch = useDispatch();

  const [conditions, setConditions] = useState({});

  const handleSendEmailToAll = useCallback(
    (message, selectedRows) => {
      dispatch(
        crudAction.customHttpRequest(entity, 'POST', 'send-email-to-all', {
          filters: conditions,
          message,
          specific:
            selectedRows?.map &&
            selectedRows.map(({ teacher_tz, lesson_id, klass_id }) => ({
              teacher_tz,
              lesson_id,
              klass_id,
            })),
        })
      );
    },
    [entity, conditions]
  );
  const handleSendEmailToAll1 = useCallback(
    (e, selectedRows) => handleSendEmailToAll(1, selectedRows),
    [handleSendEmailToAll]
  );
  const handleSendEmailToAll2 = useCallback(
    (e, selectedRows) => handleSendEmailToAll(2, selectedRows),
    [handleSendEmailToAll]
  );
  const handleSendEmailToAll3 = useCallback(
    (e, selectedRows) => handleSendEmailToAll(3, selectedRows),
    [handleSendEmailToAll]
  );
  const handleSendEmailToAll4 = useCallback(
    (e, selectedRows) => handleSendEmailToAll(4, selectedRows),
    [handleSendEmailToAll]
  );

  const columns = useMemo(() => getColumns(), []);
  const filters = useMemo(() => getFilters(), []);
  const actions = useMemo(
    () =>
      getActions(
        handleSendEmailToAll1,
        handleSendEmailToAll2,
        handleSendEmailToAll3,
        handleSendEmailToAll4
      ),
    [handleSendEmailToAll1, handleSendEmailToAll2, handleSendEmailToAll3, handleSendEmailToAll4]
  );

  return (
    <Table
      entity={entity}
      title={title}
      columns={columns}
      filters={filters}
      additionalActions={actions}
      disableAdd={true}
      disableUpdate={true}
      disableDelete={true}
      isBulkDelete={true}
      onConditionUpdate={setConditions}
    />
  );
};

export default TeacherReportStatusContainer;
