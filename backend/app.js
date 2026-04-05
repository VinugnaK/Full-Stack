const express = require('express')
const cors = require('cors')
const { errorHandler } = require('./middleware/errorMiddleware')

const authRoutes = require('./routes/authRoutes')
const taskRoutes = require('./routes/taskRoutes')
const userRoutes = require('./routes/userRoutes')
const analyticsRoutes = require('./routes/analyticsRoutes')

const app = express()

app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/users', userRoutes)
app.use('/api/analytics', analyticsRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// Error handler (must be last)
app.use(errorHandler)

module.exports = app
