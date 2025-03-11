import { consola } from 'consola'
import cors from 'cors'
import express, { type Handler } from 'express'
import rateLimit from 'express-rate-limit'
import morgan from 'morgan'
import authenticate from './auth'

const Middleware: Record<string, Handler> = {
  authenticate,
  cors: cors(),
  json: express.json(),
  morgan: morgan('tiny'),
  rateLimit: rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    handler: (req, res) => {
      consola.warn(`DDoS Attempt from ${req.ip}`)

      res.status(429).json({
        code: 429,
        message: 'Request limit reached',
        description: 'Request limit reached. Please try again later',
      })
    },
  }),
}

export default Middleware
