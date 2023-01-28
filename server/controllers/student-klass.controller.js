import { StudentKlass, Student, Klass } from '../models';
import { applyFilters, fetchPage } from '../../common-modules/server/controllers/generic.controller';
import { getListFromTable } from '../../common-modules/server/utils/common';
import bookshelf from '../../common-modules/server/config/bookshelf';
import { getStudentReportMergedPdfStream } from '../utils/printHelper';
import { downloadFileFromStream } from '../../common-modules/server/utils/template';

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
    const klassTypes = {
        1: [24, 21, 28, 31],
        2: [25, 22, 29, 32],
        3: [26, 23, 30, 33],
    }
    klassTypes.other = [...klassTypes[1], ...klassTypes[2], ...klassTypes[[3]]]
    dbQuery.query(qb => {
        qb.groupBy('students.id')
        qb.select({
            student_tz: 'students.tz',
            klasses_1: bookshelf.knex.raw('GROUP_CONCAT(if(klasses.klass_type_id in (' + klassTypes[1].join(', ') + '), klasses.name, null) SEPARATOR ", ")'),
            klasses_2: bookshelf.knex.raw('GROUP_CONCAT(if(klasses.klass_type_id in (' + klassTypes[2].join(', ') + '), klasses.name, null) SEPARATOR ", ")'),
            klasses_3: bookshelf.knex.raw('GROUP_CONCAT(if(klasses.klass_type_id in (' + klassTypes[3].join(', ') + '), klasses.name, null) SEPARATOR ", ")'),
            klasses_null: bookshelf.knex.raw('GROUP_CONCAT(if(klasses.klass_type_id not in (' + klassTypes['other'].join(', ') + '), klasses.name, null) SEPARATOR ", ")'),
        })
    });
    fetchPage({ dbQuery, countQuery }, req.query, res);
}

export async function downloadStudentReport(req, res) {
    try {
        const reportParams = {};
        if ([1, 2].includes(req.currentUser.id)) {
            reportParams.grades = true;
        }
        if ([1].includes(req.currentUser.id)) {
            reportParams.forceGrades = true;
        }
        if ([1].includes(req.currentUser.id)) {
            reportParams.hideAbsTotal = true;
        }
        const { body: { ids, klass, personalNote } } = req;
        reportParams.personalNote = personalNote;
        const { fileStream, filename } = await getStudentReportMergedPdfStream(ids, klass, req.currentUser.id, reportParams);
        downloadFileFromStream(fileStream, filename, 'pdf', res);
    } catch (e) {
        console.log(e)
        throw e;
    }
}
