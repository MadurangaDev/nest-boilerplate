import { Injectable } from '@nestjs/common';
import type { Task } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Paginated } from '../../../common/dto/pagination-query.dto';
import { TaskRepository } from '../repositories/task.repository';

// The adapter -- the only file in this module allowed to import PrismaService.
// Identical shape to modules/auth/infrastructure/prisma-user.repository.ts;
// that repetition is the point, not an accident.
@Injectable()
export class PrismaTaskRepository implements TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page: number, limit: number): Promise<Paginated<Task>> {
    const [items, total] = await Promise.all([
      this.prisma.task.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.task.count(),
    ]);
    return { items, page, limit, total };
  }

  findById(id: string): Promise<Task | null> {
    return this.prisma.task.findUnique({ where: { id } });
  }

  create(title: string): Promise<Task> {
    return this.prisma.task.create({ data: { title } });
  }

  update(id: string, data: Partial<Pick<Task, 'title' | 'done'>>): Promise<Task> {
    return this.prisma.task.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({ where: { id } });
  }
}
