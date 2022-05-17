const router = require('express').Router();
const Schedule = require('./schedules-model');

router.get('/', async (req, res, next) => {
  try {
    const employees = await Schedule.findAll();
    res.status(200).json(employees);
  } catch (err) {
    next(err);
  }
})

router.post('/', async (req, res, next) => {
  try {
    const schedule = await Schedule.create(req.body);
    res.status(201).json(schedule);
  } catch (err) {
    next(err);
  }
})

router.put('/:schedule_id', async (req, res, next) => {
  try {
    const schedule = await Schedule.update(req.params.schedule_id, req.body);
    res.status(200).json(schedule);
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