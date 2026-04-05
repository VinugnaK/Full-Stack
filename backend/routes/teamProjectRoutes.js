const router = require('express').Router()
const auth = require('../middleware/authMiddleware')
const ctrl = require('../controllers/teamProjectController')

router.use(auth)

router.get('/', ctrl.getOverview)
router.get('/notifications', ctrl.getNotifications)
router.post('/', ctrl.createProject)
router.get('/:projectId', ctrl.getProject)
router.delete('/:projectId', ctrl.deleteProject)
router.post('/:projectId/invitations', ctrl.inviteToProject)
router.post('/invitations/:invitationId/respond', ctrl.respondToInvitation)
router.post('/:projectId/tasks', ctrl.createTask)
router.put('/:projectId/tasks/:taskId', ctrl.updateTask)
router.delete('/:projectId/tasks/:taskId', ctrl.deleteTask)

module.exports = router
