import type { User } from '@prisma/client';

// The port. Zero framework imports, zero Prisma imports -- this is the only
// thing AuthService is allowed to depend on for persistence.
export abstract class UserRepository {
  abstract findByEmail(email: string): Promise<User | null>;
}
