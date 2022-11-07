import { AttReportAndGrade, Lesson, Student, Teacher, Klass, User } from '../models';
import { getDataToSave, getListFromTable } from '../../common-modules/server/utils/common';
import { applyFilters, fetchPage, fetchPagePromise } from '../../common-modules/server/controllers/generic.controller';
import { getAndParseExcelEmail } from '../../common-modules/server/utils/email';

/**
 * Find all the items
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export async function findAll(req, res) {
    const dbQuery = new Student()
        .where({ 'students.user_id': req.currentUser.id })
        .query(qb => {
            qb.leftJoin('att_reports_and_grades', { 'students.tz': 'att_reports_and_grades.student_tz', 'students.user_id': 'att_reports_and_grades.user_id' })
            qb.leftJoin('teachers', { 'teachers.tz': 'att_reports_and_grades.teacher_id', 'teachers.user_id': 'att_reports_and_grades.user_id' })
            // qb.leftJoin('klasses', { 'klasses.key': 'att_reports_and_grades.klass_id', 'klasses.user_id': 'att_reports_and_grades.user_id' })
            qb.leftJoin('lessons', { 'lessons.key': 'att_reports_and_grades.lesson_id', 'lessons.user_id': 'att_reports_and_grades.user_id' })
        });
    applyFilters(dbQuery, req.query.filters);
    const countQuery = dbQuery.clone().query()
        .countDistinct({ count: ['student_tz', 'teacher_id', /*'klass_id',*/ 'lesson_id'] })
        .then(res => res[0].count);
    dbQuery.query(qb => {
        qb.groupBy(['student_tz', 'teacher_id', /*'klass_id',*/ 'lesson_id'])
        qb.select('student_tz', 'teacher_id', /*'klass_id',*/ 'lesson_id')
        qb.min({
            report_date: 'report_date',
        })
        qb.sum({
            abs_count: 'abs_count',
            approved_abs_count: 'approved_abs_count',
        })
        qb.avg({
            grade: 'grade',
        })
    });
    fetchPage({ dbQuery, countQuery }, req.query, res);
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

// export async function handleEmail(req, res) {
//     try {
//         const data = await getAndParseExcelEmail(req, res);
//         const columns = ['klass_id', 'student_tz', '', 'teacher_id', 'lesson_id', 'abs_count', 'approved_abs_count', 'grade'];
//         const body = getDataToSave(data, columns);
//         const report_date = new Date().toISOString().substr(0, 10);
//         body.forEach(item => {
//             item.report_date = report_date;
//         });
//         const currentUser = await User.query({
//             where: { id: req.query.userId },
//             select: ['email', 'id']
//         }).fetch();
//         await uploadMultiple({ body, currentUser });
//         console.log(body.length + ' records were saved successfully');
//     } catch (e) {
//         console.log(e);
//     }
// }

export async function getPivotData(req, res) {
    const studentFilters = [];
    const reportFilters = [];
    if (req.query.filters) {
        const filtersObj = JSON.parse(req.query.filters);
        for (const filter of Object.values(filtersObj)) {
            if (filter.field.startsWith('students') || filter.field.startsWith('klasses')) {
                studentFilters.push(filter);
            } else {
                reportFilters.push(filter);
            }
        }
    }

    const dbQuery = new Student()
        .where({ 'students.user_id': req.currentUser.id })
        .query(qb => {
            qb.leftJoin('student_klasses', { 'student_klasses.student_tz': 'students.tz', 'student_klasses.user_id': 'students.user_id' })
            qb.leftJoin('klasses', { 'klasses.key': 'student_klasses.klass_id', 'klasses.user_id': 'student_klasses.user_id' })
            qb.distinct('students.tz')
        });

    applyFilters(dbQuery, JSON.stringify(studentFilters));
    const countQuery = dbQuery.clone().query()
        .clearSelect()
        .countDistinct({ count: ['students.id'] })
        .then(res => res[0].count);
    const studentsRes = await fetchPagePromise({ dbQuery, countQuery }, req.query);

    const pivotQuery = new AttReportAndGrade()
        .where('att_reports_and_grades.student_tz', 'in', studentsRes.data.map(item => item.tz))
        .query(qb => {
            qb.leftJoin('teachers', { 'teachers.tz': 'att_reports_and_grades.teacher_id', 'teachers.user_id': 'att_reports_and_grades.user_id' })
            qb.leftJoin('lessons', { 'lessons.key': 'att_reports_and_grades.lesson_id', 'lessons.user_id': 'att_reports_and_grades.user_id' })
            qb.select('att_reports_and_grades.*')
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
        const key = item.lesson_id + '_' + item.teacher_id;
        if (pivotDict[item.student_tz][key] === undefined) {
            pivotDict[item.student_tz][key] = { abs_count: 0, grade: 0 };
            pivotDict[item.student_tz][key + '_title'] = item.lesson_name + ' המו\' ' + item.teacher_name;
        }
        pivotDict[item.student_tz][key].abs_count += item.abs_count;
        pivotDict[item.student_tz][key].grade += item.grade;
        pivotDict[item.student_tz].total = (pivotDict[item.student_tz].total || 0) + item.abs_count;
    })

    res.send({
        error: null,
        data: pivotData,
        page: studentsRes.page,
        total: studentsRes.total,
    })
}
