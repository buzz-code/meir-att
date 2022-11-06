import { Lesson, Teacher, Klass } from '../models';
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
    const [teachers, klasses] = await Promise.all([
        getListFromTable(Teacher, req.currentUser.id, 'tz'),
        getListFromTable(Klass, req.currentUser.id, 'key'),
    ]);
    res.json({
        error: null,
        data: { teachers, klasses }
    });
}