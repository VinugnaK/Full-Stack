const db = require('../config/db')

const Activity = {
  async log(userId, taskId, action, detail = null) {
    await db.query(
      'INSERT INTO activity_logs (user_id, task_id, action, detail) VALUES (?, ?, ?, ?)',
      [userId, taskId, action, detail]
    )
  },
  async getByUser(userId, limit = 20) {
    const [rows] = await db.query(
      'SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, limit]
    )
    return rows
  }
}

module.exports = Activity
