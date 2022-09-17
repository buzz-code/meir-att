import KnownAbsence from '../models/known-absence.model';
import Student from '../models/student.model';
import User from '../models/user.model';
import genericController, { applyFilters, fetchPage } from '../../common-modules/server/controllers/generic.controller';
import { getDataToSave, getListFromTable } from '../../common-modules/server/utils/common';
import { getAndParseExcelEmail } from '../../common-modules/server/utils/email';

export const { findById, store, update, destroy, uploadMultiple } = genericController(KnownAbsence);

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
    const [students] = await Promise.all([
        getListFromTable(Student, req.currentUser.id, 'tz'),
    ]);
    res.json({
        error: null,
        data: { students }
    });
}

export async function handleEmail(req, res) {
    try {
        const data = await getAndParseExcelEmail(req, res);
        const columns = ['student_tz', '', 'absnce_count', 'absnce_code', 'sender_name', 'reason', 'comment'];
        const body = getDataToSave(data, columns);
        const report_date = new Date().toISOString().substr(0, 10);
        body.forEach(item => {
            item.report_date = report_date;
        });
        const currentUser = await User.query({
            where: { id: req.query.userId },
            select: ['email', 'id']
        }).fetch();
        await uploadMultiple({ body, currentUser });
        console.log(body.length + ' records were saved successfully');
    } catch (e) {
        console.log(e);
    }
}
