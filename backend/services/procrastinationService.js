const db = require('../config/db')
async function getProcrastinationAlerts(userId) {
  const [rows] = await db.query(
    `SELECT
       t.id AS task_id,
       t.title,
       COUNT(*) AS postpone_count,
       MAX(al.created_at) AS last_postponed_at
     FROM activity_logs al
     INNER JOIN tasks t ON t.id = al.task_id
     WHERE al.user_id = ?
       AND al.action = 'postponed'
       AND t.status != 'done'
     GROUP BY t.id, t.title
     HAVING COUNT(*) >= 3
     ORDER BY postpone_count DESC, last_postponed_at DESC
     LIMIT 5`,
    [userId]
  )

  const alerts = rows.map(row => ({
    task_id: row.task_id,
    title: row.title,
    postpone_count: Number(row.postpone_count || 0),
    last_postponed_at: row.last_postponed_at,
    message: `You postponed this task ${row.postpone_count} times. Let's finish at least 20% today.`,
    suggestions: ['Start now', 'Finish 20% today', 'Break task into smaller parts'],
  }))

  return alerts
}

module.exports = {
  getProcrastinationAlerts,
}
