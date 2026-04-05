const db   = require('../config/db')
const Task = require('../models/taskModel')
const aiService = require('../services/aiService')

function getDueAt(task) {
  if (!task?.deadline) return null

  const date = new Date(task.deadline)
  if (Number.isNaN(date.getTime())) return null

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const timePart = task.deadline_time ? String(task.deadline_time).slice(0, 8) : '23:59:59'
  const dueAt = new Date(`${year}-${month}-${day}T${timePart}`)
  return Number.isNaN(dueAt.getTime()) ? null : dueAt
}

function getEffectiveRiskLevel(task) {
  if (task.status === 'done') return 'LOW'

  const dueAt = getDueAt(task)
  if (dueAt && dueAt < new Date()) return 'HIGH'

  return task.risk_level || null
}

function isCompletedOnTime(task) {
  if (task.status !== 'done') return false

  const dueAt = getDueAt(task)
  if (!dueAt) return true

  const completedAt = task.updated_at ? new Date(task.updated_at) : null
  if (!completedAt || Number.isNaN(completedAt.getTime())) return false

  return completedAt <= dueAt
}

async function getRiskCounts(userId) {
  const [rows] = await db.query(
    `SELECT
       t.id,
       t.status,
       t.deadline,
       t.deadline_time,
       p.risk_level
     FROM tasks t
     LEFT JOIN ai_predictions p ON p.task_id = t.id AND p.id = (
       SELECT MAX(id) FROM ai_predictions WHERE task_id = t.id
     )
     WHERE t.user_id = ?`,
    [userId]
  )

  const counts = { low_risk: 0, medium_risk: 0, high_risk: 0 }
  rows.forEach((task) => {
    const level = getEffectiveRiskLevel(task)
    if (level === 'LOW') counts.low_risk += 1
    if (level === 'MEDIUM') counts.medium_risk += 1
    if (level === 'HIGH') counts.high_risk += 1
  })

  return {
    low_risk: counts.low_risk,
    medium_risk: counts.medium_risk,
    high_risk: counts.high_risk,
  }
}

async function getProductivityScore(userId) {
  const [rows] = await db.query(
    `SELECT
       t.id,
       t.status,
       t.deadline,
       t.deadline_time,
       t.updated_at,
       p.risk_level
     FROM tasks t
     LEFT JOIN ai_predictions p ON p.task_id = t.id AND p.id = (
       SELECT MAX(id) FROM ai_predictions WHERE task_id = t.id
     )
     WHERE t.user_id = ?`,
    [userId]
  )

  const totalTasks = rows.length
  if (!totalTasks) return 0

  let completedCount = 0
  let completedOnTimeCount = 0
  let overdueCount = 0
  let highRiskCount = 0

  rows.forEach((task) => {
    const dueAt = getDueAt(task)
    const isOverdue = task.status !== 'done' && dueAt && dueAt < new Date()
    const effectiveRisk = getEffectiveRiskLevel(task)

    if (task.status === 'done') completedCount += 1
    if (isCompletedOnTime(task)) completedOnTimeCount += 1
    if (isOverdue) overdueCount += 1
    if (effectiveRisk === 'HIGH') highRiskCount += 1
  })

  const completionRate = completedCount / totalTasks
  const onTimeCompletionRate = completedOnTimeCount / totalTasks
  const overdueRate = overdueCount / totalTasks
  const highRiskRate = highRiskCount / totalTasks

  const score =
    (completionRate * 45) +
    (onTimeCompletionRate * 30) +
    ((1 - overdueRate) * 15) +
    ((1 - highRiskRate) * 10)

  return Math.max(0, Math.min(100, Math.round(score)))
}

exports.getSummary = async (req, res, next) => {
  try {
    const uid = req.user.id
    const [[totals]] = await db.query(
      `SELECT
         COUNT(*) AS total_tasks,
         SUM(status = 'done') AS completed,
         SUM(status = 'in_progress') AS in_progress,
         SUM(status = 'todo') AS todo,
         SUM(
           status <> 'done'
           AND TIMESTAMP(deadline, COALESCE(deadline_time, '23:59:59')) < NOW()
         ) AS overdue
       FROM tasks WHERE user_id = ?`, [uid])

    const risks = await getRiskCounts(uid)
    const productivity_score = await getProductivityScore(uid)

    res.json({ ...totals, ...risks, productivity_score })
  } catch (err) { next(err) }
}

exports.getWeekly = async (req, res, next) => {
  try {
    const chart    = await Task.getCompletionHistory(req.user.id, 7)
    const workload = await Task.getUserWorkload(req.user.id)
    const risks = await getRiskCounts(req.user.id)
    res.json({ chart, workload, ...risks })
  } catch (err) { next(err) }
}

exports.getMonthly = async (req, res, next) => {
  try {
    const chart    = await Task.getCompletionHistory(req.user.id, 30)
    const workload = await Task.getUserWorkload(req.user.id)
    const risks = await getRiskCounts(req.user.id)
    res.json({ chart, workload, ...risks })
  } catch (err) { next(err) }
}

exports.getYearly = async (req, res, next) => {
  try {
    const chart    = await Task.getCompletionHistory(req.user.id, 365)
    const workload = await Task.getUserWorkload(req.user.id)
    const risks = await getRiskCounts(req.user.id)
    res.json({ chart, workload, ...risks })
  } catch (err) { next(err) }
}

exports.getBurnout = async (req, res, next) => {
  try {
    const result = await aiService.detectBurnout(req.user.id)
    res.json(result)
  } catch (err) { next(err) }
}

exports.getProductivity = async (req, res, next) => {
  try {
    const result = await aiService.getProductivityScore(req.user.id)
    res.json(result)
  } catch (err) { next(err) }
}
