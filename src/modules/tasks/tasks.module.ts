import { Module } from '@nestjs/common';
import { PrismaTaskRepository } from './infrastructure/prisma-task.repository';
import { TaskRepository } from './repositories/task.repository';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  controllers: [TasksController],
  providers: [TasksService, { provide: TaskRepository, useClass: PrismaTaskRepository }],
})
export class TasksModule {}
