const router = require('express').Router()
const { protect } = require('../middleware/authMiddleware')
const { getProfile, updateProfile } = require('../controllers/userController')

router.use(protect)
router.get('/profile', getProfile)
router.put('/profile', updateProfile)

module.exports = router
