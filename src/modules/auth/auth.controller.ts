import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import type { AuthenticatedUser } from './auth.types';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // Public -- bypasses the global JwtAuthGuard.
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Login successful')
  @ZodSerializerDto(LoginResponseDto)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  // Protected by default (no @Public()) -- the worked example the Express
  // boilerplate never had.
  @Get('me')
  @ResponseMessage('Current user')
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
