import { Injectable, NotFoundException } from '@nestjs/common';
import type { Paginated } from '../../common/dto/pagination-query.dto';
import { TaskRepository } from './repositories/task.repository';
import type { Task } from '@prisma/client';

// Orchestration only -- depends on TaskRepository, never on Prisma.
// Identical shape to AuthService: constructor-inject the port, throw
// framework exceptions for anything the caller needs to know about.
@Injectable()
export class TasksService {
  constructor(private readonly tasks: TaskRepository) {}

  list(page: number, limit: number): Promise<Paginated<Task>> {
    return this.tasks.findAll(page, limit);
  }

  async getOne(id: string): Promise<Task> {
    const task = await this.tasks.findById(id);
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  create(title: string): Promise<Task> {
    return this.tasks.create(title);
  }

  async update(id: string, data: { title?: string; done?: boolean }): Promise<Task> {
    await this.getOne(id); // 404s cleanly instead of Prisma's raw "record not found"
    return this.tasks.update(id, data);
  }

  async remove(id: string): Promise<void> {
    await this.getOne(id);
    await this.tasks.delete(id);
  }
}
