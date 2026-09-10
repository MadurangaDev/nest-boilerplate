import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Drop this into any list endpoint, in any project: `@Query() query: PaginationQueryDto`.
// Query params arrive as strings, so this coerces + defaults + bounds them in
// one place instead of every controller re-deriving "what's a sane page size".
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export class PaginationQueryDto extends createZodDto(paginationQuerySchema) {}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}
