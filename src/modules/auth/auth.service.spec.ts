import * as bcrypt from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';
import type { UserRepository } from './repositories/user.repository';

// AuthService depends only on the UserRepository *interface* -- this fake
// never touches Prisma, never touches a database. This is the concrete
// payoff of the repository-interface boundary: the service is testable
// in isolation, in milliseconds, with no live DB required.
function makeFakeUserRepository(user: User | null): UserRepository {
  return { findByEmail: vi.fn().mockResolvedValue(user) };
}

function makeFakeJwt(): JwtService {
  return { signAsync: vi.fn().mockResolvedValue('signed.jwt.token') } as unknown as JwtService;
}

describe('AuthService', () => {
  let hashedPassword: string;

  beforeEach(async () => {
    hashedPassword = await bcrypt.hash('correct-password', 4);
  });

  it('rejects login when no user exists for the email', async () => {
    const service = new AuthService(makeFakeUserRepository(null), makeFakeJwt());

    await expect(service.login('nobody@example.com', 'whatever')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects login when the password does not match', async () => {
    const user = { id: '1', email: 'a@example.com', password: hashedPassword } as User;
    const service = new AuthService(makeFakeUserRepository(user), makeFakeJwt());

    await expect(service.login('a@example.com', 'wrong-password')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('returns a signed access token when credentials are correct', async () => {
    const user = { id: '1', email: 'a@example.com', password: hashedPassword } as User;
    const jwt = makeFakeJwt();
    const service = new AuthService(makeFakeUserRepository(user), jwt);

    const result = await service.login('a@example.com', 'correct-password');

    expect(result).toEqual({ accessToken: 'signed.jwt.token' });
    expect(jwt.signAsync).toHaveBeenCalledWith({ sub: '1', email: 'a@example.com' });
  });
});
