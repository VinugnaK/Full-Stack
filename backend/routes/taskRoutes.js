const router = require('express').Router()
const { protect } = require('../middleware/authMiddleware')
const {
  getTasks, getTask, createTask, updateTask,
  updateProgress, deleteTask, getTaskRisk
} = require('../controllers/taskController')

router.use(protect)

router.get('/', getTasks)
router.get('/:id', getTask)
router.post('/', createTask)
router.put('/:id', updateTask)
router.patch('/:id/progress', updateProgress)
router.delete('/:id', deleteTask)
router.get('/:id/risk', getTaskRisk)

module.exports = router
