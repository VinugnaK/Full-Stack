const db = require('../config/db')

const TeamNotification = {
  async create({ userId, projectId, teamTaskId, eventType, message }) {
    const [result] = await db.query(
      `INSERT INTO team_notifications (user_id, project_id, team_task_id, event_type, message)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, projectId, teamTaskId || null, eventType, message]
    )
    return result.insertId
  },

  async findRecentByUser(userId, limit = 20) {
    const [rows] = await db.query(
      `SELECT
         tn.id,
         tn.user_id,
         tn.project_id,
         tn.team_task_id,
         tn.event_type,
         tn.message,
         tn.created_at,
         tp.name AS project_name,
         tt.title AS task_title
       FROM team_notifications tn
       INNER JOIN team_projects tp ON tp.id = tn.project_id
       LEFT JOIN team_tasks tt ON tt.id = tn.team_task_id
       WHERE tn.user_id = ?
       ORDER BY tn.created_at DESC
       LIMIT ?`,
      [userId, limit]
    )
    return rows
  },

  async findSinceByUser(userId, since) {
    const [rows] = await db.query(
      `SELECT
         tn.id,
         tn.user_id,
         tn.project_id,
         tn.team_task_id,
         tn.event_type,
         tn.message,
         tn.created_at,
         tp.name AS project_name,
         tt.title AS task_title
       FROM team_notifications tn
       INNER JOIN team_projects tp ON tp.id = tn.project_id
       LEFT JOIN team_tasks tt ON tt.id = tn.team_task_id
       WHERE tn.user_id = ? AND tn.created_at > ?
       ORDER BY tn.created_at DESC`,
      [userId, since]
    )
    return rows
  },
}

module.exports = TeamNotification
