import 'dotenv/config'
import { ZodError, z } from 'zod'

const EnvironmentVariablesSchema = z.object({
  PORT: z
    .string()
    .regex(/^\d{4,5}$/)
    .optional()
    .default('3000'),
  DATABASE_URL: z
    .string()
    .url()
    .refine(
      (url) => url.startsWith('postgres://') || url.startsWith('postgresql://'),
      'DATABASE_URL must be a valid postgresql url'
    ),
  CLERK_PUBLISHABLE_KEY: z
    .string()
    .refine(
      (url) => url.startsWith('pk'),
      'CLERK_PUBLISHABLE_KEY must be a valid key'
    ),
  CLERK_SECRET_KEY: z
    .string()
    .refine(
      (url) => url.startsWith('sk'),
      'CLERK_PUBLISHABLE_KEY must be a valid key'
    ),
})

try {
  EnvironmentVariablesSchema.parse(process.env)
} catch (error) {
  if (error instanceof ZodError) console.error(error.errors)

  process.exit(1)
}

export type Env = z.infer<typeof EnvironmentVariablesSchema>
