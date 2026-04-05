const Task = require('../models/taskModel')

function combineDeadline(deadline, deadlineTime) {
  if (!deadline) return null

  const parsedDate = deadline instanceof Date ? new Date(deadline) : new Date(deadline)
  if (Number.isNaN(parsedDate.getTime())) return null

  const year = parsedDate.getFullYear()
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
  const day = String(parsedDate.getDate()).padStart(2, '0')
  const timePart = deadlineTime ? String(deadlineTime).slice(0, 8) : '23:59:59'
  const value = new Date(`${year}-${month}-${day}T${timePart}`)
  return Number.isNaN(value.getTime()) ? null : value
}

function formatTimeLeft(ms) {
  const hours = Math.max(1, Math.ceil(ms / (1000 * 60 * 60)))
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'}`
  }

  const days = Math.ceil(hours / 24)
  return `${days} day${days === 1 ? '' : 's'}`
}

function buildSuggestions({ behindPercent, dueSoon }) {
  const suggestions = ['Start now']

  if (dueSoon || behindPercent >= 40) {
    suggestions.push('Break task into smaller parts')
  }

  if (behindPercent >= 55) {
    suggestions.push('Extend deadline?')
  }

  return suggestions
}

function buildMessage({ behindPercent, timeLeft }) {
  return `You're ${behindPercent}% behind schedule. Start with 30 mins now to recover before the ${timeLeft} left runs down.`
}

async function getDeadlineRescueTasks(userId) {
  const tasks = await Task.findActiveWithDeadlines(userId)
  const now = new Date()

  const rescueTasks = tasks.map(task => {
    const dueAt = combineDeadline(task.deadline, task.deadline_time)
    const createdAt = task.created_at ? new Date(task.created_at) : null
    if (!dueAt || !createdAt || Number.isNaN(createdAt.getTime()) || dueAt <= createdAt) {
      return null
    }

    const totalWindow = dueAt.getTime() - createdAt.getTime()
    const elapsed = Math.max(0, Math.min(totalWindow, now.getTime() - createdAt.getTime()))
    const expectedProgress = Math.round((elapsed / totalWindow) * 100)
    const actualProgress = Number(task.progress || 0)
    const behindPercent = Math.max(0, expectedProgress - actualProgress)
    const timeLeftMs = dueAt.getTime() - now.getTime()

    if (timeLeftMs <= 0 || behindPercent < 15) {
      return null
    }

    const dueSoon = timeLeftMs <= 1000 * 60 * 60 * 24

    return {
      task_id: task.id,
      title: task.title,
      deadline: task.deadline,
      deadline_time: task.deadline_time,
      progress: actualProgress,
      expected_progress: expectedProgress,
      behind_percent: behindPercent,
      time_left: formatTimeLeft(timeLeftMs),
      message: buildMessage({ behindPercent, timeLeft: formatTimeLeft(timeLeftMs) }),
      suggestions: buildSuggestions({ behindPercent, dueSoon }),
      urgency: behindPercent >= 55 || dueSoon ? 'high' : behindPercent >= 30 ? 'medium' : 'low',
    }
  }).filter(Boolean)

  return rescueTasks.sort((a, b) => b.behind_percent - a.behind_percent).slice(0, 5)
}

module.exports = {
  getDeadlineRescueTasks,
}
