const db = require('../config/db')

const TaskReminder = {
  async hasSent(taskId, reminderKey) {
    const [rows] = await db.query(
      `SELECT id FROM task_reminders WHERE task_id = ? AND reminder_key = ? LIMIT 1`,
      [taskId, reminderKey]
    )
    return Boolean(rows[0])
  },

  async create({ taskId, userId, reminderKey, message }) {
    await db.query(
      `INSERT INTO task_reminders (task_id, user_id, reminder_key, message)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE message = VALUES(message), sent_at = sent_at`,
      [taskId, userId, reminderKey, message]
    )
  },

  async getRecentByUser(userId, limit = 20) {
    const [rows] = await db.query(
      `SELECT
         tr.id,
         tr.task_id,
         tr.reminder_key,
         tr.message,
         tr.sent_at,
         t.title,
         t.deadline,
         t.deadline_time
       FROM task_reminders tr
       INNER JOIN tasks t ON t.id = tr.task_id
       WHERE tr.user_id = ?
       ORDER BY tr.sent_at DESC
       LIMIT ?`,
      [userId, limit]
    )
    return rows
  },
}

module.exports = TaskReminder
