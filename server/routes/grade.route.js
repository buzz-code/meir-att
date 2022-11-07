import { genericRouteWithController } from '../../common-modules/server/controllers/loader';
import { exportPdf } from '../../common-modules/server/utils/template';

const router = genericRouteWithController('grade', 'Grade', (router, ctrl) => {
    router.route('/get-edit-data')
        .get((req, res) => {
            ctrl.getEditData(req, res);
        });

    router.route('/get-pivot-data')
        .get(async (req, res) => {
            await ctrl.getPivotData(req, res);
        });
    router.route('/get-pivot-data/export-pdf')
        .post((req, res) => {
            exportPdf(req, res);
        });

    router.route('/handle-email')
        .post(async (req, res) => {
            ctrl.handleEmail(req, res);
        });

}, req => req.path.match('handle-email'));

export default router;