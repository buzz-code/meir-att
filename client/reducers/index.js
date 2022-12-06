import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { reducer as formReducer } from 'redux-form';

// Import custom components
import authReducer from '../../common-modules/client/reducers/authReducer';
import crudReducer from '../../common-modules/client/reducers/crudReducer';
import {
  TEACHERS,
  STUDENTS,
  LESSONS,
  KLASSS,
  STUDENT_KLASSES,
  GROUPS,
  TEXTS,
  KLASS_TYPES,
  ATT_REPORTS,
  PIVOT_REPORTS,
  GRADES,
  PIVOT_GRADES,
  ATT_REPORTS_AND_GRADES,
  STUDENT_KLASSES_KLASS_TYPE,
  REPORT_EDIT,
  // STUDENT_REPORTS,
  // TEACHER_REPORTS,
  // ORGANIATION_REPORTS,
  DASHBOARD,
  KNOWN_ABSENCES,
  ATT_REPORTS_WITH_KNOWN_ABSENCES,
  TEACHER_REPORT_STATUS,
  PIVOT_BY_SHEET_NAME,
  TEACHER_SALARY_REPORT,
} from '../constants/entity';

const appReducer = (history) =>
  combineReducers({
    router: connectRouter(history),
    form: formReducer, // ← redux-form
    auth: authReducer,
    [TEACHERS]: crudReducer(TEACHERS),
    [STUDENTS]: crudReducer(STUDENTS),
    [LESSONS]: crudReducer(LESSONS),
    [KLASSS]: crudReducer(KLASSS),
    [STUDENT_KLASSES]: crudReducer(STUDENT_KLASSES),
    [GROUPS]: crudReducer(GROUPS),
    [KLASS_TYPES]: crudReducer(KLASS_TYPES),
    [TEXTS]: crudReducer(TEXTS),
    [ATT_REPORTS]: crudReducer(ATT_REPORTS),
    [PIVOT_REPORTS]: crudReducer(PIVOT_REPORTS),
    [PIVOT_BY_SHEET_NAME]: crudReducer(PIVOT_BY_SHEET_NAME),
    [GRADES]: crudReducer(GRADES),
    [ATT_REPORTS_AND_GRADES]: crudReducer(ATT_REPORTS_AND_GRADES),
    [PIVOT_GRADES]: crudReducer(PIVOT_GRADES),
    [STUDENT_KLASSES_KLASS_TYPE]: crudReducer(STUDENT_KLASSES_KLASS_TYPE),
    [REPORT_EDIT]: crudReducer(REPORT_EDIT),
    // [STUDENT_REPORTS]: crudReducer(STUDENT_REPORTS),
    // [TEACHER_REPORTS]: crudReducer(TEACHER_REPORTS),
    // [ORGANIATION_REPORTS]: crudReducer(ORGANIATION_REPORTS),
    [DASHBOARD]: crudReducer(DASHBOARD),
    [KNOWN_ABSENCES]: crudReducer(KNOWN_ABSENCES),
    [ATT_REPORTS_WITH_KNOWN_ABSENCES]: crudReducer(ATT_REPORTS_WITH_KNOWN_ABSENCES),
    [TEACHER_REPORT_STATUS]: crudReducer(TEACHER_REPORT_STATUS),
    [TEACHER_SALARY_REPORT]: crudReducer(TEACHER_SALARY_REPORT),
  });

const rootReducer = (state, action) => {
  if (action === 'LOG_OUT_SUCCESS') {
    state = undefined;
  }

  return appReducer(state, action);
};

export default rootReducer;
