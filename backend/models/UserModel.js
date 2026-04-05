const db = require('../config/db')

const User = {
  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email])
    return rows[0]
  },
  async findById(id) {
    const [rows] = await db.query(
      'SELECT id, name, email, work_hours_per_day, productivity_goal, preferred_working_time, created_at FROM users WHERE id = ?',
      [id]
    )
    return rows[0]
  },
  async create({ name, email, password_hash, work_hours_per_day, productivity_goal, preferred_working_time }) {
    const [result] = await db.query(
      `INSERT INTO users (name, email, password_hash, work_hours_per_day, productivity_goal, preferred_working_time)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, password_hash, work_hours_per_day || 8, productivity_goal || null, preferred_working_time || null]
    )
    return result.insertId
  },
  async update(id, { name, work_hours_per_day, productivity_goal, preferred_working_time }) {
    await db.query(
      `UPDATE users
       SET name = ?, work_hours_per_day = ?, productivity_goal = ?, preferred_working_time = ?
       WHERE id = ?`,
      [name, work_hours_per_day, productivity_goal || null, preferred_working_time || null, id]
    )
  },
  async updatePassword(id, password_hash) {
    await db.query(
      `UPDATE users
       SET password_hash = ?
       WHERE id = ?`,
      [password_hash, id]
    )
  }
}

module.exports = User
