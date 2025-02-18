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
      'DB_URL must be a valid postgresql url'
    ),
})

try {
  EnvironmentVariablesSchema.parse(process.env)
} catch (error) {
  if (error instanceof ZodError) console.error(error.errors)

  process.exit(1)
}

export type Env = z.infer<typeof EnvironmentVariablesSchema>
