const Task     = require('../models/taskModel')
const Activity = require('../models/activityModel')
const aiService = require('../services/aiService')
const User = require('../models/userModel')
const { validateTaskSchedule, validateStatusTransition } = require('../utils/taskValidation')
const { getDueReminderNotifications } = require('../services/taskReminderService')
const { getDeadlineRescueTasks } = require('../services/deadlineRescueService')
const { getProcrastinationAlerts } = require('../services/procrastinationService')
const { getPriorityRecommendation } = require('../services/priorityEngineService')

exports.getAll = async (req, res, next) => {
  try {
    const tasks = await Task.findAllByUser(req.user.id, req.query)
    res.json({ tasks })
  } catch (err) { next(err) }
}

exports.getById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id, req.user.id)
    if (!task) return res.status(404).json({ message: 'Task not found' })
    res.json(task)
  } catch (err) { next(err) }
}

exports.create = async (req, res, next) => {
  try {
    const { title, description, priority, status, deadline, deadline_time, estimated_hours } = req.body
    if (!title) return res.status(400).json({ message: 'Title is required' })
    const user = await User.findById(req.user.id)
    const validationError = validateTaskSchedule({
      deadline,
      deadline_time,
      estimated_hours,
      workHoursPerDay: user?.work_hours_per_day,
    })
    if (validationError) return res.status(400).json({ message: validationError })

    const id = await Task.create({ user_id: req.user.id, title, description, priority, status, deadline, deadline_time, estimated_hours })
    const task = await Task.findById(id, req.user.id)

    await Activity.log(req.user.id, id, 'created', `Task "${title}" created`)

    // Trigger AI prediction asynchronously
    aiService.predictOverrun(task, req.user.id).catch(console.error)

    res.status(201).json(task)
  } catch (err) { next(err) }
}

exports.update = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id, req.user.id)
    if (!task) return res.status(404).json({ message: 'Task not found' })
    const currentProgress = Number(task.progress || 0)

    if (req.body.status !== undefined) {
      const statusError = validateStatusTransition(task.status, req.body.status)
      if (statusError) return res.status(400).json({ message: statusError })
    }

    if (req.body.progress !== undefined) {
      const nextProgress = Number(req.body.progress)
      if (!Number.isFinite(nextProgress) || nextProgress < 0 || nextProgress > 100) {
        return res.status(400).json({ message: 'Progress must be between 0 and 100' })
      }
      if (nextProgress < currentProgress) {
        return res.status(400).json({ message: 'Progress can only move forward' })
      }
    }

    if (req.body.deadline !== undefined || req.body.estimated_hours !== undefined) {
      const user = await User.findById(req.user.id)
      const validationError = validateTaskSchedule({
        deadline: req.body.deadline !== undefined ? req.body.deadline : task.deadline,
        deadline_time: req.body.deadline_time !== undefined ? req.body.deadline_time : task.deadline_time,
        estimated_hours: req.body.estimated_hours !== undefined ? req.body.estimated_hours : task.estimated_hours,
        workHoursPerDay: user?.work_hours_per_day,
      })
      if (validationError) return res.status(400).json({ message: validationError })
    }

    const payload = { ...req.body }
    if (payload.status === 'done' && payload.progress === undefined) {
      payload.progress = 100
    }

    await Task.update(req.params.id, req.user.id, payload)
    const updated = await Task.findById(req.params.id, req.user.id)

    await Activity.log(req.user.id, req.params.id, 'updated', `Task updated`)

    if (req.body.deadline !== undefined && task.deadline && updated.deadline) {
      const previousDeadline = new Date(task.deadline)
      const nextDeadline = new Date(updated.deadline)
      if (!Number.isNaN(previousDeadline.getTime()) && !Number.isNaN(nextDeadline.getTime()) && nextDeadline > previousDeadline) {
        await Activity.log(
          req.user.id,
          req.params.id,
          'postponed',
          `Deadline postponed from ${String(task.deadline).split('T')[0]} to ${String(updated.deadline).split('T')[0]}`
        )
      }
    }

    // Re-run AI prediction whenever risk-relevant fields change.
    if (
      req.body.deadline !== undefined ||
      req.body.deadline_time !== undefined ||
      req.body.progress !== undefined ||
      req.body.status !== undefined ||
      req.body.priority !== undefined ||
      req.body.estimated_hours !== undefined
    ) {
      aiService.predictOverrun(updated, req.user.id).catch(console.error)
    }

    res.json(updated)
  } catch (err) { next(err) }
}

exports.updateProgress = async (req, res, next) => {
  try {
    const { progress } = req.body
    if (progress === undefined) return res.status(400).json({ message: 'Progress is required' })
    const task = await Task.findById(req.params.id, req.user.id)
    if (!task) return res.status(404).json({ message: 'Task not found' })

    const nextProgress = Number(progress)
    if (!Number.isFinite(nextProgress) || nextProgress < 0 || nextProgress > 100) {
      return res.status(400).json({ message: 'Progress must be between 0 and 100' })
    }

    const currentProgress = Number(task.progress || 0)
    if (nextProgress < currentProgress) {
      return res.status(400).json({ message: 'Progress can only move forward' })
    }

    if (task.status === 'done' && nextProgress < 100) {
      return res.status(400).json({ message: 'Completed tasks cannot move back to a lower progress state' })
    }

    const payload = { progress: nextProgress }
    if (nextProgress === 100) {
      payload.status = 'done'
    } else if (task.status === 'todo' && nextProgress > 0) {
      payload.status = 'in_progress'
    }

    await Task.update(req.params.id, req.user.id, payload)
    const updated = await Task.findById(req.params.id, req.user.id)
    aiService.predictOverrun(updated, req.user.id).catch(console.error)
    res.json(updated)
  } catch (err) { next(err) }
}

exports.delete = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id, req.user.id)
    if (!task) return res.status(404).json({ message: 'Task not found' })
    await Activity.log(req.user.id, req.params.id, 'deleted', `Task "${task.title}" deleted`)
    await Task.delete(req.params.id, req.user.id)
    res.json({ message: 'Task deleted' })
  } catch (err) { next(err) }
}

exports.getPrediction = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id, req.user.id)
    if (!task) return res.status(404).json({ message: 'Task not found' })
    const prediction = await aiService.predictOverrun(task, req.user.id)
    res.json(prediction)
  } catch (err) { next(err) }
}

exports.getBreakdown = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id, req.user.id)
    if (!task) return res.status(404).json({ message: 'Task not found' })

    const breakdown = await aiService.generateTaskBreakdown(task)
    res.json({ taskId: task.id, title: task.title, ...breakdown })
  } catch (err) { next(err) }
}

exports.getDueReminders = async (req, res, next) => {
  try {
    const result = await getDueReminderNotifications(req.user.id)
    res.json(result)
  } catch (err) { next(err) }
}

exports.getDeadlineRescue = async (req, res, next) => {
  try {
    const rescueTasks = await getDeadlineRescueTasks(req.user.id)
    res.json({ rescueTasks })
  } catch (err) { next(err) }
}

exports.getProcrastinationAlerts = async (req, res, next) => {
  try {
    const alerts = await getProcrastinationAlerts(req.user.id)
    res.json({ alerts })
  } catch (err) { next(err) }
}

exports.getPriorityRecommendation = async (req, res, next) => {
  try {
    const recommendation = await getPriorityRecommendation(req.user.id)
    res.json({ recommendation })
  } catch (err) { next(err) }
}
