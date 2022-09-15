import React, { useMemo } from 'react';

import Table from '../../../common-modules/client/components/table/Table';
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
  {
    field: 'is_report_sent',
    label: 'האם נשלח דיווח',
    type: 'list',
    operator: 'eq',
    list: booleanList,
  },
];

const TeacherReportStatusContainer = ({ entity, title }) => {
  const columns = useMemo(() => getColumns(), []);
  const filters = useMemo(() => getFilters(), []);

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

export default TeacherReportStatusContainer;
