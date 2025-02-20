import '@/utils/env'
import { consola } from 'consola'
import express from 'express'
import router from '@/routes'
import Middleware from '@/middleware'
import response from '@/utils/response'

const { PORT } = process.env

const app = express()

app.use(Middleware.json)
app.use(Middleware.cors)
app.use(Middleware.morgan)
app.use(Middleware.rateLimit)

app.get('/', (req, res) => {
  res.send('Whiscash Backend')
})

app.get('/healthcheck', (_req, res) => {
  response.ok(res, {
    message: 'Server is running',
    uptime: process.uptime(),
    timestamp: Date.now(),
  })
})

app.use('/api', Middleware.authenticate, router)

app.all('*', (_req, res) => {
  response.notFound(res, {
    message: 'Not found',
    description: 'The route you are accessing does not exist',
  })
})

app.listen(PORT, () => {
  consola.success(`Server is running on port: ${PORT}`)
})
