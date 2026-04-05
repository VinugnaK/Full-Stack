const db = require('../config/db')

const PasswordReset = {
  async create({ userId, tokenHash, expiresAt }) {
    await db.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES (?, ?, ?)`,
      [userId, tokenHash, expiresAt]
    )
  },

  async invalidateForUser(userId) {
    await db.query(
      `DELETE FROM password_reset_tokens WHERE user_id = ?`,
      [userId]
    )
  },

  async findValidByTokenHash(tokenHash) {
    const [rows] = await db.query(
      `SELECT prt.*, u.email, u.name
       FROM password_reset_tokens prt
       INNER JOIN users u ON u.id = prt.user_id
       WHERE prt.token_hash = ?
         AND prt.used_at IS NULL
         AND prt.expires_at > NOW()
       LIMIT 1`,
      [tokenHash]
    )
    return rows[0] || null
  },

  async findValidByEmailAndTokenHash(email, tokenHash) {
    const [rows] = await db.query(
      `SELECT prt.*, u.email, u.name
       FROM password_reset_tokens prt
       INNER JOIN users u ON u.id = prt.user_id
       WHERE u.email = ?
         AND prt.token_hash = ?
         AND prt.used_at IS NULL
         AND prt.expires_at > NOW()
       LIMIT 1`,
      [email, tokenHash]
    )
    return rows[0] || null
  },

  async markUsed(id) {
    await db.query(
      `UPDATE password_reset_tokens
       SET used_at = NOW()
       WHERE id = ?`,
      [id]
    )
  },
}

module.exports = PasswordReset
