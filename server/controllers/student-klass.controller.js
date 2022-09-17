import StudentKlass from '../models/student-klass.model';
import Student from '../models/student.model';
import Klass from '../models/klass.model';
import genericController, { applyFilters, fetchPage } from '../../common-modules/server/controllers/generic.controller';
import { getListFromTable } from '../../common-modules/server/utils/common';
import bookshelf from '../../common-modules/server/config/bookshelf';

export const { findById, store, update, destroy, uploadMultiple } = genericController(StudentKlass);

/**
 * Find all the items
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export async function findAll(req, res) {
    const dbQuery = new StudentKlass()
        .where({ 'student_klasses.user_id': req.currentUser.id })
        .query(qb => {
            qb.leftJoin('students', { 'students.tz': 'student_klasses.student_tz', 'students.user_id': 'student_klasses.user_id' })
            qb.leftJoin('klasses', { 'klasses.key': 'student_klasses.klass_id', 'klasses.user_id': 'student_klasses.user_id' })
            qb.select('student_klasses.*')
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
    const [students, klasses] = await Promise.all([
        getListFromTable(Student, req.currentUser.id, 'tz'),
        getListFromTable(Klass, req.currentUser.id, 'key'),
    ]);
    res.json({
        error: null,
        data: { students, klasses }
    });
}

/**
 * report by klass type
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export async function reportByKlassType(req, res) {
    const dbQuery = new StudentKlass()
        .where({ 'student_klasses.user_id': req.currentUser.id })
        .query(qb => {
            qb.leftJoin('students', { 'students.tz': 'student_klasses.student_tz', 'students.user_id': 'student_klasses.user_id' })
            qb.leftJoin('klasses', { 'klasses.key': 'student_klasses.klass_id', 'klasses.user_id': 'student_klasses.user_id' })
        });
    applyFilters(dbQuery, req.query.filters);
    const countQuery = dbQuery.clone().query()
        .countDistinct({ count: ['students.id'] })
        .then(res => res[0].count);
    dbQuery.query(qb => {
        qb.groupBy('students.id')
        qb.select({
            student_name: 'students.name',
            klasses_1: bookshelf.knex.raw('GROUP_CONCAT(if(klasses.klass_type_id = 1, klasses.name, null) SEPARATOR ", ")'),
            klasses_2: bookshelf.knex.raw('GROUP_CONCAT(if(klasses.klass_type_id = 2, klasses.name, null) SEPARATOR ", ")'),
            klasses_3: bookshelf.knex.raw('GROUP_CONCAT(if(klasses.klass_type_id = 3, klasses.name, null) SEPARATOR ", ")'),
            klasses_null: bookshelf.knex.raw('GROUP_CONCAT(if(klasses.klass_type_id is null, klasses.name, null) SEPARATOR ", ")'),
        })
    });
    fetchPage({ dbQuery, countQuery }, req.query, res);
}
