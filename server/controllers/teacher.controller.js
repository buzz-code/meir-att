import HttpStatus from 'http-status-codes';
import Teacher from '../models/teacher.model';
import genericController, { applyFilters, fetchPage, fetchPagePromise } from '../../common-modules/server/controllers/generic.controller';
import { getMinimalModel } from '../../common-modules/server/utils/query';
import { sendEmail } from '../../common-modules/server/utils/mailer';
import { getEmailFields } from '../utils/queryHelper';

export const { findAll, findById, store, update, destroy, uploadMultiple } = genericController(Teacher);

function getFindAllQuery(user_id, filters) {
    const dbQuery = getMinimalModel('teacher_report_status').where({ user_id });
    applyFilters(dbQuery, filters);
    return dbQuery;
}

export async function teachersWithReportStatus(req, res) {
    const dbQuery = getFindAllQuery(req.currentUser.id, req.query.filters);
    fetchPage({ dbQuery }, req.query, res);
}

export async function sendEmailToAllTeachers(req, res) {
    const { body: { filters } } = req;
    const dbQuery = getFindAllQuery(req.currentUser.id, JSON.stringify(filters));
    const { data, total } = await fetchPagePromise({ dbQuery }, { page: 0, pageSize: 100 });
    if (total > 100) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: 'לא ניתן לשלוח יותר מ100 מיילים ביום'
        });
    }

    const { subjectText, bodyText } = await getEmailFields(req.currentUser.id);

    for (const teacher of data) {
        if (!teacher.teacher_email) {
            continue;
        }
        await sendEmail(teacher.teacher_email, process.env.FROM_EMAIL_ADDRESS, subjectText, bodyText);
    }
    res.json({
        error: null,
        data: { message: 'המיילים נשלחו בהצלחה' }
    })
}