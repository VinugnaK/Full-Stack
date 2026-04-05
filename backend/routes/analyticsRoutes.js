const router = require('express').Router()
const ctrl   = require('../controllers/analyticsController')
const auth   = require('../middleware/authMiddleware')

router.use(auth)

router.get('/summary',     ctrl.getSummary)
router.get('/weekly',      ctrl.getWeekly)
router.get('/monthly',     ctrl.getMonthly)
router.get('/yearly',      ctrl.getYearly)
router.get('/burnout',     ctrl.getBurnout)
router.get('/productivity', ctrl.getProductivity)

module.exports = router
