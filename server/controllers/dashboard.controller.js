import { AttReport, Student, Teacher } from '../models';

/**
 * Get stats
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export async function getStats(req, res) {
    const [/*reports,*/ students, teachers] = await Promise.all([
        // getCountFromTable(AttReport, req.currentUser.id),
        getCountFromTable(Student, req.currentUser.id),
        getCountFromTable(Teacher, req.currentUser.id),
    ]);
    res.json({
        error: null,
        data: { /*reports,*/ students, teachers }
    });
}

function getCountFromTable(table, user_id) {
    return new table().where({ user_id })
        .count();
}
