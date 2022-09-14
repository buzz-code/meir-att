import * as lessonCtrl from '../controllers/lesson.controller';
import genericRoute from '../../common-modules/server/routes/generic.route';

const router = genericRoute(lessonCtrl, (router, ctrl) => {
    router.route('/get-edit-data')
        .get((req, res) => {
            ctrl.getEditData(req, res);
        });
});

export default router;