import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { IdParamDto } from '../../common/dto/id-param.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { CreateTaskDto, TaskResponseDto, UpdateTaskDto } from './dto/task.dto';
import { TasksService } from './tasks.service';

// Every route here is protected by the global JwtAuthGuard by default --
// no @Public(), unlike auth/login. Same three validation sources exercised
// (@Query, @Param, @Body), all through the same reusable Zod DTOs.
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  @ResponseMessage('Tasks retrieved')
  list(@Query() query: PaginationQueryDto) {
    return this.tasks.list(query.page, query.limit);
  }

  @Get(':id')
  @ResponseMessage('Task retrieved')
  @ZodSerializerDto(TaskResponseDto)
  getOne(@Param() params: IdParamDto) {
    return this.tasks.getOne(params.id);
  }

  @Post()
  @ResponseMessage('Task created')
  @ZodSerializerDto(TaskResponseDto)
  create(@Body() dto: CreateTaskDto) {
    return this.tasks.create(dto.title);
  }

  @Patch(':id')
  @ResponseMessage('Task updated')
  @ZodSerializerDto(TaskResponseDto)
  update(@Param() params: IdParamDto, @Body() dto: UpdateTaskDto) {
    return this.tasks.update(params.id, dto);
  }

  @Delete(':id')
  @ResponseMessage('Task deleted')
  async remove(@Param() params: IdParamDto) {
    await this.tasks.remove(params.id);
    return null;
  }
}
