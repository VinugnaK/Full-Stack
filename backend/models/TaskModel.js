const { pool } = require('../config/db')

const TaskModel = {
  async create({ user_id, title, description, priority, status, deadline, estimated_hours }) {
    const [result] = await pool.execute(
      `INSERT INTO tasks (user_id, title, description, priority, status, deadline, estimated_hours)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id, title, description || null, priority, status, deadline || null, estimated_hours || null]
    )
    return result.insertId
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT t.*, r.risk_level, r.probability, r.suggestion
       FROM tasks t
       LEFT JOIN task_risk r ON t.id = r.task_id
       WHERE t.id = ?`,
      [id]
    )
    return rows[0] ? TaskModel._format(rows[0]) : null
  },

  async findByUser(userId, filters = {}) {
    let query = `SELECT t.*, r.risk_level, r.probability, r.suggestion
                 FROM tasks t
                 LEFT JOIN task_risk r ON t.id = r.task_id
                 WHERE t.user_id = ?`
    const params = [userId]

    if (filters.status && filters.status !== 'all') {
      query += ' AND t.status = ?'
      params.push(filters.status)
    }
    query += ' ORDER BY t.created_at DESC'
    if (filters.limit) {
      query += ' LIMIT ?'
      params.push(parseInt(filters.limit))
    }

    const [rows] = await pool.execute(query, params)
    return rows.map(TaskModel._format)
  },

  async update(id, fields) {
    const allowed = ['title', 'description', 'priority', 'status', 'deadline', 'estimated_hours', 'progress']
    const updates = Object.entries(fields).filter(([k]) => allowed.includes(k))
    if (updates.length === 0) return
    const setClause = updates.map(([k]) => `${k} = ?`).join(', ')
    const values = updates.map(([, v]) => v)
    await pool.execute(`UPDATE tasks SET ${setClause} WHERE id = ?`, [...values, id])
  },

  async delete(id) {
    await pool.execute('DELETE FROM tasks WHERE id = ?', [id])
  },

  async logActivity(taskId, userId, action, meta = null) {
    await pool.execute(
      'INSERT INTO activity_logs (task_id, user_id, action, metadata) VALUES (?, ?, ?, ?)',
      [taskId, userId, action, meta ? JSON.stringify(meta) : null]
    )
  },

  async getHistory(userId) {
    const [rows] = await pool.execute(
      `SELECT t.*, r.risk_level FROM tasks t
       LEFT JOIN task_risk r ON t.id = r.task_id
       WHERE t.user_id = ? AND t.status = 'done'
       ORDER BY t.updated_at DESC LIMIT 50`,
      [userId]
    )
    return rows
  },

  _format(row) {
    return {
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      description: row.description,
      priority: row.priority,
      status: row.status,
      deadline: row.deadline,
      estimated_hours: row.estimated_hours,
      progress: row.progress,
      created_at: row.created_at,
      updated_at: row.updated_at,
      risk: row.risk_level ? {
        risk_level: row.risk_level,
        probability: row.probability,
        suggestion: row.suggestion
      } : null
    }
  }
}

module.exports = TaskModel
