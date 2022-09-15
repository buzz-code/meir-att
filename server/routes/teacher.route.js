import * as teacherCtrl from '../controllers/teacher.controller';
import genericRoute from '../../common-modules/server/routes/generic.route';
import { exportPdf } from '../../common-modules/server/utils/template';

const router = genericRoute(teacherCtrl, (router, ctrl) => {
    router.route('/teachers-with-report-status')
        .get((req, res) => {
            ctrl.teachersWithReportStatus(req, res);
        });
    router.route('/report-by-klass-type/export-pdf')
        .post((req, res) => {
            exportPdf(req, res);
        });
});

export default router;