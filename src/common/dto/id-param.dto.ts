import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Same idea for the other universal case: a single `:id` route param.
// `@Param() params: IdParamDto` validates and types it in one line instead
// of trusting whatever string shows up in the URL.
export const idParamSchema = z.object({
  id: z.string().min(1),
});

export class IdParamDto extends createZodDto(idParamSchema) {}
