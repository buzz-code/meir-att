import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';
import { getPropsForAutoComplete } from '../../../common-modules/client/utils/formUtil';
import { booleanList } from '../../../common-modules/server/utils/list';

const getColumns = () => [
  { field: 'teacher_name', title: 'מורה' },
  { field: 'teacher_email', title: 'מייל מורה' },
  { field: 'lesson_name', title: 'שיעורים' },
  {
    field: 'is_report_sent',
    title: 'האם נשלח דיווח',
    type: 'boolean',
    ...getPropsForAutoComplete('is_report_sent', booleanList),
  },
];
const getFilters = () => [
  { field: 'teachers.name', label: 'מורה', type: 'text', operator: 'like' },
  { field: 'lessons.name', label: 'שיעור', type: 'text', operator: 'like' },
  { field: 'lessons.end_date', label: 'מתאריך', type: 'date', operator: 'date-before' },
  { field: 'lessons.start_date', label: 'עד תאריך', type: 'date', operator: 'date-after' },
];
const getActions = (handleSendEmailToAll) => [
  {
    icon: 'mail',
    tooltip: 'שלח מייל לכל המורות',
    isFreeAction: true,
    onClick: handleSendEmailToAll,
  },
];

const TeacherReportStatusContainer = ({ entity, title }) => {
  const dispatch = useDispatch();

  const [conditions, setConditions] = useState({});

  const handleSendEmailToAll = useCallback(() => {
    dispatch(
      crudAction.customHttpRequest(entity, 'POST', 'send-email-to-all', { filters: conditions })
    );
  }, [entity, conditions]);

  const columns = useMemo(() => getColumns(), []);
  const filters = useMemo(() => getFilters(), []);
  const actions = useMemo(() => getActions(handleSendEmailToAll), [handleSendEmailToAll]);

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
