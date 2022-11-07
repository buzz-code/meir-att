import HttpStatus from 'http-status-codes';
import { Group, Klass, Teacher, Lesson } from '../models';
import { applyFilters, fetchPage, fetchPagePromise } from '../../common-modules/server/controllers/generic.controller';
import { getListFromTable } from '../../common-modules/server/utils/common';
import { getDiaryStream, getDiaryMergedPdfStream } from '../utils/printHelper';
import { downloadFileFromStream } from '../../common-modules/server/utils/template';

function getFindAllQuery(user_id, filters) {
    const dbQuery = new Group()
        .where({ 'groups.user_id': user_id })
        .query(qb => {
            qb.leftJoin('klasses', { 'klasses.key': 'groups.klass_id', 'klasses.user_id': 'groups.user_id' })
            qb.leftJoin('teachers', { 'teachers.tz': 'groups.teacher_id', 'teachers.user_id': 'groups.user_id' })
            qb.leftJoin('lessons', { 'lessons.key': 'groups.lesson_id', 'lessons.user_id': 'groups.user_id' })
            qb.select('groups.*')
        });
    applyFilters(dbQuery, filters);
    return dbQuery;
}

/**
 * Find all the items
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export async function findAll(req, res) {
    const dbQuery = getFindAllQuery(req.currentUser.id, req.query.filters);
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
    const [klasses, teachers, lessons] = await Promise.all([
        getListFromTable(Klass, req.currentUser.id, 'key'),
        getListFromTable(Teacher, req.currentUser.id, 'tz'),
        getListFromTable(Lesson, req.currentUser.id, 'key'),
    ]);
    res.json({
        error: null,
        data: { klasses, teachers, lessons }
    });
}

/**
 * Print One Diary
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export async function printOneDiary(req, res) {
    const { body: { id, diaryDate } } = req;
    const { fileStream, filename } = await getDiaryStream(id, diaryDate);
    downloadFileFromStream(fileStream, filename, 'pdf', res);
}

/**
 * Print All Diaries
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export async function printAllDiaries(req, res) {
    const { body: { filters, diaryDate } } = req;
    const dbQuery = getFindAllQuery(req.currentUser.id, JSON.stringify(filters));
    const { data, total } = await fetchPagePromise({ dbQuery }, { page: 0, pageSize: 100 });
    if (total > 100) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: 'לא ניתן להדפיס יותר מ100 יומנים במקביל'
        });
    }
    const { fileStream, filename } = await getDiaryMergedPdfStream(data, diaryDate);
    downloadFileFromStream(fileStream, filename, 'pdf', res);
}
