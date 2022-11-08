import { genericRouteWithController } from '../../common-modules/server/controllers/loader';

const router = genericRouteWithController('known-absence', 'KnownAbsence', (router, ctrl) => {
    router.route('/get-edit-data')
        .get((req, res) => {
            ctrl.getEditData(req, res);
        });

    router.route('/handle-email')
        .post(async (req, res) => {
            ctrl.handleEmail(req, res, ctrl);
        });
}, req => req.path.match('handle-email'));

export default router;