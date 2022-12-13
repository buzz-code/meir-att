import moment from "moment";
import bookshelf from '../../common-modules/server/config/bookshelf';
import { Klass, Teacher, User, StudentKlass, Lesson, Group, AttReport, Grade, Text } from "../models";

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

export function getExistingReport(user_id, klass_id, lesson_id) {
    return new AttReport().where({ user_id, klass_id, lesson_id })
        .where('report_date', '>=', moment().add(-7, 'days').toISOString().substr(0, 10))
        .fetchAll()
        .then(res => res ? res.toJSON() : null);
}

export function getExistingGrades(user_id, klass_id, lesson_id) {
    return new Grade().where({ user_id, klass_id, lesson_id })
        .where('report_date', '>=', moment().add(-7, 'days').toISOString().substr(0, 10))
        .fetchAll()
        .then(res => res ? res.toJSON() : null);
}

export function getStudentsByUserIdAndKlassIds(user_id, klasses) {
    return new StudentKlass().where({ user_id }).where('klass_id', 'in', klasses?.split(','))
        .fetchAll({ withRelated: [{ student: function (query) { query.orderBy('name'); } }] })
        .then(res => res.toJSON())
        .then(res => res.map(item => item.student))
        .then(res => res.sort((a, b) => a.name.localeCompare(b.name)));
}

export async function getDiaryDataByGroupId(group_id) {
    const group = await new Group().where({ id: group_id })
        .fetch({ withRelated: ['klass', 'teacher', 'lesson'] })
        .then(res => res.toJSON());
    const students = await getStudentsByUserIdAndKlassId(group.user_id, group.klass_id);

    return { group, students: students.sort((a, b) => a.name.localeCompare(b.name)) };
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
        getTextByUserIdAndName(user_id, 'teacherReportStatusEmailSubject'),
        getTextByUserIdAndName(user_id, 'teacherReportStatusEmailBody' + message),
    ]);

    return { subjectText, bodyText };
}

export async function getEmailFieldsWithFile(user_id) {
    const [subjectText, bodyText] = await Promise.all([
        getTextByUserIdAndName(user_id, 'teacherReportStatusEmailSubjectFile'),
        getTextByUserIdAndName(user_id, 'teacherReportStatusEmailBodyFile'),
    ]);

    return { subjectText, bodyText };
}

export async function getTemplateDataByLessonId(lesson_id) {
    const lesson = await new Lesson().where({ id: lesson_id })
        .fetch({ withRelated: ['teacher'] })
        .then(res => res.toJSON());
    const students = await getStudentsByUserIdAndKlassIds(lesson.user_id, lesson.klasses);

    return {
        lesson,
        rows: students
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(student => ({
                klass_id: lesson.klasses,
                student_id: student.tz,
                student_name: student.name,
                teacher_id: lesson.teacher_id,
                lesson_id: lesson.key,
            })),
    };
}
