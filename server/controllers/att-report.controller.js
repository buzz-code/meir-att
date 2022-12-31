import { AttReport, Lesson, Student, Teacher, Klass, User, AttReportWithKnownAbsences } from '../models';
import { getDataToSave, getListFromTable } from '../../common-modules/server/utils/common';
import { applyFilters, fetchPage, fetchPagePromise } from '../../common-modules/server/controllers/generic.controller';
import { getAndParseExcelEmailV2WithResponse } from '../../common-modules/server/utils/email';
import bookshelf from '../../common-modules/server/config/bookshelf';

/**
 * Find all the items
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export async function findAll(req, res) {
    const dbQuery = new AttReport()
        .where({ 'att_reports.user_id': req.currentUser.id })
        .query(qb => {
            qb.leftJoin('students', { 'students.tz': 'att_reports.student_tz', 'students.user_id': 'att_reports.user_id' })
            qb.leftJoin('teachers', { 'teachers.tz': 'att_reports.teacher_id', 'teachers.user_id': 'att_reports.user_id' })
            qb.leftJoin('klasses', { 'klasses.key': 'att_reports.klass_id', 'klasses.user_id': 'att_reports.user_id' })
            qb.leftJoin('lessons', { 'lessons.key': 'att_reports.lesson_id', 'lessons.user_id': 'att_reports.user_id' })
            qb.leftJoin('known_absences', { 'known_absences.lesson_id': 'att_reports.lesson_id', 'known_absences.user_id': 'att_reports.user_id', 'known_absences.student_tz': 'att_reports.student_tz', 'known_absences.report_month': 'att_reports.sheet_name' })
            qb.select('att_reports.*')
            qb.select('absnce_count')
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
    const [students, teachers, klasses, lessons] = await Promise.all([
        getListFromTable(Student, req.currentUser.id, 'tz'),
        getListFromTable(Teacher, req.currentUser.id, 'tz'),
        getListFromTable(Klass, req.currentUser.id, 'key'),
        getListFromTable(Lesson, req.currentUser.id, 'key'),
    ]);
    res.json({
        error: null,
        data: { students, teachers, klasses, lessons }
    });
}

export async function handleEmail(req, res, ctrl) {
    try {
        const response = await getAndParseExcelEmailV2WithResponse(req, attachment => {
            const { data, sheetName } = attachment;
            const columns = ['klass_id', 'student_tz', '', 'teacher_id', 'lesson_id', 'how_many_lessons', 'abs_count'/*, 'approved_abs_count'*/, 'comments'];
            const body = getDataToSave(data, columns);
            if (isNaN(Number(body[0].lesson_id))) {
                body.splice(0, 1);
            }
            const report_date = new Date().toISOString().substr(0, 10);
            body.forEach(item => {
                item.user_id = req.query.userId;
                item.report_date = report_date;
                item.sheet_name = sheetName;
            });
            return bookshelf.transaction(transaction => (
                AttReport.collection(body)
                    .invokeThen("save", null, { method: "insert", transacting: transaction })
            ))
        });
        res.send({ success: true, message: response });
    } catch (e) {
        console.log(e);
        res.status(500).send({ success: false, message: e.message });
    }
}

export async function getPivotData(req, res) {
    const studentFilters = [];
    const reportFilters = [];
    if (req.query.filters) {
        const filtersObj = JSON.parse(req.query.filters);
        for (const filter of Object.values(filtersObj)) {
            if (filter.field.startsWith('students')) {
                studentFilters.push(filter);
            }
            if (filter.field.startsWith('klasses')) {
                studentFilters.push(filter);
                reportFilters.push({ ...filter, field: 'klass_id', operator: 'like' });
            }
            if (!filter.field.startsWith('students') && !filter.field.startsWith('klasses')) {
                reportFilters.push(filter);
            }
        }
    }

    const dbQuery = new Student()
        .where({ 'students.user_id': req.currentUser.id })
        .query(qb => {
            qb.leftJoin('student_klasses', { 'student_klasses.student_tz': 'students.tz', 'student_klasses.user_id': 'students.user_id' })
            qb.leftJoin('klasses', { 'klasses.key': 'student_klasses.klass_id', 'klasses.user_id': 'student_klasses.user_id' })
            qb.distinct('students.tz', 'students.name')
        });

    applyFilters(dbQuery, JSON.stringify(studentFilters));
    const countQuery = dbQuery.clone().query()
        .clearSelect()
        .countDistinct({ count: ['students.id'] })
        .then(res => res[0].count);
    const studentsRes = await fetchPagePromise({ dbQuery, countQuery }, req.query);

    const pivotQuery = new AttReportWithKnownAbsences()
        .where('att_reports_with_known_absences.student_tz', 'in', studentsRes.data.map(item => item.tz))
        .query(qb => {
            qb.leftJoin('teachers', { 'teachers.tz': 'att_reports_with_known_absences.teacher_id', 'teachers.user_id': 'att_reports_with_known_absences.user_id' })
            qb.leftJoin('lessons', { 'lessons.key': 'att_reports_with_known_absences.lesson_id', 'lessons.user_id': 'att_reports_with_known_absences.user_id' })
            qb.select('att_reports_with_known_absences.*')
            qb.select({
                teacher_name: 'teachers.name',
                lesson_name: 'lessons.name',
            })
        });
    applyFilters(pivotQuery, JSON.stringify(reportFilters));
    const pivotRes = await fetchPagePromise({ dbQuery: pivotQuery }, { page: 0, pageSize: 1000 * req.query.pageSize, /* todo:orderBy */ });

    const pivotData = studentsRes.data;
    const pivotDict = pivotData.reduce((prev, curr) => ({ ...prev, [curr.tz]: curr }), {});
    pivotRes.data.forEach(item => {
        if (item.lesson_id) {
            const key = item.lesson_id + '_' + item.teacher_id;
            if (pivotDict[item.student_tz][key] === undefined) {
                pivotDict[item.student_tz][key] = 0;
                pivotDict[item.student_tz][key + '_title'] = item.lesson_name + ' המו\' ' + item.teacher_name;
            }

            pivotDict[item.student_tz][key] += item.abs_count;
        }
        pivotDict[item.student_tz].total = (pivotDict[item.student_tz].total || 0) + item.abs_count;
        pivotDict[item.student_tz].total_approved = (pivotDict[item.student_tz].total_approved || 0) + item.absnce_count;
    })

    res.send({
        error: null,
        data: pivotData,
        page: studentsRes.page,
        total: studentsRes.total,
    })
}

export async function getPivotBySheetName(req, res) {
    const studentFilters = [];
    const reportFilters = [];
    if (req.query.filters) {
        const filtersObj = JSON.parse(req.query.filters);
        for (const filter of Object.values(filtersObj)) {
            if (filter.field.startsWith('students')) {
                studentFilters.push(filter);
            }
            if (filter.field.startsWith('klasses')) {
                studentFilters.push(filter);
                reportFilters.push({ ...filter, field: 'lessons.klasses', operator: 'like' });
            }
            if (!filter.field.startsWith('students') && !filter.field.startsWith('klasses')) {
                reportFilters.push(filter);
            }
        }
    }

    const dbQuery = new Student()
        .where({ 'students.user_id': req.currentUser.id })
        .query(qb => {
            qb.leftJoin('student_klasses', { 'student_klasses.student_tz': 'students.tz', 'student_klasses.user_id': 'students.user_id' })
            qb.leftJoin('klasses', { 'klasses.key': 'student_klasses.klass_id', 'klasses.user_id': 'student_klasses.user_id' })
            qb.distinct('students.tz', 'students.name')
        });

    applyFilters(dbQuery, JSON.stringify(studentFilters));
    const countQuery = dbQuery.clone().query()
        .clearSelect()
        .countDistinct({ count: ['students.id'] })
        .then(res => res[0].count);
    const studentsRes = await fetchPagePromise({ dbQuery, countQuery }, req.query);

    const pivotQuery = new AttReport()
        .where('att_reports.student_tz', 'in', studentsRes.data.map(item => item.tz))
        .query(qb => {
            qb.leftJoin('teachers', { 'teachers.tz': 'att_reports.teacher_id', 'teachers.user_id': 'att_reports.user_id' })
            qb.leftJoin('lessons', { 'lessons.key': 'att_reports.lesson_id', 'lessons.user_id': 'att_reports.user_id' })
            qb.select('att_reports.*')
            qb.select({
                teacher_name: 'teachers.name',
                lesson_name: 'lessons.name',
            })
        });
    applyFilters(pivotQuery, JSON.stringify(reportFilters));
    const pivotRes = await fetchPagePromise({ dbQuery: pivotQuery }, { page: 0, pageSize: 1000 * req.query.pageSize, /* todo:orderBy */ });

    const pivotData = studentsRes.data;
    const pivotDict = pivotData.reduce((prev, curr) => ({ ...prev, [curr.tz]: curr }), {});
    pivotRes.data.forEach(item => {
        const key = item.lesson_id + '_' + item.sheet_name;
        if (pivotDict[item.student_tz][key] === undefined) {
            pivotDict[item.student_tz][key] = 0;
            pivotDict[item.student_tz][key + '_title'] = item.lesson_name + ' גליון ' + item.sheet_name;
        }
        pivotDict[item.student_tz][key] += item.abs_count;
        pivotDict[item.student_tz].total = (pivotDict[item.student_tz].total || 0) + item.abs_count;
    })

    res.send({
        error: null,
        data: pivotData,
        page: studentsRes.page,
        total: studentsRes.total,
    })
}

export async function reportWithKnownAbsences(req, res) {
    const dbQuery = new Student()
        .where({ 'students.user_id': req.currentUser.id })
        .query(qb => {
            qb.leftJoin('att_reports_with_known_absences', { 'students.tz': 'att_reports_with_known_absences.student_tz' })
            qb.leftJoin('student_base_klass', { 'student_base_klass.user_id': 'students.user_id', 'student_base_klass.tz': 'students.user_id' })
            qb.leftJoin('klasses', { 'klasses.user_id': 'students.user_id', 'klasses.key': 'klass_id' })
        });
    applyFilters(dbQuery, req.query.filters);
    const countQuery = dbQuery.clone().query()
        .countDistinct({ count: ['students.id', bookshelf.knex.raw('coalesce(klass_id, 0)'), bookshelf.knex.raw('coalesce(klasses.name, "")')] })
        .then(res => res[0].count);
    dbQuery.query(qb => {
        qb.groupBy(['students.id', bookshelf.knex.raw('coalesce(klass_id, 0)'), bookshelf.knex.raw('coalesce(klasses.name, "")')])
        qb.select({
            student_tz: 'students.tz',
            student_name: 'students.name',
            klass_name: bookshelf.knex.raw('coalesce(klasses.name, "")'),
            student_base_klass: bookshelf.knex.raw('GROUP_CONCAT(student_base_klass.student_base_klass SEPARATOR ", ")'),
            known_absences_1: bookshelf.knex.raw('SUM(if(absnce_code = 1, absnce_count, null))'),
            known_absences_2: bookshelf.knex.raw('SUM(if(absnce_code = 2, absnce_count, null))'),
        })
        qb.sum({
            abs_count: 'abs_count',
            approved_abs_count: 'approved_abs_count',
        })
    });
    fetchPage({ dbQuery, countQuery }, req.query, res);
}

export async function getTeacherSalaryReport(req, res) {
    const dbQuery = new AttReport()
        .where({ 'att_reports.user_id': req.currentUser.id })
        .query(qb => {
            qb.leftJoin('teachers', { 'teachers.tz': 'att_reports.teacher_id', 'teachers.user_id': 'att_reports.user_id' })
            qb.leftJoin('klasses', { 'klasses.key': 'att_reports.klass_id', 'klasses.user_id': 'att_reports.user_id' })
            qb.leftJoin('lessons', { 'lessons.key': 'att_reports.lesson_id', 'lessons.user_id': 'att_reports.user_id' })
            qb.distinct('att_reports.teacher_id', 'teachers.name', 'lesson_id', 'lessons.name', 'klass_id', 'klasses.name', 'how_many_lessons', 'sheet_name')
        });
    applyFilters(dbQuery, req.query.filters);
    fetchPage({ dbQuery }, req.query, res);
}

export async function getStudentPercentsReport(req, res) {
    const dbQuery = new AttReport()
        .where({ 'att_reports.user_id': req.currentUser.id })
        .query(qb => {
            qb.leftJoin('students', { 'students.tz': 'att_reports.student_tz', 'students.user_id': 'att_reports.user_id' })
            qb.leftJoin('teachers', { 'teachers.tz': 'att_reports.teacher_id', 'teachers.user_id': 'att_reports.user_id' })
            qb.leftJoin('klasses', { 'klasses.key': 'att_reports.klass_id', 'klasses.user_id': 'att_reports.user_id' })
            qb.leftJoin('lessons', { 'lessons.key': 'att_reports.lesson_id', 'lessons.user_id': 'att_reports.user_id' })
            qb.leftJoin('known_absences', { 'known_absences.lesson_id': 'att_reports.lesson_id', 'known_absences.user_id': 'att_reports.user_id', 'known_absences.student_tz': 'att_reports.student_tz', 'known_absences.report_month': 'att_reports.sheet_name' })
        });
    applyFilters(dbQuery, req.query.filters);

    const groupByColumns = ['att_reports.student_tz', 'students.name', 'att_reports.teacher_id', 'teachers.name', 'att_reports.klass_id', 'klasses.name', 'att_reports.lesson_id', 'lessons.name'];
    const countQuery = dbQuery.clone().query()
        .countDistinct({ count: groupByColumns })
        .then(res => res[0].count);

    dbQuery.query(qb => {
        qb.groupBy(groupByColumns)
        qb.select(...groupByColumns)
        qb.sum({
            how_many_lessons: 'how_many_lessons',
            abs_count: 'abs_count',
            approved_abs_count: 'approved_abs_count',
            absnce_count: 'absnce_count',
        })
        qb.select({
            percents: bookshelf.knex.raw('sum(abs_count) / sum(how_many_lessons)'),
            percents_formatted: bookshelf.knex.raw('CONCAT(FORMAT(sum(abs_count) / sum(how_many_lessons) * 100, 2), \'%\')'),
        })
    });
    fetchPage({ dbQuery, countQuery }, req.query, res);
}