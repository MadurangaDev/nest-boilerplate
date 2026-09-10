import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from './repositories/user.repository';

// Orchestration only. Depends on the UserRepository abstraction -- never on
// Prisma, never on PrismaService. Swap the adapter in auth.module.ts and
// nothing here changes.
@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string): Promise<{ accessToken: string }> {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.jwt.signAsync({ sub: user.id, email: user.email });
    return { accessToken };
  }
}
