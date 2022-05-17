const router = require('express').Router();
const Employee = require('./employee-model');

router.get('/', async (req, res, next) => {
  try {
    const employees = await Employee.findAll();
    res.status(200).json(employees);
  } catch (err) {
    next(err);
  }
})

router.get('/:employee_id', async (req, res, next) => {
  try {
    const employee = await Employee.findByEmployeeId(req.params.employee_id);
    res.status(200).json(employee);
  } catch (err) {
    next(err);
  }
})

router.post('/', async (req, res, next) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (err) {
    next(err);
  }
})

router.use((err, req, res, next) => { // eslint-disable-line
  res.status(err.status||500).json({
    message: err.message,
    stack: err.stack
  })
});

module.exports = router;