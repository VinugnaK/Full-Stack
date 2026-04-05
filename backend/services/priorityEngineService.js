const Task = require('../models/taskModel')

function combineDeadline(deadline, deadlineTime) {
  if (!deadline) return null
  const datePart = String(deadline).split('T')[0]
  const timePart = deadlineTime ? String(deadlineTime).slice(0, 8) : '23:59:59'
  const value = new Date(`${datePart}T${timePart}`)
  return Number.isNaN(value.getTime()) ? null : value
}

function getUrgencyLabel(hoursLeft) {
  if (hoursLeft <= 24) return 'High urgency'
  if (hoursLeft <= 72) return 'Medium urgency'
  return 'Planned urgency'
}

function getImpactLabel(priority, riskLevel) {
  if (priority === 'high' || riskLevel === 'HIGH') return 'high impact'
  if (priority === 'medium' || riskLevel === 'MEDIUM') return 'medium impact'
  return 'steady impact'
}

function scoreTask(task) {
  let score = 0
  const reasons = []
  const dueAt = combineDeadline(task.deadline, task.deadline_time)

  if (dueAt) {
    const hoursLeft = (dueAt.getTime() - Date.now()) / (1000 * 60 * 60)
    if (hoursLeft <= 24) {
      score += 45
      reasons.push('High urgency')
    } else if (hoursLeft <= 72) {
      score += 30
      reasons.push('Medium urgency')
    } else {
      score += 10
    }
  } else {
    score += 5
  }

  if (task.priority === 'high') {
    score += 30
    reasons.push('high impact')
  } else if (task.priority === 'medium') {
    score += 18
  } else {
    score += 8
  }

  if (task.prediction?.risk_level === 'HIGH') {
    score += 25
    if (!reasons.includes('high impact')) {
      reasons.push('high impact')
    }
  } else if (task.prediction?.risk_level === 'MEDIUM') {
    score += 15
  }

  if (task.status === 'in_progress') {
    score += 10
  }

  score += Math.max(0, 10 - Number(task.progress || 0) / 10)

  return { score, reasons }
}

async function getPriorityRecommendation(userId) {
  const tasks = await Task.findAllByUser(userId, {})
  const activeTasks = (tasks || []).filter(task => task.status !== 'done')

  if (!activeTasks.length) return null

  const ranked = activeTasks
    .map(task => {
      const { score, reasons } = scoreTask(task)
      const dueAt = combineDeadline(task.deadline, task.deadline_time)
      const hoursLeft = dueAt ? Math.max(1, Math.ceil((dueAt.getTime() - Date.now()) / (1000 * 60 * 60))) : null

      return {
        task,
        score,
        reasons,
        hoursLeft,
      }
    })
    .sort((a, b) => b.score - a.score)

  const winner = ranked[0]
  if (!winner) return null

  const urgency = winner.hoursLeft !== null
    ? getUrgencyLabel(winner.hoursLeft)
    : 'No hard deadline'
  const impact = getImpactLabel(winner.task.priority, winner.task.prediction?.risk_level)
  const reason = `${urgency} + ${impact}`

  return {
    task_id: winner.task.id,
    title: winner.task.title,
    reason,
    message: `Start this task first: "${winner.task.title}"`,
    suggestion: winner.task.prediction?.suggestion || 'Start with a focused 25-minute session and make visible progress now.',
    status: winner.task.status,
    priority: winner.task.priority,
  }
}

module.exports = {
  getPriorityRecommendation,
}
