const router = require('express').Router()
const ctrl   = require('../controllers/authController')
const auth   = require('../middleware/authMiddleware')

router.post('/register',  ctrl.register)
router.post('/register/request-otp', ctrl.requestRegistrationOtp)
router.post('/register/verify-otp', ctrl.verifyRegistrationOtp)
router.post('/login',     ctrl.login)
router.post('/forgot-password', ctrl.requestPasswordReset)
router.post('/reset-password', ctrl.resetPassword)
router.get('/me',   auth, ctrl.getMe)
router.put('/profile', auth, ctrl.updateProfile)

module.exports = router
