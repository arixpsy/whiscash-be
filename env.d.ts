import type { Env } from './src/utils/env';

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}