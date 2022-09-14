import * as attReportCtrl from '../controllers/att-report.controller';
import genericRoute from '../../common-modules/server/routes/generic.route';
import { exportPdf } from '../../common-modules/server/utils/template';

const router = genericRoute(attReportCtrl, (router, ctrl) => {
    router.route('/get-edit-data')
        .get((req, res) => {
            ctrl.getEditData(req, res);
        });

    router.route('/get-pivot-data')
        .get(async (req, res) => {
            await ctrl.getPivotData(req, res);
        });
    router.route('/report-with-known-absences')
        .get(async (req, res) => {
            await ctrl.reportWithKnownAbsences(req, res);
        });
    router.route('/:reportId/export-pdf')
        .post((req, res) => {
            exportPdf(req, res);
        });

    router.route('/handle-email')
        .post(async (req, res) => {
            ctrl.handleEmail(req, res);
        });

}, req => req.path.match('handle-email'));

export default router;