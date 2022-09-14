import * as studentKlassCtrl from '../controllers/student-klass.controller';
import genericRoute from '../../common-modules/server/routes/generic.route';
import { exportPdf } from '../../common-modules/server/utils/template';

const router = genericRoute(studentKlassCtrl, (router, ctrl) => {
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