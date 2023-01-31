import moment from "moment";
import bookshelf from '../../common-modules/server/config/bookshelf';
import { Klass, Teacher, User, StudentKlass, Lesson, Group, AttReport, Grade, Text, Student, KnownAbsence, AttReportAndGrade, GradeName, AttGradeEffect } from "../models";

export function getUserByPhone(phone_number) {
    return new User().where({ phone_number })
        .fetch()
        .then(res => res.toJSON());
}

export function getTeacherByUserIdAndPhone(user_id, phone) {
    return new Teacher().where({ user_id })
        .where(bookshelf.knex.raw('(phone = ? or phone2 = ?)', [phone, phone]))
        .fetch({ require: false })
        .then(res => res ? res.toJSON() : null);
}

export function getKlassByUserIdAndKlassId(user_id, key) {
    return new Klass().where({ user_id, key })
        .fetch({ require: false })
        .then(res => res ? res.toJSON() : null);
}

export function getLessonByUserIdAndLessonId(user_id, key) {
    return new Lesson().where({ user_id, key })
        .fetch({ require: false })
        .then(res => res ? res.toJSON() : null);
}

export function getExistingReport(user_id, klass_id, lesson_id, sheet_name) {
    return new AttReport().where({ user_id, klass_id, lesson_id, sheet_name })
        .where('report_date', '>=', moment().add(-7, 'days').toISOString().substr(0, 10))
        .fetchAll()
        .then(res => res ? res.toJSON() : null);
}

export function getExistingGrades(user_id, klass_id, lesson_id, sheet_name) {
    return new Grade().where({ user_id, klass_id, lesson_id, sheet_name })
        .where('report_date', '>=', moment().add(-7, 'days').toISOString().substr(0, 10))
        .fetchAll()
        .then(res => res ? res.toJSON() : null);
}

export function getStudentsByUserIdAndKlassIds(user_id, klasses) {
    return new StudentKlass().where({ user_id }).where('klass_id', 'in', klasses?.split(','))
        .fetchAll({ withRelated: [{ student: function (query) { query.orderBy('name'); } }] })
        .then(res => res.toJSON())
        .then(res => res.map(item => item.student))
        .then(res => res.sort((a, b) => a.name?.trim()?.localeCompare(b.name?.trim())));
}

export async function getDiaryDataByGroupId(group_id) {
    const group = await new Group().where({ id: group_id })
        .fetch({ withRelated: ['klass', 'teacher', 'lesson'] })
        .then(res => res.toJSON());
    const students = await getStudentsByUserIdAndKlassId(group.user_id, group.klass_id);

    return { group, students: students.sort((a, b) => a.name?.trim()?.localeCompare(b.name?.trim())) };
}

export async function getStudentReportData(student_tz, klass_id, user_id) {
    const [student, klass, reports, approved_abs_count, att_grade_effect, grade_names] = await Promise.all([
        new Student().where({ user_id, tz: student_tz }).fetch({ require: false }).then(res => res ? res.toJSON() : null),
        klass_id && new Klass().where({ user_id, key: klass_id }).fetch({ require: false }).then(res => res ? res.toJSON() : null),
        getAttReportsForStudentReport(user_id, student_tz, klass_id),
        getApprovedAbsTotalCount(user_id, student_tz, klass_id),
        getAttGradeEffect(user_id),
        getGradeNames(user_id),
    ])

    return { student, klass, reports, approved_abs_count, att_grade_effect, grade_names }
}

async function getAttReportsForStudentReport(user_id, student_tz, klass_id) {
    const reportsFilter = {
        'att_reports_and_grades.user_id': user_id,
        student_tz
    };
    if (klass_id) {
        reportsFilter.klass_id = klass_id;
    }

    return new AttReportAndGrade()
        .where(reportsFilter)
        .query(qb => {
            qb.leftJoin('teachers', { 'teachers.tz': 'att_reports_and_grades.teacher_id', 'teachers.user_id': 'att_reports_and_grades.user_id' })
                .leftJoin('lessons', { 'lessons.key': 'att_reports_and_grades.lesson_id', 'lessons.user_id': 'att_reports_and_grades.user_id' })
                .groupBy('lessons.name', 'lesson_id', 'teachers.name')
                .select({
                    lesson_name: 'lessons.name',
                    teacher_name: 'teachers.name',
                })
                .sum({
                    lessons: 'how_many_lessons',
                    abs_count: 'abs_count',
                })
                .avg({
                    grade: 'grade',
                })
                .orderBy('lesson_id', 'asc')
        })
        .fetchAll()
        .then(res => res.toJSON())
}


async function getApprovedAbsTotalCount(user_id, student_tz, klass_id) {
    const reportsFilter = {
        'known_absences.user_id': user_id,
        student_tz
    };
    if (klass_id) {
        reportsFilter.klass_id = klass_id;
    }

    return new KnownAbsence()
        .where(reportsFilter)
        .query(qb => {
            qb.groupBy('student_tz')
                .sum({
                    total: 'absnce_count',
                })
                .select('student_tz')
        })
        .fetchAll()
        .then(res => res.toJSON())
        .then(res => res[0])
}

function getAttGradeEffect(user_id) {
    return new AttGradeEffect()
        .where({ user_id })
        .orderBy('percents', 'DESC')
        .fetchAll()
        .then(res => res.toJSON());
}

function getGradeNames(user_id) {
    return new GradeName()
        .where({ user_id })
        .orderBy('key', 'DESC')
        .fetchAll()
        .then(res => res.toJSON());
}

function getTextByUserIdAndName(user_id, name) {
    return new Text()
        .where({ user_id, name })
        .fetch()
        .then(res => res.toJSON())
        .then(res => res.value);
}

export async function getEmailFields(user_id, message) {
    const [subjectText, bodyText] = await Promise.all([
        getTextByUserIdAndName(user_id, 'teacherReportStatusEmailSubject' + message),
        getTextByUserIdAndName(user_id, 'teacherReportStatusEmailBody' + message),
    ]);

    return { subjectText, bodyText };
}

export async function getEmailFieldsWithFile(user_id, type) {
    const [subjectText, bodyText] = await Promise.all([
        getTextByUserIdAndName(user_id, 'teacherReportStatusEmailSubjectFile' + type),
        getTextByUserIdAndName(user_id, 'teacherReportStatusEmailBodyFile' + type),
    ]);

    return { subjectText, bodyText };
}

export async function getTemplateDataByLessonId(lesson_id) {
    const lesson = await new Lesson().where({ id: lesson_id })
        .fetch({ withRelated: ['teacher', 'klass'] })
        .then(res => res.toJSON());
    const students = await getStudentsByUserIdAndKlassIds(lesson.user_id, lesson.klasses);

    return {
        lesson,
        rows: students
            .sort((a, b) => a.name?.localeCompare(b.name))
            .map(student => ({
                klass_id: lesson.klasses,
                student_id: student.tz,
                student_name: student.name,
                teacher_id: lesson.teacher_id,
                lesson_id: lesson.key,
            })),
    };
}
