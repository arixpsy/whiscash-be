import '@/utils/env'
import { clerkMiddleware } from '@clerk/express'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import router from '@/routes'

const { PORT } = process.env

const app = express()

app.use(express.json())
app.use(clerkMiddleware())
app.use(cors())
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    handler: (req, res) => {
      console.warn(`DDoS Attempt from ${req.ip}`)

      res.status(429).json({
        code: 429,
        message: 'Request limit reached',
        description: 'Request limit reached. Please try again later',
      })
    },
  })
)

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

app.use('/api', router)

app.all('*', (_req, res) => {
  res.status(404).json({
    code: 404,
    message: 'Not found',
    description: 'The route you are accessing does not exist',
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`)
})
