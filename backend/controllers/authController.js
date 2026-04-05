const UserModel = require('../models/UserModel')
const { generateToken } = require('../utils/tokenUtils')

const register = async (req, res, next) => {
  try {
    const { name, email, password, work_hours_per_day } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }
    const existing = await UserModel.findByEmail(email)
    if (existing) return res.status(409).json({ message: 'Email already registered' })

    const userId = await UserModel.create({ name, email, password, work_hours_per_day })
    const user = await UserModel.findById(userId)
    const token = generateToken(userId)
    res.status(201).json({ token, user })
  } catch (err) {
    next(err)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

    const user = await UserModel.findByEmail(email)
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const valid = await UserModel.comparePassword(password, user.password_hash)
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' })

    const token = generateToken(user.id)
    const { password_hash, ...safeUser } = user
    res.json({ token, user: safeUser })
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login }
