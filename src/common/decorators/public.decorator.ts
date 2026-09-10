import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'is_public';

// Every route requires a valid JWT by default (JwtAuthGuard is global).
// @Public() is the explicit opt-out for routes like /auth/login and /health.
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
