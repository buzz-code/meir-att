import Teacher from '../models/teacher.model';
import genericController, { applyFilters, fetchPage } from '../../common-modules/server/controllers/generic.controller';
import bookshelf from '../../common-modules/server/config/bookshelf';

export const { findAll, findById, store, update, destroy, uploadMultiple } = genericController(Teacher);

export async function teachersWithReportStatus(req, res) {
    const dbQuery = new Teacher()
        .where({ 'teachers.user_id': req.currentUser.id })
        .query(qb => {
            qb.leftJoin('lessons', { 'lessons.teacher_id': 'teachers.tz', 'lessons.user_id': 'teachers.user_id' })
            qb.leftJoin('att_reports', { 'att_reports.teacher_id': 'teachers.tz', 'att_reports.user_id': 'teachers.user_id' })
        });
    applyFilters(dbQuery, req.query.filters);
    const countQuery = dbQuery.clone().query()
        .countDistinct({ count: ['teachers.id'] })
        .then(res => res[0].count);
    dbQuery.query(qb => {
        qb.groupBy('teachers.id')
        qb.select({
            teacher_name: 'teachers.name',
            teacher_email: 'teachers.email',
            lesson_name: bookshelf.knex.raw('GROUP_CONCAT(lessons.name SEPARATOR ", ")'),
            is_report_sent: bookshelf.knex.raw('if(count(att_reports.id) > 0, 1, 0)'),
        })
    });
    fetchPage({ dbQuery, countQuery }, req.query, res);
}
