require('dotenv').config()
const app = require('./app')
const initTeamCollaboration = require('./config/initTeamCollaboration')
const initTaskEnhancements = require('./config/initTaskEnhancements')
const initUserPreferences = require('./config/initUserPreferences')

const PORT = process.env.PORT || 5000

async function startServer() {
  await initTeamCollaboration()
  await initTaskEnhancements()
  await initUserPreferences()
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`)
  })
}

startServer().catch(error => {
  console.error('Failed to initialize backend', error)
  process.exit(1)
})
