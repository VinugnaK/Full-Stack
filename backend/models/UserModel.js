const { pool } = require('../config/db')
const bcrypt = require('bcryptjs')

const UserModel = {
  async create({ name, email, password, work_hours_per_day = 8 }) {
    const hashed = await bcrypt.hash(password, 12)
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash, work_hours_per_day) VALUES (?, ?, ?, ?)',
      [name, email, hashed, work_hours_per_day]
    )
    return result.insertId
  },

  async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email])
    return rows[0] || null
  },

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, name, email, work_hours_per_day, timezone, created_at FROM users WHERE id = ?',
      [id]
    )
    return rows[0] || null
  },

  async update(id, fields) {
    const allowed = ['name', 'work_hours_per_day', 'timezone']
    const updates = Object.entries(fields).filter(([k]) => allowed.includes(k))
    if (updates.length === 0) return
    const setClause = updates.map(([k]) => `${k} = ?`).join(', ')
    const values = updates.map(([, v]) => v)
    await pool.execute(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, id])
  },

  async comparePassword(plain, hash) {
    return bcrypt.compare(plain, hash)
  }
}

module.exports = UserModel
