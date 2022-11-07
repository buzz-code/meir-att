import { genericRouteWithController } from '../../common-modules/server/controllers/loader';
import { exportPdf } from '../../common-modules/server/utils/template';

const router = genericRouteWithController('student-klass', 'StudentKlass', (router, ctrl) => {
    router.route('/get-edit-data')
        .get((req, res) => {
            ctrl.getEditData(req, res);
        });

    router.route('/report-by-klass-type')
        .get((req, res) => {
            ctrl.reportByKlassType(req, res);
        });
    router.route('/report-by-klass-type/export-pdf')
        .post((req, res) => {
            exportPdf(req, res);
        });
});

export default router;