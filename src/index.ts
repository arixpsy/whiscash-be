import './utils/env'
import express, { type Express, type Request, type Response } from 'express'

const { PORT } = process.env;

const app: Express = express()

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  res.send('Whiscash Backend')
})

app.get('/healthcheck', (_req, res) => {
  res.json({
    message: 'Server is running',
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`)
})
