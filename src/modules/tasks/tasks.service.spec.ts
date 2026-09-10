import { NotFoundException } from '@nestjs/common';
import type { Task } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TaskRepository } from './repositories/task.repository';
import { TasksService } from './tasks.service';

function makeFakeTaskRepository(overrides: Partial<TaskRepository> = {}): TaskRepository {
  return {
    findAll: vi.fn().mockResolvedValue({ items: [], page: 1, limit: 20, total: 0 }),
    findById: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  };
}

const sampleTask = { id: 't1', title: 'Write tests', done: false } as Task;

describe('TasksService', () => {
  let repo: TaskRepository;
  let service: TasksService;

  beforeEach(() => {
    repo = makeFakeTaskRepository();
    service = new TasksService(repo);
  });

  it('list() delegates paging straight through to the repository', async () => {
    await service.list(2, 10);
    expect(repo.findAll).toHaveBeenCalledWith(2, 10);
  });

  it('getOne() throws NotFoundException for a missing id', async () => {
    await expect(service.getOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('getOne() returns the task when the repository has it', async () => {
    repo = makeFakeTaskRepository({ findById: vi.fn().mockResolvedValue(sampleTask) });
    service = new TasksService(repo);

    await expect(service.getOne('t1')).resolves.toEqual(sampleTask);
  });

  it('update() checks existence before writing, so a bad id 404s instead of hitting Prisma', async () => {
    await expect(service.update('missing', { title: 'x' })).rejects.toThrow(NotFoundException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('remove() checks existence before deleting', async () => {
    await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('remove() deletes once the task is confirmed to exist', async () => {
    repo = makeFakeTaskRepository({ findById: vi.fn().mockResolvedValue(sampleTask) });
    service = new TasksService(repo);

    await service.remove('t1');
    expect(repo.delete).toHaveBeenCalledWith('t1');
  });
});
