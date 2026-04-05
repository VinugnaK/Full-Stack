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

async function initUserPreferences() {
  const hasProductivityGoal = await columnExists('users', 'productivity_goal')
  if (!hasProductivityGoal) {
    await db.query(`ALTER TABLE users ADD COLUMN productivity_goal VARCHAR(160) NULL AFTER work_hours_per_day`)
  }

  const hasPreferredWorkingTime = await columnExists('users', 'preferred_working_time')
  if (!hasPreferredWorkingTime) {
    await db.query(`ALTER TABLE users ADD COLUMN preferred_working_time ENUM('morning', 'afternoon', 'evening', 'night') NULL AFTER productivity_goal`)
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNSIGNED NOT NULL,
      token_hash VARCHAR(64) NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      used_at DATETIME NULL DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_password_reset_user (user_id),
      INDEX idx_password_reset_expiry (expires_at)
    )
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS signup_verification_otps (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(150) NOT NULL UNIQUE,
      name VARCHAR(100) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      work_hours_per_day TINYINT UNSIGNED DEFAULT 8,
      productivity_goal VARCHAR(160) NULL,
      preferred_working_time ENUM('morning', 'afternoon', 'evening', 'night') NULL,
      otp_hash VARCHAR(64) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_signup_verification_email (email),
      INDEX idx_signup_verification_expiry (expires_at)
    )
  `)
}

module.exports = initUserPreferences
