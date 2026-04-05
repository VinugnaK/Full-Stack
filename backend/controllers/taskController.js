const TaskModel = require('../models/TaskModel')
const UserModel = require('../models/UserModel')
const { computeRisk, saveRisk } = require('../services/riskService')

// GET /tasks
const getTasks = async (req, res, next) => {
  try {
    const tasks = await TaskModel.findByUser(req.user.id, req.query)
    res.json({ tasks })
  } catch (err) {
    next(err)
  }
}

// GET /tasks/:id
const getTask = async (req, res, next) => {
  try {
    const task = await TaskModel.findById(req.params.id)
    if (!task || task.user_id !== req.user.id)
      return res.status(404).json({ message: 'Task not found' })
    res.json(task)
  } catch (err) {
    next(err)
  }
}

// POST /tasks
const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, deadline, estimated_hours } = req.body
    if (!title) return res.status(400).json({ message: 'Title is required' })

    const taskId = await TaskModel.create({
      user_id: req.user.id,
      title, description, priority: priority || 'medium',
      status: status || 'todo', deadline, estimated_hours
    })

    // Compute risk locally (no external service)
    const history = await TaskModel.getHistory(req.user.id)
    const risk = computeRisk({ title, priority: priority || 'medium', deadline, estimated_hours }, history)
    await saveRisk(taskId, risk)
    await TaskModel.logActivity(taskId, req.user.id, 'created')

    const task = await TaskModel.findById(taskId)
    res.status(201).json({ ...task, risk })
  } catch (err) {
    next(err)
  }
}

// PUT /tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const task = await TaskModel.findById(req.params.id)
    if (!task || task.user_id !== req.user.id)
      return res.status(404).json({ message: 'Task not found' })

    await TaskModel.update(req.params.id, req.body)
    await TaskModel.logActivity(req.params.id, req.user.id, 'updated', req.body)

    // Re-score on significant field changes
    const significantFields = ['deadline', 'priority', 'estimated_hours', 'status']
    const hasSignificantChange = significantFields.some(f => req.body[f] !== undefined)

    if (hasSignificantChange) {
      const updatedTask = await TaskModel.findById(req.params.id)
      const history = await TaskModel.getHistory(req.user.id)
      const risk = computeRisk(updatedTask, history)
      await saveRisk(req.params.id, risk)
    }

    const updatedTask = await TaskModel.findById(req.params.id)
    res.json(updatedTask)
  } catch (err) {
    next(err)
  }
}

// PATCH /tasks/:id/progress
const updateProgress = async (req, res, next) => {
  try {
    const { progress } = req.body
    if (progress === undefined || progress < 0 || progress > 100)
      return res.status(400).json({ message: 'Progress must be 0-100' })

    const task = await TaskModel.findById(req.params.id)
    if (!task || task.user_id !== req.user.id)
      return res.status(404).json({ message: 'Task not found' })

    const newStatus = progress === 100 ? 'done' : task.status
    await TaskModel.update(req.params.id, { progress, status: newStatus })
    await TaskModel.logActivity(req.params.id, req.user.id, 'progress_updated', { progress })

    res.json({ message: 'Progress updated', progress, status: newStatus })
  } catch (err) {
    next(err)
  }
}

// DELETE /tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await TaskModel.findById(req.params.id)
    if (!task || task.user_id !== req.user.id)
      return res.status(404).json({ message: 'Task not found' })
    await TaskModel.delete(req.params.id)
    res.json({ message: 'Task deleted' })
  } catch (err) {
    next(err)
  }
}

// GET /tasks/:id/risk
const getTaskRisk = async (req, res, next) => {
  try {
    const task = await TaskModel.findById(req.params.id)
    if (!task || task.user_id !== req.user.id)
      return res.status(404).json({ message: 'Task not found' })
    res.json(task.risk || { message: 'No risk data available' })
  } catch (err) {
    next(err)
  }
}

module.exports = { getTasks, getTask, createTask, updateTask, updateProgress, deleteTask, getTaskRisk }
