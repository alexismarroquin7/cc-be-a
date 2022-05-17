const router = require('express').Router();
const schedulesRouter = require('./schedules/schedules-router');
const employeesRouter = require('./employees/employee-router');

router.use('/schedules', schedulesRouter);
router.use('/employees', employeesRouter);

router.use((err, req, res, next) => { // eslint-disable-line
  res.status(err.status||500).json({
    message: err.message,
    stack: err.stack
  })
});

module.exports = router;