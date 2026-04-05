function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

function parseDeadline(deadline) {
  if (!deadline) return null

  if (deadline instanceof Date) {
    if (Number.isNaN(deadline.getTime())) return null
    const normalized = new Date(deadline)
    normalized.setHours(0, 0, 0, 0)
    return normalized
  }

  if (typeof deadline === 'string') {
    const normalizedValue = deadline.includes('T') ? deadline : `${deadline}T00:00:00`
    const parsed = new Date(normalizedValue)
    if (Number.isNaN(parsed.getTime())) return null
    parsed.setHours(0, 0, 0, 0)
    return parsed
  }

  const parsed = new Date(deadline)
  if (Number.isNaN(parsed.getTime())) return null
  parsed.setHours(0, 0, 0, 0)
  return parsed
}

function parseDeadlineTime(deadlineTime) {
  if (!deadlineTime) return null
  if (deadlineTime instanceof Date) {
    const hours = String(deadlineTime.getHours()).padStart(2, '0')
    const minutes = String(deadlineTime.getMinutes()).padStart(2, '0')
    return { hours: Number(hours), minutes: Number(minutes) }
  }

  const [hours, minutes] = String(deadlineTime).split(':')
  if (hours === undefined || minutes === undefined) return null

  const parsedHours = Number(hours)
  const parsedMinutes = Number(minutes)
  if (!Number.isInteger(parsedHours) || !Number.isInteger(parsedMinutes)) return null
  if (parsedHours < 0 || parsedHours > 23 || parsedMinutes < 0 || parsedMinutes > 59) return null

  return { hours: parsedHours, minutes: parsedMinutes }
}

function validateTaskSchedule({ deadline, deadline_time, estimated_hours, workHoursPerDay = 8 }) {
  const parsedHours =
    estimated_hours === undefined || estimated_hours === null || estimated_hours === ''
      ? null
      : Number(estimated_hours)

  if (parsedHours !== null && (!Number.isFinite(parsedHours) || parsedHours <= 0)) {
    return 'Estimated hours must be a valid number greater than 0'
  }

  if (!deadline) return null

  const parsedDeadline = parseDeadline(deadline)
  if (!parsedDeadline) {
    return 'Deadline must be a valid date'
  }

  const today = startOfToday()
  const deadlineTime = parseDeadlineTime(deadline_time)
  const deadlineDateTime = new Date(parsedDeadline)
  if (deadlineTime) {
    deadlineDateTime.setHours(deadlineTime.hours, deadlineTime.minutes, 0, 0)
  } else {
    deadlineDateTime.setHours(23, 59, 0, 0)
  }

  const now = new Date()

  if (parsedDeadline < today) {
    return 'Deadline cannot be in the past'
  }

  if (parsedDeadline.getTime() === today.getTime()) {
    if (!deadlineTime) {
      return 'For tasks due today, please choose a deadline time'
    }
    if (deadlineDateTime <= now) {
      return 'For tasks due today, deadline time must be later than the current time'
    }
  } else if (parsedDeadline <= today) {
    return 'Deadline must be later than today'
  }

  if (parsedHours === null) return null

  let maxHours = 0
  if (parsedDeadline.getTime() === today.getTime()) {
    maxHours = Math.max(0.5, (deadlineDateTime - now) / (1000 * 60 * 60))
  } else {
    const millisecondsPerDay = 1000 * 60 * 60 * 24
    const availableDays = Math.ceil((parsedDeadline - today) / millisecondsPerDay)
    maxHours = availableDays * Number(workHoursPerDay || 8)
  }

  if (parsedHours > maxHours) {
    return `Estimated hours exceed the available working time before the deadline (${maxHours} hours max based on your schedule)`
  }

  return null
}

function validateStatusTransition(currentStatus, nextStatus) {
  if (!nextStatus || !currentStatus) return null

  const order = {
    todo: 0,
    in_progress: 1,
    done: 2,
  }

  if (order[nextStatus] === undefined || order[currentStatus] === undefined) {
    return 'Invalid task status'
  }

  if (order[nextStatus] < order[currentStatus]) {
    return 'Tasks can only move forward: To Do -> In Progress -> Done'
  }

  return null
}

module.exports = {
  validateTaskSchedule,
  validateStatusTransition,
}
