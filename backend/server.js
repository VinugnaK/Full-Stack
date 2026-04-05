require('dotenv').config()
const app = require('./app')
const { testConnection } = require('./config/db')

const PORT = process.env.PORT || 5000

async function startServer() {
  await testConnection()
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`)
  })
}

startServer().catch((err) => {
  console.error('❌ Server failed to start:', err)
  process.exit(1)
})
