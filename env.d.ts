/// <reference types="@clerk/express/env" />
import type { Env } from './src/utils/env'

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}
