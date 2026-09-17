import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { appConfig, jwtConfig } from './config/configuration';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './core/prisma/prisma.module';
import { pinoConfig } from './core/logger/logger.config';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig],
      validate: validateEnv,
    }),
    LoggerModule.forRoot(pinoConfig),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    HealthModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [
    // Every route requires a valid JWT unless @Public(); rate-limited first.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },

    // Every @Body()/@Query()/@Param() typed with a Zod DTO gets validated.
    { provide: APP_PIPE, useClass: ZodValidationPipe },

    // Order matters: ResponseInterceptor registered first = runs on the
    // OUTSIDE, so ZodSerializerInterceptor (inner) strips/validates the raw
    // controller return value before ResponseInterceptor wraps it into
    // { body, message }.
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },

    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
