import { Klass, KnownAbsence, Lesson, Student, User } from '../models';
import { applyFilters, fetchPage } from '../../common-modules/server/controllers/generic.controller';
import { getDataToSave, getListFromTable } from '../../common-modules/server/utils/common';
import { getAndParseExcelEmail } from '../../common-modules/server/utils/email';

/**
 * Find all the items
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export async function findAll(req, res) {
    const dbQuery = new KnownAbsence()
        .where({ 'known_absences.user_id': req.currentUser.id })
        .query(qb => {
            qb.leftJoin('students', { 'students.tz': 'known_absences.student_tz', 'students.user_id': 'known_absences.user_id' })
            qb.leftJoin('lessons', { 'lessons.key': 'known_absences.lesson_id', 'lessons.user_id': 'known_absences.user_id' })
            qb.leftJoin('klasses', { 'klasses.key': 'known_absences.klass_id', 'klasses.user_id': 'known_absences.user_id' })
            qb.select('known_absences.*')
        });
    applyFilters(dbQuery, req.query.filters);
    fetchPage({ dbQuery }, req.query, res);
}

/**
 * Get edit data
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export async function getEditData(req, res) {
    const [students, lessons, klasses] = await Promise.all([
        getListFromTable(Student, req.currentUser.id, 'tz'),
        getListFromTable(Lesson, req.currentUser.id, 'key'),
        getListFromTable(Klass, req.currentUser.id, 'key'),
    ]);
    res.json({
        error: null,
        data: { students, lessons, klasses }
    });
}

export async function handleEmail(req, res, ctrl) {
    try {
        const { data, sheetName } = await getAndParseExcelEmail(req);
        const columns = ['student_tz', '', 'lesson_id', 'klass_id', 'report_month', 'absnce_count', 'absnce_code', 'sender_name', 'reason', 'comment'];
        const body = getDataToSave(data, columns);
        const report_date = new Date().toISOString().substr(0, 10);
        body.forEach(item => {
            item.report_date = report_date;
        });
        const currentUser = await User.query({
            where: { id: req.query.userId },
            select: ['email', 'id']
        }).fetch();
        await ctrl.uploadMultiple({ body, currentUser });
        console.log(body.length + ' records were saved successfully');
        res.send({ success: true, message: body.length + ' רשומות נשמרו בהצלחה' });
    } catch (e) {
        console.log(e);
        res.status(500).send({ success: false, message: e.message });
    }
}
