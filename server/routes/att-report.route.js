import { genericRouteWithController } from '../../common-modules/server/controllers/loader';
import { exportPdf } from '../../common-modules/server/utils/template';

const router = genericRouteWithController('att-report', 'AttReport', (router, ctrl) => {
    router.route('/get-edit-data')
        .get((req, res) => {
            ctrl.getEditData(req, res);
        });

    router.route('/get-pivot-data')
        .get(async (req, res) => {
            await ctrl.getPivotData(req, res);
        });
    router.route('/get-pivot-by-sheet-name')
        .get(async (req, res) => {
            await ctrl.getPivotBySheetName(req, res);
        });
    router.route('/report-with-known-absences')
        .get(async (req, res) => {
            await ctrl.reportWithKnownAbsences(req, res);
        });
    router.route('/teacher-salary-report')
        .get(async (req, res) => {
            await ctrl.getTeacherSalaryReport(req, res);
        });
    router.route('/student-percent-report')
        .get(async (req, res) => {
            await ctrl.getStudentPercentsReport(req, res);
        });
    router.route('/:reportId/export-pdf')
        .post((req, res) => {
            exportPdf(req, res);
        });

    router.route('/handle-email')
        .post(async (req, res) => {
            ctrl.handleEmail(req, res, ctrl);
        });

}, req => req.path.match('handle-email'));

export default router;