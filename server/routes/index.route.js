import express from 'express';

const router = express.Router();

router.use('/auth', require('./auth.route').default);
router.use('/users', require('./user.route').default);
router.use('/yemot', require('./yemot.route').default);
router.use('/teachers', require('./teacher.route').default);
router.use('/students', require('./student.route').default);
router.use('/lessons', require('./lesson.route').default);
router.use('/klasses', require('./klass.route').default);
router.use('/student-klasses', require('./student-klass.route').default);
router.use('/groups', require('./group.route').default);
router.use('/texts', require('./text.route').default);
router.use('/klass-types', require('./klass-type.route').default);
router.use('/att-reports', require('./att-report.route').default);
router.use('/grades', require('./grade.route').default);
router.use('/att-reports-and-grades', require('./att-report-and-grade.route').default);
router.use('/att-grade-effect', require('./att-grade-effect.route').default);
router.use('/grade-names', require('./grade-name.route').default);
router.use('/report-edit', require('./report-edit.route').default);
router.use('/dashboard', require('./dashboard.route').default);
router.use('/known-absences', require('./known-absence.route').default);

export default router;