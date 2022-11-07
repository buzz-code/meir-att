import { exportPdf } from '../../common-modules/server/utils/template';
import { genericRouteWithController } from '../../common-modules/server/controllers/loader';

const router = genericRouteWithController('teacher', 'Teacher', (router, ctrl) => {
    router.route('/teachers-with-report-status')
        .get((req, res) => {
            ctrl.teachersWithReportStatus(req, res);
        });

    router.route('/teachers-with-report-status/export-pdf')
        .post((req, res) => {
            exportPdf(req, res);
        });

    router.route('/teachers-with-report-status/send-email-to-all')
        .post(async (req, res) => {
            await ctrl.sendEmailToAllTeachers(req, res);
        });
});

export default router;