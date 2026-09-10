import { z } from 'zod';

// One schema, one place. Same idea as the express-boilerplate's configs/env.ts,
// wired through Nest's own ConfigModule validation hook instead of a manual
// parse-and-exit call.
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('1d'),
  CORS_ORIGIN: z.string().default('*'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    // Thrown during bootstrap, before the app starts listening -- same
    // hard-fail-on-bad-config behaviour as the Express version.
    throw new Error(`Invalid environment configuration:\n${result.error.message}`);
  }
  return result.data;
}
