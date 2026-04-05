const db = require('../config/db')

const SignupVerification = {
  async upsert({
    email,
    name,
    password_hash,
    work_hours_per_day,
    productivity_goal,
    preferred_working_time,
    otp_hash,
    expires_at,
  }) {
    await db.query(
      `INSERT INTO signup_verification_otps
       (email, name, password_hash, work_hours_per_day, productivity_goal, preferred_working_time, otp_hash, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         password_hash = VALUES(password_hash),
         work_hours_per_day = VALUES(work_hours_per_day),
         productivity_goal = VALUES(productivity_goal),
         preferred_working_time = VALUES(preferred_working_time),
         otp_hash = VALUES(otp_hash),
         expires_at = VALUES(expires_at)`,
      [
        email,
        name,
        password_hash,
        work_hours_per_day || 8,
        productivity_goal || null,
        preferred_working_time || null,
        otp_hash,
        expires_at,
      ]
    )
  },

  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM signup_verification_otps WHERE email = ?', [email])
    return rows[0]
  },

  async deleteByEmail(email) {
    await db.query('DELETE FROM signup_verification_otps WHERE email = ?', [email])
  },

  async clearExpired() {
    await db.query('DELETE FROM signup_verification_otps WHERE expires_at < NOW()')
  },
}

module.exports = SignupVerification
