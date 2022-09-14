import * as groupCtrl from '../controllers/group.controller';
import genericRoute from '../../common-modules/server/routes/generic.route';

const router = genericRoute(groupCtrl, (router, ctrl) => {
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