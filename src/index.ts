import '@/utils/env'
import express from 'express'
import router from '@/routes'
import Middleware from '@/middleware'

const { PORT } = process.env

const app = express()

app.use(Middleware.json)
app.use(Middleware.cors)
app.use(Middleware.rateLimit)

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

app.use('/api', Middleware.authenticate, router)

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
