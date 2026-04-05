require('dotenv').config();
const express = require('express')
const cors    = require('cors')
const errorHandler = require('./middleware/errorHandler')

const authRoutes      = require('./routes/authRoutes')
const taskRoutes      = require('./routes/taskRoutes')
const userRoutes      = require('./routes/userRoutes')
const analyticsRoutes = require('./routes/analyticsRoutes')
const teamProjectRoutes = require('./routes/teamProjectRoutes')

const app = express()

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))
app.use(express.json())

// Routes
app.use('/api/auth',      authRoutes)
app.use('/api/tasks',     taskRoutes)
app.use('/api/users',     userRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/team-projects', teamProjectRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.use(errorHandler)

module.exports = app
