import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const loginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export class LoginDto extends createZodDto(loginRequestSchema) {}

export const loginResponseSchema = z.object({
  accessToken: z.string(),
});

export class LoginResponseDto extends createZodDto(loginResponseSchema) {}
