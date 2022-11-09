import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';
import { getPropsForAutoComplete } from '../../../common-modules/client/utils/formUtil';
import { booleanList } from '../../../common-modules/server/utils/list';

const getColumns = () => [
  { field: 'teacher_name', title: 'מורה' },
  { field: 'lesson_name', title: 'שיעורים' },
  { field: 'klass_name', title: 'כיתה' },
  {
    field: 'is_report_sent',
    title: 'האם נשלח דיווח',
    type: 'boolean',
    ...getPropsForAutoComplete('is_report_sent', booleanList),
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
  { field: 'teachers.name', label: 'מורה', type: 'text', operator: 'like' },
  { field: 'lessons.name', label: 'שיעור', type: 'text', operator: 'like' },
];
const getActions = (handleSendEmailToAll1, handleSendEmailToAll2) => [
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
];

const TeacherReportStatusContainer = ({ entity, title }) => {
  const dispatch = useDispatch();

  const [conditions, setConditions] = useState({});

  const handleSendEmailToAll = useCallback(
    (message) => {
      dispatch(
        crudAction.customHttpRequest(entity, 'POST', 'send-email-to-all', {
          filters: conditions,
          message,
        })
      );
    },
    [entity, conditions]
  );
  const handleSendEmailToAll1 = useCallback(() => handleSendEmailToAll(1), [handleSendEmailToAll]);
  const handleSendEmailToAll2 = useCallback(() => handleSendEmailToAll(2), [handleSendEmailToAll]);

  const columns = useMemo(() => getColumns(), []);
  const filters = useMemo(() => getFilters(), []);
  const actions = useMemo(() => getActions(handleSendEmailToAll1, handleSendEmailToAll2), [
    handleSendEmailToAll1,
    handleSendEmailToAll2,
  ]);

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
      onConditionUpdate={setConditions}
    />
  );
};

export default TeacherReportStatusContainer;
