const db = require('./db')

async function columnExists(tableName, columnName) {
  const [[result]] = await db.query(
    `SELECT COUNT(*) AS count
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?`,
    [tableName, columnName]
  )

  return Number(result.count) > 0
}

async function initTaskEnhancements() {
  const hasDeadlineTime = await columnExists('tasks', 'deadline_time')
  if (!hasDeadlineTime) {
    await db.query(`ALTER TABLE tasks ADD COLUMN deadline_time TIME NULL AFTER deadline`)
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS task_reminders (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      task_id INT UNSIGNED NOT NULL,
      user_id INT UNSIGNED NOT NULL,
      reminder_key VARCHAR(100) NOT NULL,
      message TEXT NOT NULL,
      sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY uniq_task_reminder (task_id, reminder_key),
      INDEX idx_user_sent (user_id, sent_at)
    )
  `)
}

module.exports = initTaskEnhancements
