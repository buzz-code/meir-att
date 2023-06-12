import moment from "moment";
import bookshelf from '../../common-modules/server/config/bookshelf';
import { createModel } from "../../common-modules/server/utils/models";
import { Klass, Teacher, User, StudentKlass, Lesson, Group, AttReport, Grade, Text, Student, KnownAbsence, AttReportAndGrade, GradeName, AttGradeEffect } from "../models";
const student_base_klass_model = createModel('student_base_klass')

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

export async function getStudentReportData(student_tz, klass_id, user_id, filters) {
    const [student, student_base_klass, klass, reports, approved_abs_count, att_grade_effect, grade_names] = await Promise.all([
        new Student().where({ user_id, tz: student_tz }).fetch({ require: false }).then(res => res ? res.toJSON() : null),
        student_base_klass_model.where({ user_id, tz: student_tz }).fetch({ require: false }).then(res => res ? res.toJSON() : null),
        klass_id && new Klass().where({ user_id, key: klass_id }).fetch({ require: false }).then(res => res ? res.toJSON() : null),
        getAttReportsForStudentReport(user_id, student_tz, klass_id, filters),
        getApprovedAbsTotalCount(user_id, student_tz, klass_id, filters),
        getAttGradeEffect(user_id),
        getGradeNames(user_id),
    ])

    return { student, student_base_klass, klass, reports, approved_abs_count, att_grade_effect, grade_names }
}

async function getAttReportsForStudentReport(user_id, student_tz, klass_id, filters) {
    const reportsFilter = {
        'att_reports_and_grades.user_id': user_id,
        student_tz
    };
    if (klass_id) {
        reportsFilter.klass_id = klass_id;
    }
    const startDate = filters?.startDate ?? new Date('2000-01-01');
    const endDate = filters?.endDate ?? new Date('2100-12-31');
    const half = filters?.half ?? '';

    return new AttReportAndGrade()
        .where(reportsFilter)
        .query(qb => {
            qb.whereBetween('report_date', [startDate, endDate]);
            qb.where(bookshelf.knex.raw('COALESCE(half, "' + half + '")'), 'like', '%' + half + '%');
            if (filters?.lessonName)
                qb.where('lessons.name', 'like', '%' + filters.lessonName + '%');
            qb.leftJoin('teachers', { 'teachers.tz': 'att_reports_and_grades.teacher_id', 'teachers.user_id': 'att_reports_and_grades.user_id' })
                .leftJoin('lessons', { 'lessons.key': 'att_reports_and_grades.lesson_id', 'lessons.user_id': 'att_reports_and_grades.user_id' })
                .leftJoin('klasses', { 'klasses.key': 'att_reports_and_grades.klass_id', 'klasses.user_id': 'att_reports_and_grades.user_id' })
                .groupBy('lessons.name', 'lesson_id', 'teachers.name', 'klasses.id', 'klasses.klass_type_id')
                .select({
                    lesson_name: 'lessons.name',
                    teacher_name: 'teachers.name',
                    klass_name: 'klasses.name',
                    klass_id: 'klasses.key',
                    klass_type_id: 'klasses.klass_type_id'
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


async function getApprovedAbsTotalCount(user_id, student_tz, klass_id, filters) {
    const reportsFilter = {
        'known_absences.user_id': user_id,
        student_tz
    };
    if (klass_id) {
        reportsFilter.klass_id = klass_id;
    }
    const startDate = filters?.startDate ?? new Date('2000-01-01');
    const endDate = filters?.endDate ?? new Date('2100-12-31');

    return new KnownAbsence()
        .where(reportsFilter)
        .query(qb => {
            qb.whereBetween('report_date', [startDate, endDate]);
            qb.groupBy('student_tz', 'klass_id')
                .sum({
                    total: 'absnce_count',
                })
                .select('student_tz', 'klass_id')
        })
        .fetchAll()
        .then(res => res.toJSON())
        .then(res => Object.fromEntries(res.map(item => ([item.klass_id, item.total]))));
}

function getAttGradeEffect(user_id) {
    return new AttGradeEffect()
        .where({ user_id })
        .query(qb => {
            qb.orderBy('percents', 'DESC')
            qb.orderBy('count', 'DESC')
        })
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
    const [students, teacher, klass] = await Promise.all([
        getStudentsByUserIdAndKlassIds(lesson.user_id, lesson.klasses),
        lesson.teacher_id && new Teacher().where({ user_id: lesson.user_id, tz: lesson.teacher_id }).fetch({ require: false }).then(res => res ? res.toJSON() : null),
        lesson.klasses && new Klass().where({ user_id: lesson.user_id, key: lesson.klasses }).fetch({ require: false }).then(res => res ? res.toJSON() : null),
    ]);

    return {
        lesson,
        teacher,
        klass,
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
