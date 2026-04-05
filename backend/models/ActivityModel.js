const { pool } = require('../config/db')

const ActivityModel = {
  async getByUser(userId, limit = 20) {
    const [rows] = await pool.execute(
      `SELECT a.*, t.title as task_title
       FROM activity_logs a
       LEFT JOIN tasks t ON a.task_id = t.id
       WHERE a.user_id = ?
       ORDER BY a.created_at DESC
       LIMIT ?`,
      [userId, limit]
    )
    return rows
  }
}

module.exports = ActivityModel
