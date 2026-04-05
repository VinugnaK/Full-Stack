const db = require('../config/db')

function toDateKey(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getTaskDueAt(task) {
  if (!task?.deadline) return null
  const dateKey = toDateKey(task.deadline)
  if (!dateKey) return null
  const timePart = task.deadline_time ? String(task.deadline_time).slice(0, 8) : '23:59:59'
  const dueAt = new Date(`${dateKey}T${timePart}`)
  return Number.isNaN(dueAt.getTime()) ? null : dueAt
}

function normalizePrediction(task) {
  if (!task?.prediction) return null

  const dueAt = getTaskDueAt(task)
  const now = new Date()

  if (task.status === 'done') {
    return {
      ...task.prediction,
      risk_level: 'LOW',
      suggestion: 'Task is completed. Risk is low.',
    }
  }

  if (dueAt && dueAt < now) {
    return {
      ...task.prediction,
      risk_level: 'HIGH',
      suggestion: 'This task is overdue and needs immediate attention.',
    }
  }

  return task.prediction
}

function formatDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDayLabel(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

const Task = {
  async countByUser(userId) {
    const [[row]] = await db.query(
      'SELECT COUNT(*) AS total FROM tasks WHERE user_id = ?',
      [userId]
    )
    return Number(row?.total || 0)
  },

  async findAllByUser(userId, filters = {}) {
    let sql = `
      SELECT t.*, p.risk_level, p.risk_score, p.suggestion
      FROM tasks t
      LEFT JOIN ai_predictions p ON p.task_id = t.id AND p.id = (
        SELECT MAX(id) FROM ai_predictions WHERE task_id = t.id
      )
      WHERE t.user_id = ?
    `
    const params = [userId]
    if (filters.status) { sql += ' AND t.status = ?'; params.push(filters.status) }
    sql += ' ORDER BY t.created_at DESC'
    if (filters.limit) { sql += ' LIMIT ?'; params.push(Number(filters.limit)) }
    const [rows] = await db.query(sql, params)
    return rows.map(r => ({
      ...r,
      prediction: normalizePrediction({
        ...r,
        prediction: r.risk_level ? { risk_level: r.risk_level, risk_score: r.risk_score, suggestion: r.suggestion } : null,
      })
    }))
  },

  async findById(id, userId) {
    const [rows] = await db.query(
      `SELECT t.*, p.risk_level, p.risk_score, p.suggestion
       FROM tasks t
       LEFT JOIN ai_predictions p ON p.task_id = t.id AND p.id = (SELECT MAX(id) FROM ai_predictions WHERE task_id = t.id)
       WHERE t.id = ? AND t.user_id = ?`,
      [id, userId]
    )
    const r = rows[0]
    if (!r) return null
    return {
      ...r,
      prediction: normalizePrediction({
        ...r,
        prediction: r.risk_level ? { risk_level: r.risk_level, risk_score: r.risk_score, suggestion: r.suggestion } : null,
      }),
    }
  },

  async create({ user_id, title, description, priority, status, deadline, deadline_time, estimated_hours }) {
    const [result] = await db.query(
      'INSERT INTO tasks (user_id, title, description, priority, status, deadline, deadline_time, estimated_hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, title, description, priority || 'medium', status || 'todo', deadline || null, deadline_time || null, estimated_hours || null]
    )
    return result.insertId
  },

  async update(id, userId, data) {
    const fields = []
    const values = []
    const allowed = ['title', 'description', 'priority', 'status', 'deadline', 'deadline_time', 'estimated_hours', 'progress']
    allowed.forEach(f => {
      if (data[f] !== undefined) { fields.push(`${f} = ?`); values.push(data[f]) }
    })
    if (!fields.length) return
    values.push(id, userId)
    await db.query(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`, values)
  },

  async delete(id, userId) {
    await db.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId])
  },

  async getCompletionHistory(userId, days = 7) {
    const [rows] = await db.query(
      `SELECT DATE(created_at) as date, COUNT(*) as created,
              SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed
       FROM tasks WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY DATE(created_at) ORDER BY date ASC`,
      [userId, days]
    )
    return rows
  },

  async getUserWorkload(userId) {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - 1)

    const end = new Date(start)
    end.setDate(end.getDate() + 6)

    const [rows] = await db.query(
      `SELECT
         DATE(deadline) AS deadline_date,
         COUNT(*) AS tasks,
         SUM(COALESCE(estimated_hours, 0)) AS hours
       FROM tasks
       WHERE user_id = ?
         AND deadline IS NOT NULL
         AND DATE(deadline) BETWEEN ? AND ?
       GROUP BY DATE(deadline)
       ORDER BY DATE(deadline) ASC`,
      [userId, formatDateKey(start), formatDateKey(end)]
    )

    const byDate = new Map(
      rows.map(row => [
        formatDateKey(new Date(row.deadline_date)),
        {
          tasks: Number(row.tasks || 0),
          hours: Number(row.hours || 0),
        },
      ])
    )

    const series = []
    const cursor = new Date(start)
    while (cursor <= end) {
      const key = formatDateKey(cursor)
      const snapshot = byDate.get(key) || { tasks: 0, hours: 0 }
      series.push({
        date: key,
        day: formatDayLabel(cursor),
        tasks: snapshot.tasks,
        hours: snapshot.hours,
        isToday: key === formatDateKey(new Date()),
      })
      cursor.setDate(cursor.getDate() + 1)
    }

    return series
  }
  ,

  async findActiveWithDeadlines(userId) {
    const [rows] = await db.query(
      `SELECT id, title, deadline, deadline_time, estimated_hours, status, progress, created_at
       FROM tasks
       WHERE user_id = ?
         AND deadline IS NOT NULL
         AND status != 'done'`,
      [userId]
    )
    return rows
  }
}

module.exports = Task
