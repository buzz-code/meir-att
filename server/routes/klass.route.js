import * as klassCtrl from '../controllers/klass.controller';
import genericRoute from '../../common-modules/server/routes/generic.route';

const router = genericRoute(klassCtrl, (router, ctrl) => {
    router.route('/get-edit-data')
        .get((req, res) => {
            ctrl.getEditData(req, res);
        });
});

export default router;