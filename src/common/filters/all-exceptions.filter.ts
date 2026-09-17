import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';
import { ZodSerializationException, ZodValidationException } from 'nestjs-zod';
import type { ZodError } from 'zod';
import type { WrappedResponse } from '../interceptors/response.interceptor';

// The one place HTTP errors get shaped -- same job as the express-boilerplate's
// single errorHandler + AppError, but now enforcing the exact same envelope
// ResponseInterceptor uses on the success path: { body, message }. Nothing
// else, anywhere in this app, is allowed to return a different shape.
// Status is carried by the HTTP status code alone, never duplicated in the body.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const { status, body } = this.resolve(exception);
    response.status(status).json(body);
  }

  private resolve(exception: unknown): { status: number; body: WrappedResponse<unknown> } {
    // A controller returned data that doesn't match its own response DTO --
    // a bug in the code, not something the caller can fix or needs to see.
    if (exception instanceof ZodSerializationException) {
      const serializationError = exception.getZodError() as ZodError;
      this.logger.error(`Response failed schema validation: ${serializationError.message}`);
      return this.internalError();
    }

    // Bad request body / query / params.
    if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError() as ZodError;
      return {
        status: HttpStatus.BAD_REQUEST,
        body: {
          message: 'Validation failed',
          data: {
            errors: zodError.issues.map((issue) => ({
              path: issue.path.join('.'),
              message: issue.message,
            })),
          },
        },
      };
    }

    // Constraint violations from the database, surfaced by Prisma. Without
    // this, a duplicate email or a dangling foreign key fell through to a
    // bare 500 -- correct in the sense that it's an error, useless in the
    // sense that neither the client nor the logs said what actually broke.
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.resolvePrismaError(exception);
    }

    // Guards, NotFoundException, anything thrown deliberately with @nestjs/common.
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      const message =
        typeof payload === 'string' ? payload : (payload as { message?: string }).message;
      return { status, body: { message: message ?? exception.message, data: null } };
    }

    // Truly unexpected -- log the real thing, tell the client nothing about it.
    this.logger.error(exception instanceof Error ? exception.stack : exception);
    return this.internalError();
  }

  private resolvePrismaError(exception: Prisma.PrismaClientKnownRequestError): {
    status: number;
    body: WrappedResponse<unknown>;
  } {
    switch (exception.code) {
      case 'P2002': {
        // Unique constraint failed.
        const target = (exception.meta?.target as string[] | undefined)?.join(', ');
        return {
          status: HttpStatus.CONFLICT,
          body: { message: target ? `${target} already in use` : 'Duplicate value', data: null },
        };
      }
      case 'P2025':
        // Record required for the operation (update/delete) wasn't found.
        return {
          status: HttpStatus.NOT_FOUND,
          body: { message: 'Record not found', data: null },
        };
      case 'P2003':
        // Foreign key constraint failed -- the caller referenced something
        // that doesn't exist.
        return {
          status: HttpStatus.BAD_REQUEST,
          body: { message: 'Referenced record does not exist', data: null },
        };
      default:
        this.logger.error(`Unhandled Prisma error ${exception.code}: ${exception.message}`);
        return this.internalError();
    }
  }

  private internalError(): { status: number; body: WrappedResponse<unknown> } {
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: { message: 'Internal server error', data: null },
    };
  }
}
