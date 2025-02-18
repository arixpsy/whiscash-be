import '@/utils/env'
import express from 'express'

const { PORT } = process.env;

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Whiscash Backend')
})

app.get('/healthcheck', (_req, res) => {
  res.json({
    message: 'Server is running',
    uptime: process.uptime(),
    timestamp: Date.now(),
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`)
})
