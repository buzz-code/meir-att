import DashboardIcon from '@material-ui/icons/Dashboard';
import ListAltIcon from '@material-ui/icons/ListAlt';
import PeopleIcon from '@material-ui/icons/People';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import ListIcon from '@material-ui/icons/List';
import GroupIcon from '@material-ui/icons/Group';
import ChatIcon from '@material-ui/icons/Chat';
import MailIcon from '@material-ui/icons/Mail';
import AssignmentIcon from '@material-ui/icons/Assignment';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import FormatListNumberedRtlIcon from '@material-ui/icons/FormatListNumberedRtl';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import EventNoteIcon from '@material-ui/icons/EventNote';
import MenuIcon from '@material-ui/icons/Menu';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import PrintIcon from '@material-ui/icons/Print';
import GroupWorkIcon from '@material-ui/icons/GroupWork';

import * as entities from './entity';
import * as titles from './entity-title';

import Dashboard from '../containers/dashboard/DashboardContainer';
import Teachers from '../containers/teachers/TeachersContainer';
import Students from '../containers/students/StudentsContainer';
import Lessons from '../containers/lessons/LessonsContainer';
import Klasses from '../containers/klasses/KlassesContainer';
import StudentKlasses from '../containers/student-klasses/StudentKlassesContainer';
import Groups from '../containers/groups/GroupsContainer';
import Texts from '../containers/texts/TextsContainer';
import KlassTypes from '../containers/klass-types/KlassTypesContainer';
import AttReports from '../containers/att-reports/AttReportsContainer';
import PivotReports from '../containers/pivot-reports/PivotReportsContainer';
import PivotBySheetName from '../containers/pivot-by-sheet-name/PivotBySheetNameContainer';
import Grades from '../containers/grades/GradesContainer';
import PivotGrades from '../containers/pivot-grades/PivotGradesContainer';
import AttReportsAndGrades from '../containers/att-reports-and-grades/AttReportsAndGradesContainer';
import StudentKlassesKlassType from '../containers/student-klasses-klass-type/StudentKlassesKlassTypeContainer';
import ReportEdit from '../containers/report-edit/ReportEditContainer';
import GroupsPrint from '../containers/groups-print/GroupsPrintContainer';
import ExcelImport from '../containers/excel-import/ExcelImportContainer';
import KnownAbsences from '../containers/known-absences/KnownAbsencesContainer';
import AttReportsWithKnownAbsences from '../containers/att-reports-with-known-absences/AttReportsWithKnownAbsencesContainer';
import TeacherReportStatus from '../containers/teacher-report-status/TeacherReportStatusContainer';
import TeacherSalaryReport from '../containers/teacher-salary-report/TeacherSalaryReportContainer';
import StudentPercentReport from '../containers/student-percent-report/StudentPercentReportContainer';

export default [
  [
    {
      path: '/dashboard',
      component: Dashboard,
      icon: DashboardIcon,
      title: titles.DASHBOARD,
      props: { entity: entities.DASHBOARD, title: titles.DASHBOARD },
    },
    {
      icon: MenuIcon,
      title: 'טבלאות',
      subItems: [
        {
          path: '/teachers',
          component: Teachers,
          icon: SupervisedUserCircleIcon,
          title: titles.TEACHERS,
          props: { entity: entities.TEACHERS, title: titles.TEACHERS },
        },
        {
          path: '/students',
          component: Students,
          icon: PeopleIcon,
          title: titles.STUDENTS,
          props: { entity: entities.STUDENTS, title: titles.STUDENTS },
        },
        {
          path: '/lessons',
          component: Lessons,
          icon: EventNoteIcon,
          title: titles.LESSONS,
          props: { entity: entities.LESSONS, title: titles.LESSONS },
        },
        {
          path: '/klasses',
          component: Klasses,
          icon: GroupIcon,
          title: titles.KLASSS,
          props: { entity: entities.KLASSS, title: titles.KLASSS },
        },
        {
          path: '/student-klasses',
          component: StudentKlasses,
          icon: GroupWorkIcon,
          title: titles.STUDENT_KLASSES,
          props: { entity: entities.STUDENT_KLASSES, title: titles.STUDENT_KLASSES },
        },
        // {
        //   path: '/groups',
        //   component: Groups,
        //   icon: GroupAddIcon,
        //   title: titles.GROUPS,
        //   props: { entity: entities.GROUPS, title: titles.GROUPS },
        // },
        {
          path: '/texts',
          component: Texts,
          icon: ChatIcon,
          title: titles.TEXTS,
          props: { entity: entities.TEXTS, title: titles.TEXTS },
        },
        {
          path: '/klass-types',
          component: KlassTypes,
          icon: MenuIcon,
          title: titles.KLASS_TYPES,
          props: { entity: entities.KLASS_TYPES, title: titles.KLASS_TYPES },
        },
      ],
    },
    {
      icon: AssignmentTurnedInIcon,
      title: 'נתונים',
      subItems: [
        {
          path: '/att-reports',
          component: AttReports,
          icon: AssignmentTurnedInIcon,
          title: titles.ATT_REPORTS,
          props: { entity: entities.ATT_REPORTS, title: titles.ATT_REPORTS },
        },
        {
          path: '/grades',
          component: Grades,
          icon: AssignmentTurnedInIcon,
          title: titles.GRADES,
          props: { entity: entities.GRADES, title: titles.GRADES },
        },
        {
          path: '/att-reports-and-grades',
          component: AttReportsAndGrades,
          icon: AssignmentTurnedInIcon,
          title: titles.ATT_REPORTS_AND_GRADES,
          props: { entity: entities.ATT_REPORTS_AND_GRADES, title: titles.ATT_REPORTS_AND_GRADES },
        },
        {
          path: '/known-absences',
          component: KnownAbsences,
          icon: AssignmentTurnedInIcon,
          title: titles.KNOWN_ABSENCES,
          props: { entity: entities.KNOWN_ABSENCES, title: titles.KNOWN_ABSENCES },
        },
      ],
    },
  ],
  [
    { path: '/excel-import', component: ExcelImport, icon: FileCopyIcon, title: 'העלאת קבצים' },
    {
      path: '/teacher-report-status',
      component: TeacherReportStatus,
      icon: MailIcon,
      title: titles.TEACHER_REPORT_STATUS,
      props: {
        entity: entities.TEACHER_REPORT_STATUS,
        title: titles.TEACHER_REPORT_STATUS,
      },
    },
  ],
  [
    // {
    //   path: '/groups-print',
    //   component: GroupsPrint,
    //   icon: PrintIcon,
    //   title: titles.GROUPS_PRINT,
    //   props: { entity: entities.GROUPS, title: titles.GROUPS_PRINT },
    // },
    {
      icon: AssignmentTurnedInIcon,
      title: 'דוחות',
      subItems: [
        {
          path: '/student-klasses-klass-type',
          component: StudentKlassesKlassType,
          icon: GroupWorkIcon,
          title: titles.STUDENT_KLASSES_KLASS_TYPE,
          props: {
            entity: entities.STUDENT_KLASSES_KLASS_TYPE,
            title: titles.STUDENT_KLASSES_KLASS_TYPE,
          },
        },
        {
          path: '/report-with-known-absences',
          component: AttReportsWithKnownAbsences,
          icon: AssignmentTurnedInIcon,
          title: titles.ATT_REPORTS_WITH_KNOWN_ABSENCES,
          props: {
            entity: entities.ATT_REPORTS_WITH_KNOWN_ABSENCES,
            title: titles.ATT_REPORTS_WITH_KNOWN_ABSENCES,
          },
        },
        {
          path: '/pivot-reports',
          component: PivotReports,
          icon: AssignmentTurnedInIcon,
          title: titles.PIVOT_REPORTS,
          props: { entity: entities.PIVOT_REPORTS, title: titles.PIVOT_REPORTS },
        },
        {
          path: '/pivot-by-sheet-name',
          component: PivotBySheetName,
          icon: AssignmentTurnedInIcon,
          title: titles.PIVOT_BY_SHEET_NAME,
          props: { entity: entities.PIVOT_BY_SHEET_NAME, title: titles.PIVOT_BY_SHEET_NAME },
        },
        {
          path: '/pivot-grades',
          component: PivotGrades,
          icon: AssignmentTurnedInIcon,
          title: titles.PIVOT_GRADES,
          props: { entity: entities.PIVOT_GRADES, title: titles.PIVOT_GRADES },
        },
        {
          path: '/teacher-salary-report',
          component: TeacherSalaryReport,
          icon: AssignmentTurnedInIcon,
          title: titles.TEACHER_SALARY_REPORT,
          props: {
            entity: entities.TEACHER_SALARY_REPORT,
            title: titles.TEACHER_SALARY_REPORT,
          },
        },
        {
          path: '/student-percent-report',
          component: StudentPercentReport,
          icon: AssignmentTurnedInIcon,
          title: titles.STUDENT_PERCENTS_REPORT,
          props: {
            entity: entities.STUDENT_PERCENTS_REPORT,
            title: titles.STUDENT_PERCENTS_REPORT,
          },
        },
        // {
        //   path: '/report-edit',
        //   component: ReportEdit,
        //   icon: AssignmentIcon,
        //   title: titles.REPORT_EDIT,
        //   props: { entity: entities.REPORT_EDIT, title: titles.REPORT_EDIT },
        // },
      ],
    },
  ],
  // [
  //   {
  //     path: '/student-reports',
  //     component: StudentReports,
  //     icon: AssignmentIcon,
  //     title: titles.STUDENT_REPORTS,
  //     props: { entity: entities.STUDENT_REPORTS, title: titles.STUDENT_REPORTS },
  //   },
  //   {
  //     path: '/teacher-reports',
  //     component: TeacherReports,
  //     icon: AssignmentIcon,
  //     title: titles.TEACHER_REPORTS,
  //     props: { entity: entities.TEACHER_REPORTS, title: titles.TEACHER_REPORTS },
  //   },
  //   {
  //     path: '/organization-reports',
  //     component: OrganizationReports,
  //     icon: AssignmentIcon,
  //     title: titles.ORGANIATION_REPORTS,
  //     props: { entity: entities.ORGANIATION_REPORTS, title: titles.ORGANIATION_REPORTS },
  //   },
  //   {
  //     path: '/daily-reports',
  //     component: DailyReports,
  //     icon: AssignmentIcon,
  //     title: titles.DAILY_REPORTS,
  //     props: { entity: entities.DAILY_REPORTS, title: titles.DAILY_REPORTS },
  //   },
  //   {
  //     path: '/monthly-reports',
  //     component: MonthlyReports,
  //     icon: AssignmentIcon,
  //     title: titles.MONTHLY_REPORTS,
  //     props: { entity: entities.MONTHLY_REPORTS, title: titles.MONTHLY_REPORTS },
  //   },
  // ],
];
