import { registerAs } from '@nestjs/config';
import type { Env } from './env.validation';

// Typed, namespaced config accessors -- inject via ConfigType<typeof appConfig>
// instead of reaching for raw process.env anywhere else in the app.
export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV as Env['NODE_ENV'],
  port: Number(process.env.PORT),
  corsOrigin: process.env.CORS_ORIGIN,
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET as string,
  expiresIn: process.env.JWT_EXPIRES_IN,
}));
