import React from 'react';

import * as entities from '../../constants/entity';
import * as titles from '../../constants/entity-title';
import ExcelImport from '../../../common-modules/client/components/excel-import/ExcelImport';

const title = 'העלאת קובץ';
const supportedEntities = [
  {
    value: entities.TEACHERS,
    title: titles.TEACHERS,
    columns: ['tz', 'name', 'phone', 'phone2', 'email'],
  },
  { value: entities.STUDENTS, title: titles.STUDENTS, columns: ['tz', 'name'] },
  {
    value: entities.LESSONS,
    title: titles.LESSONS,
    columns: ['key', 'name', 'klasses', 'teacher_id', 'start_date', 'end_date'],
  },
  { value: entities.KLASSS, title: titles.KLASSS, columns: ['key', 'name'] },
  {
    value: entities.STUDENT_KLASSES,
    title: titles.STUDENT_KLASSES,
    columns: ['student_tz', 'klass_id'],
  },
  {
    value: entities.GROUPS,
    title: titles.GROUPS,
    columns: ['klass_id', 'teacher_id', 'lesson_id'],
  },
  {
    value: entities.ATT_REPORTS,
    title: titles.ATT_REPORTS,
    columns: [
      'student_tz',
      'teacher_id',
      // 'klass_id',
      'lesson_id',
      'report_date',
      'abs_count',
      // 'approved_abs_count',
      'comments',
    ],
  },
];

const ExcelImportContainer = () => {
  return <ExcelImport title={title} supportedEntities={supportedEntities} />;
};

export default ExcelImportContainer;
