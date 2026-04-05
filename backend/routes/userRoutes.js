const router = require('express').Router()
const ctrl   = require('../controllers/userController')
const auth   = require('../middleware/authMiddleware')

router.use(auth)
router.get('/profile', ctrl.getProfile)

module.exports = router
