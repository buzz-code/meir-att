import { genericRouteWithController } from '../../common-modules/server/controllers/loader';

const router = genericRouteWithController('group', 'Group', (router, ctrl) => {
    router.route('/get-edit-data')
        .get((req, res) => {
            ctrl.getEditData(req, res);
        });

    router.route('/print-one-diary')
        .post(async (req, res) => {
            await ctrl.printOneDiary(req, res);
        });

    router.route('/print-all-diaries')
        .post(async (req, res) => {
            await ctrl.printAllDiaries(req, res);
        });

});

export default router;