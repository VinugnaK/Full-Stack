/**
 * Rule-based risk scoring service.
 * Estimates task overrun risk from priority, deadline proximity, and user history.
 * No external service required.
 */

const { pool } = require('../config/db')

/**
 * Compute a risk score for a task.
 */
const computeRisk = (task, history = []) => {
  let score = 0

  // Priority factor
  const priorityScore = { low: 0, medium: 0.2, high: 0.4, critical: 0.6 }
  score += priorityScore[task.priority] || 0.2

  // Deadline proximity (days remaining)
  if (task.deadline) {
    const daysLeft = Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    if (daysLeft < 0)       score += 0.5
    else if (daysLeft <= 1) score += 0.4
    else if (daysLeft <= 3) score += 0.25
    else if (daysLeft <= 7) score += 0.1
  }

  // Historical delay rate (how often user's tasks were HIGH risk)
  if (history.length > 0) {
    const delayed = history.filter(t => t.risk_level === 'HIGH').length
    score += (delayed / history.length) * 0.3
  }

  score = Math.min(score, 1)

  let risk_level = 'LOW'
  let suggestion = 'You are on track. Keep it up!'
  if (score >= 0.65) {
    risk_level = 'HIGH'
    suggestion = 'High overrun risk! Start this task immediately or reduce scope.'
  } else if (score >= 0.35) {
    risk_level = 'MEDIUM'
    suggestion = 'Moderate risk detected. Consider starting earlier than planned.'
  }

  return { risk_level, probability: parseFloat(score.toFixed(2)), suggestion }
}

/**
 * Saves risk result to DB (upsert) and returns it.
 */
const saveRisk = async (taskId, risk) => {
  const { risk_level, probability, suggestion } = risk

  await pool.execute(
    `INSERT INTO task_risk (task_id, risk_level, probability, suggestion)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       risk_level  = VALUES(risk_level),
       probability = VALUES(probability),
       suggestion  = VALUES(suggestion),
       created_at  = CURRENT_TIMESTAMP`,
    [taskId, risk_level, probability, suggestion]
  )
  return risk
}

module.exports = { computeRisk, saveRisk }
