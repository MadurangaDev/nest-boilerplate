import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
});
export class CreateTaskDto extends createZodDto(createTaskSchema) {}

export const updateTaskSchema = createTaskSchema.partial().extend({
  done: z.boolean().optional(),
});
export class UpdateTaskDto extends createZodDto(updateTaskSchema) {}

export const taskResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  done: z.boolean(),
  createdAt: z.date(),
});
export class TaskResponseDto extends createZodDto(taskResponseSchema) {}
