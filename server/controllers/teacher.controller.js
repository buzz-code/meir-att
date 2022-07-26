import HttpStatus from 'http-status-codes';
import format from 'string-format';
import { Teacher } from '../models';
import { applyFilters, fetchPage, fetchPagePromise } from '../../common-modules/server/controllers/generic.controller';
import { sendEmail } from '../../common-modules/server/utils/mailer';
import { getEmailFields } from '../utils/queryHelper';
import bookshelf from '../../common-modules/server/config/bookshelf';

function getDatesFromFilters(filters) {
    const dates = {
        startDate: new Date('2000-01-01'),
        endDate: new Date('2100-12-31'),
        sheetName: '',
    };
    try {
        const conditions = JSON.parse(filters);
        if (conditions?.[2]?.value) {
            dates.startDate = conditions[2].value;
        }
        if (conditions?.[3]?.value) {
            dates.endDate = conditions[3].value;
        }
        if (conditions?.[4]?.value) {
            dates.sheetName = conditions[4].value;
        }
    } catch {
    }
    return dates;
}

export function getFindAllQuery(user_id, filters) {
    const { startDate, endDate, sheetName } = getDatesFromFilters(filters);
    const dbQuery = new Teacher()
        .where({ 'teachers.user_id': user_id })
        .query(qb => {
            qb.join('lessons', { 'lessons.teacher_id': 'teachers.tz', 'lessons.user_id': 'teachers.user_id' })
            qb.join('klasses', { 'lessons.klasses': 'klasses.key', 'lessons.user_id': 'klasses.user_id' })
            qb.leftJoin('att_reports', function () {
                this.on({
                    'att_reports.teacher_id': 'teachers.tz',
                    'att_reports.lesson_id': 'lessons.key',
                    'att_reports.user_id': 'teachers.user_id'
                })
                    .andOn(bookshelf.knex.raw('report_date >= ?', startDate))
                    .andOn(bookshelf.knex.raw('report_date <= ?', endDate))
                    .andOn(bookshelf.knex.raw('sheet_name like ?', `%${sheetName}%`))
            })
        });

    applyFilters(dbQuery, filters);

    const countQuery = dbQuery.clone().query()
        .countDistinct({ count: ['teachers.id', 'lessons.id'] })
        .then(res => res[0].count);

    dbQuery.query(qb => {
        qb.groupBy('teachers.id', 'lessons.id', 'klasses.id')
        qb.select({
            teacher_name: 'teachers.name',
            teacher_email: 'teachers.email',
            lesson_name: 'lessons.name',
            klass_name: 'klasses.name',
            is_report_sent: bookshelf.knex.raw('if(count(att_reports.id) > 0, 1, 0)'),
        })
    });
    return { dbQuery, countQuery };
}

export async function teachersWithReportStatus(req, res) {
    const { dbQuery, countQuery } = getFindAllQuery(req.currentUser.id, req.query.filters);
    fetchPage({ dbQuery, countQuery }, req.query, res);
}

export async function sendEmailToAllTeachers(req, res) {
    const { body: { filters, message } } = req;
    const { dbQuery, countQuery } = getFindAllQuery(req.currentUser.id, JSON.stringify(filters));
    const { data } = await fetchPagePromise({ dbQuery, countQuery }, { page: 0, pageSize: 1000 });

    const teachersToSend = data
        .filter(item => !item.is_report_sent || message == 3 && item.is_report_sent)
        .filter(item => item.teacher_email);

    if (teachersToSend.length > 100) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: 'לא ניתן לשלוח יותר מ100 מיילים ביום'
        });
    }

    const { subjectText, bodyText } = await getEmailFields(req.currentUser.id, message);
    const { from_email, reply_to_email } = req.currentUser.toJSON();

    for (const teacherDetails of teachersToSend) {
        const body = format(bodyText, teacherDetails.teacher_name, teacherDetails.lesson_name, teacherDetails.klass_name);
        await sendEmail(teacherDetails.teacher_email, from_email, subjectText, body, undefined, reply_to_email);
    }

    res.json({
        error: null,
        data: { message: 'המיילים נשלחו בהצלחה' }
    })
}