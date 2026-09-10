import type { Task } from '@prisma/client';
import type { Paginated } from '../../../common/dto/pagination-query.dto';

// The port -- zero Prisma, zero framework imports.
export abstract class TaskRepository {
  abstract findAll(page: number, limit: number): Promise<Paginated<Task>>;
  abstract findById(id: string): Promise<Task | null>;
  abstract create(title: string): Promise<Task>;
  abstract update(id: string, data: Partial<Pick<Task, 'title' | 'done'>>): Promise<Task>;
  abstract delete(id: string): Promise<void>;
}
