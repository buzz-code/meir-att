import Lesson from '../models/lesson.model';
import Teacher from '../models/teacher.model';
import genericController from '../../common-modules/server/controllers/generic.controller';
import { getListFromTable } from '../../common-modules/server/utils/common';

export const { findAll, findById, store, update, destroy, uploadMultiple } = genericController(Lesson);

/**
 * Get edit data
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export async function getEditData(req, res) {
    const [teachers] = await Promise.all([
        getListFromTable(Teacher, req.currentUser.id, 'tz'),
    ]);
    res.json({
        error: null,
        data: { teachers }
    });
}