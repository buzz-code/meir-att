import { genericRouteWithController } from '../../common-modules/server/controllers/loader';

const router = genericRouteWithController('lesson', 'Lesson', (router, ctrl) => {
    router.route('/get-edit-data')
        .get((req, res) => {
            ctrl.getEditData(req, res);
        });

    router.route('/send-email-with-file')
        .post(async (req, res) => {
            await ctrl.sendEmailWithFile(req, res);
        });

    router.route('/download-one-excel')
        .post(async (req, res) => {
            await ctrl.downloadOneExcelFile(req, res);
        });
});

export default router;