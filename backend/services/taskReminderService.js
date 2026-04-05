const Task = require('../models/taskModel')
const TaskReminder = require('../models/taskReminderModel')

const APP_TIME_ZONE = 'Asia/Kolkata'

function getDatePartsInTimeZone(value, timeZone = APP_TIME_ZONE) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const mapped = Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type, part.value]))
  if (!mapped.year || !mapped.month || !mapped.day) return null

  return {
    year: mapped.year,
    month: mapped.month,
    day: mapped.day,
  }
}

function combineDeadline(deadline, deadlineTime) {
  if (!deadline) return null
  const dateParts = getDatePartsInTimeZone(deadline)
  if (!dateParts) return null

  const datePart = `${dateParts.year}-${dateParts.month}-${dateParts.day}`
  const timePart = deadlineTime ? String(deadlineTime).slice(0, 8) : '23:59:59'
  const result = new Date(`${datePart}T${timePart}`)
  return Number.isNaN(result.getTime()) ? null : result
}

function formatTimeLeft(ms) {
  const totalHours = Math.ceil(ms / (1000 * 60 * 60))
  if (totalHours < 24) {
    return `${totalHours} hour${totalHours === 1 ? '' : 's'}`
  }

  const totalDays = Math.ceil(totalHours / 24)
  return `${totalDays} day${totalDays === 1 ? '' : 's'}`
}

function buildReminderMessage(taskName, timeLeft, urgency) {
  const templates = {
    friendly: `Hey Cherry, your task "${taskName}" is due in ${timeLeft}. A small push now can save a big rush later!`,
    motivating: `Only ${timeLeft} left for "${taskName}"! You've got this - just one focused session and you're done.`,
    urgent: `Deadline approaching! "${taskName}" is due in ${timeLeft}. Now is the time to act - no delays!`,
    calm: `"${taskName}" is due in ${timeLeft}. Stay steady, start small, and keep going - you're closer than you think.`,
    focus: `${timeLeft} remaining for "${taskName}". Focus for 25 minutes now - you'll make real progress.`,
    overdue: `You missed "${taskName}". The deadline has passed, so this task now needs immediate attention.`,
  }

  return templates[urgency] || templates.friendly
}

async function getDueReminderNotifications(userId) {
  const tasks = await Task.findActiveWithDeadlines(userId)
  const now = new Date()
  const notifications = []

  for (const task of tasks) {
    const dueAt = combineDeadline(task.deadline, task.deadline_time)
    if (!dueAt) continue

    if (dueAt <= now) {
      const reminderKey = 'overdue'
      if (!(await TaskReminder.hasSent(task.id, reminderKey))) {
        const message = buildReminderMessage(task.title, '0 hours', 'overdue')
        await TaskReminder.create({
          taskId: task.id,
          userId,
          reminderKey,
          message,
        })

        notifications.push({
          task_id: task.id,
          task_name: task.title,
          message,
          deadline: task.deadline,
          deadline_time: task.deadline_time,
        })
      }
      continue
    }

    const msLeft = dueAt - now
    const hoursLeft = msLeft / (1000 * 60 * 60)
    const daysLeft = msLeft / (1000 * 60 * 60 * 24)

    let reminderKey = null
    let urgency = 'friendly'

    if (hoursLeft <= 2) {
      reminderKey = 'deadline-2h'
      urgency = 'urgent'
    } else if (hoursLeft <= 3) {
      reminderKey = 'deadline-3h'
      urgency = 'motivating'
    } else if (daysLeft >= 1) {
      const todayKey = new Date().toISOString().split('T')[0]
      reminderKey = `daily-${todayKey}`
      urgency = daysLeft > 2 ? 'calm' : 'focus'
    }

    if (!reminderKey) continue
    if (await TaskReminder.hasSent(task.id, reminderKey)) continue

    const message = buildReminderMessage(task.title, formatTimeLeft(msLeft), urgency)
    await TaskReminder.create({
      taskId: task.id,
      userId,
      reminderKey,
      message,
    })

    notifications.push({
      task_id: task.id,
      task_name: task.title,
      message,
      deadline: task.deadline,
      deadline_time: task.deadline_time,
    })
  }

  const history = await TaskReminder.getRecentByUser(userId, 20)
  const filteredHistory = history.filter(item => {
    if (item.reminder_key !== 'overdue') return true
    const dueAt = combineDeadline(item.deadline, item.deadline_time)
    return dueAt ? dueAt <= now : true
  })

  return { notifications, history: filteredHistory }
}

module.exports = {
  getDueReminderNotifications,
}
