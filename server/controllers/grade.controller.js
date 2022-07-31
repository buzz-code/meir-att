import Grade from '../models/grade.model';
import Lesson from '../models/lesson.model';
import Student from '../models/student.model';
import Teacher from '../models/teacher.model';
import Klass from '../models/klass.model';
import User from '../models/user.model';
import { getDataToSave, getListFromTable } from '../../common-modules/server/utils/common';
import genericController, { applyFilters, fetchPage, fetchPagePromise } from '../../common-modules/server/controllers/generic.controller';
import { getAndParseExcelEmail } from '../../common-modules/server/utils/email';

export const { findById, store, update, destroy, uploadMultiple } = genericController(Grade);

/**
 * Find all the items
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export async function findAll(req, res) {
    const dbQuery = new Grade()
        .where({ 'grades.user_id': req.currentUser.id })
        .query(qb => {
            qb.leftJoin('students', 'students.tz', 'grades.student_tz')
            qb.leftJoin('teachers', 'teachers.tz', 'grades.teacher_id')
            // qb.leftJoin('klasses', 'klasses.key', 'grades.klass_id')
            qb.leftJoin('lessons', 'lessons.key', 'grades.lesson_id')
            qb.select('grades.*')
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

export async function handleEmail(req, res) {
    try {
        const data = await getAndParseExcelEmail(req, res);
        const columns = [/*'klass_id',*/ 'student_tz', '', 'teacher_id', 'lesson_id', 'how_many_lessons', 'grade'];
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
            qb.leftJoin('student_klasses', 'student_klasses.student_tz', 'students.tz')
            qb.leftJoin('klasses', 'klasses.key', 'student_klasses.klass_id')
            qb.distinct('students.tz')
        });

    applyFilters(dbQuery, JSON.stringify(studentFilters));
    const countQuery = dbQuery.clone().query()
        .clearSelect()
        .countDistinct({ count: ['students.id'] })
        .then(res => res[0].count);
    const studentsRes = await fetchPagePromise({ dbQuery, countQuery }, req.query);

    const pivotQuery = new Grade()
        .where('grades.student_tz', 'in', studentsRes.data.map(item => item.tz))
        .query(qb => {
            qb.leftJoin('teachers', 'teachers.tz', 'grades.teacher_id')
            qb.leftJoin('lessons', 'lessons.key', 'grades.lesson_id')
            qb.select('grades.*')
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
            pivotDict[item.student_tz][key] = 0;
            pivotDict[item.student_tz][key + '_title'] = item.lesson_name + ' המו\' ' + item.teacher_name;
        }
        pivotDict[item.student_tz][key] += item.grade;
    })

    res.send({
        error: null,
        data: pivotData,
        page: studentsRes.page,
        total: studentsRes.total,
    })
}
