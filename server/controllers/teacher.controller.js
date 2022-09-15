import Teacher from '../models/teacher.model';
import genericController, { applyFilters, fetchPage } from '../../common-modules/server/controllers/generic.controller';
import { getMinimalModel } from '../../common-modules/server/utils/query';

export const { findAll, findById, store, update, destroy, uploadMultiple } = genericController(Teacher);

export async function teachersWithReportStatus(req, res) {
    const dbQuery = getMinimalModel('teacher_report_status').where({ user_id: req.currentUser.id });
    applyFilters(dbQuery, req.query.filters);
    fetchPage({ dbQuery }, req.query, res);
}
