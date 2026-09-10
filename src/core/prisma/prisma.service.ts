import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// The ONE place in the whole app allowed to construct a PrismaClient.
// Every feature module talks to this through its own repository interface --
// nothing outside `core/prisma` and the `infrastructure/*.repository.ts`
// files should ever import `@prisma/client` directly.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Database connection established');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
