import Klass from '../models/klass.model';
import KlassType from '../models/klass-type.model';
import genericController, { applyFilters, fetchPage } from '../../common-modules/server/controllers/generic.controller';
import { getListFromTable } from '../../common-modules/server/utils/common';

export const { findById, store, update, destroy, uploadMultiple } = genericController(Klass);

/**
 * Find all the items
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export async function findAll(req, res) {
    const dbQuery = new Klass()
        .where({ 'klasses.user_id': req.currentUser.id })
        .query(qb => {
            qb.leftJoin('klass_types', { 'klass_types.id': 'klasses.klass_type_id', 'klass_types.user_id': 'klasses.user_id' })
            qb.select('klasses.*')
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
    const [klassTypes] = await Promise.all([
        getListFromTable(KlassType, req.currentUser.id),
    ]);
    res.json({
        error: null,
        data: { klassTypes }
    });
}
