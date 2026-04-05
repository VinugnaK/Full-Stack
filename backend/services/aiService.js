const axios = require('axios')
const db    = require('../config/db')

const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'

/**
 * Build feature payload from a task + user history and send to Python AI service.
 * Stores the result in ai_predictions table.
 */
async function predictOverrun(task, userId) {
  try {
    // Fetch user history for feature engineering
    const [[history]] = await db.query(
      `SELECT
         COUNT(*) AS total_tasks,
         SUM(status = 'done') AS completed_tasks,
         AVG(TIMESTAMPDIFF(DAY, created_at, updated_at)) AS avg_completion_days,
         SUM(deadline IS NOT NULL AND status != 'done' AND deadline < NOW()) AS overdue_count
       FROM tasks WHERE user_id = ?`, [userId])

    const [[workload]] = await db.query(
      `SELECT COUNT(*) AS active_tasks FROM tasks WHERE user_id = ? AND status != 'done'`, [userId])

    const now = new Date()
    let dueAt = null

    if (task.deadline) {
      const datePart = new Date(task.deadline)
      if (!Number.isNaN(datePart.getTime())) {
        const year = datePart.getFullYear()
        const month = String(datePart.getMonth() + 1).padStart(2, '0')
        const day = String(datePart.getDate()).padStart(2, '0')
        const timePart = task.deadline_time ? String(task.deadline_time).slice(0, 8) : '23:59:59'
        const combined = new Date(`${year}-${month}-${day}T${timePart}`)
        if (!Number.isNaN(combined.getTime())) {
          dueAt = combined
        }
      }
    }

    const hours_until_deadline = dueAt ? (dueAt - now) / 3600000 : -1
    const days_until_deadline = dueAt ? hours_until_deadline / 24 : -1

    const payload = {
      task_id:              task.id,
      user_id:              userId,
      status:               task.status || 'todo',
      estimated_hours:      task.estimated_hours || 0,
      priority:             task.priority || 'medium',
      progress:             task.progress || 0,
      days_until_deadline,
      hours_until_deadline,
      active_tasks:         workload.active_tasks || 0,
      total_tasks:          history.total_tasks   || 0,
      completed_tasks:      history.completed_tasks || 0,
      avg_completion_days:  history.avg_completion_days || 0,
      overdue_count:        history.overdue_count || 0,
    }

    const { data } = await axios.post(`${AI_URL}/predict/overrun`, payload, { timeout: 5000 })

    // Persist prediction
    await db.query(
      'INSERT INTO ai_predictions (task_id, user_id, risk_level, risk_score, suggestion) VALUES (?, ?, ?, ?, ?)',
      [task.id, userId, data.risk_level, data.risk_score, data.suggestion || null]
    )

    return data
  } catch (err) {
    console.error('[AI Service] predictOverrun failed:', err.message)
    return null
  }
}

async function detectBurnout(userId) {
  try {
    const [[stats]] = await db.query(
      `SELECT
         COUNT(*) AS total,
         SUM(status='done') AS done,
         SUM(deadline < NOW() AND status != 'done') AS overdue,
         AVG(estimated_hours) AS avg_hours
       FROM tasks WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`, [userId])

    const { data } = await axios.post(`${AI_URL}/predict/burnout`, {
      user_id:  userId,
      total:    stats.total    || 0,
      done:     stats.done     || 0,
      overdue:  stats.overdue  || 0,
      avg_hours: stats.avg_hours || 0,
    }, { timeout: 5000 })

    return data
  } catch (err) {
    console.error('[AI Service] detectBurnout failed:', err.message)
    return { score: 0, level: 'LOW', suggestion: 'Unable to fetch burnout data.' }
  }
}

async function getProductivityScore(userId) {
  try {
    const history = await require('../models/taskModel').getCompletionHistory(userId, 28)
    const { data } = await axios.post(`${AI_URL}/predict/productivity`, { user_id: userId, history }, { timeout: 5000 })
    return data
  } catch (err) {
    console.error('[AI Service] getProductivityScore failed:', err.message)
    return { score: 0, chart: [] }
  }
}

function buildFallbackBreakdown(task) {
  const title = task.title || 'this task'
  const description = (task.description || '').trim()
  const totalHours = Math.max(Number(task.estimated_hours || 0), 1)
  const stepCount = totalHours >= 8 ? 5 : totalHours >= 4 ? 4 : 3
  const roundedStepHours = Math.max(0.5, Math.round((totalHours / stepCount) * 10) / 10)

  const templates = [
    {
      title: 'Clarify the outcome',
      detail: `Write down what “${title}” should look like when it is finished so the work stays focused.`,
    },
    {
      title: 'Gather what you need',
      detail: description
        ? `Use the task notes as your checklist: ${description}.`
        : 'Collect the notes, files, references, and dependencies you need before starting.',
    },
    {
      title: 'Build the core work',
      detail: `Complete the main implementation or draft for “${title}” in one focused session.`,
    },
    {
      title: 'Review and polish',
      detail: `Check the result, fix rough edges, and make sure “${title}” is ready to share or submit.`,
    },
    {
      title: 'Wrap up and hand off',
      detail: 'Do the final validation, update status, and capture any follow-up notes or next actions.',
    },
  ]

  const steps = templates.slice(0, stepCount).map((step, index) => ({
    order: index + 1,
    title: step.title,
    detail: step.detail,
    estimate_hours: roundedStepHours,
  }))

  return {
    summary: `Here is a practical step-by-step breakdown for “${title}” based on its scope, notes, and estimated effort.`,
    steps,
  }
}

async function generateTaskBreakdown(task) {
  const fallback = buildFallbackBreakdown(task)

  try {
    const payload = {
      title: task.title || '',
      description: task.description || '',
      estimated_hours: Number(task.estimated_hours || 0),
      priority: task.priority || 'medium',
      progress: Number(task.progress || 0),
      status: task.status || 'todo',
    }

    const { data } = await axios.post(`${AI_URL}/predict/breakdown`, payload, { timeout: 5000 })

    if (!data || !Array.isArray(data.steps) || !data.steps.length) {
      return fallback
    }

    return {
      summary: data.summary || fallback.summary,
      steps: data.steps.map((step, index) => ({
        order: index + 1,
        title: step.title || `Step ${index + 1}`,
        detail: step.detail || step.description || '',
        estimate_hours: Number(step.estimate_hours || step.hours || fallback.steps[index]?.estimate_hours || 1),
      })),
    }
  } catch (err) {
    console.error('[AI Service] generateTaskBreakdown failed:', err.message)
    return fallback
  }
}

module.exports = { predictOverrun, detectBurnout, getProductivityScore, generateTaskBreakdown }
