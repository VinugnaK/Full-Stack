const router = require('express').Router()
const ctrl   = require('../controllers/taskController')
const auth   = require('../middleware/authMiddleware')

router.use(auth)

router.get('/',                  ctrl.getAll)
router.get('/reminders/due',     ctrl.getDueReminders)
router.get('/deadline-rescue',   ctrl.getDeadlineRescue)
router.get('/procrastination-alerts', ctrl.getProcrastinationAlerts)
router.get('/priority-recommendation', ctrl.getPriorityRecommendation)
router.get('/:id/breakdown',         ctrl.getBreakdown)
router.get('/:id',               ctrl.getById)
router.post('/',                 ctrl.create)
router.put('/:id',               ctrl.update)
router.patch('/:id/progress',    ctrl.updateProgress)
router.delete('/:id',            ctrl.delete)
router.get('/:id/prediction',    ctrl.getPrediction)

module.exports = router
