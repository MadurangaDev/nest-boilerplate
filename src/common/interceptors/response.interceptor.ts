import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';

export interface WrappedResponse<T> {
  body: T;
  message: string;
}

// Registered BEFORE ZodSerializerInterceptor in AppModule's providers array,
// so it runs on the OUTSIDE: ZodSerializerInterceptor validates/strips the raw
// DTO first, then this wraps the already-clean value into { body, message }.
// Same response shape as the express-boilerplate's createResponse(), just
// applied once, globally, instead of called by hand in every controller.
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, WrappedResponse<T>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<WrappedResponse<T>> {
    const message =
      this.reflector.get<string>(RESPONSE_MESSAGE_KEY, context.getHandler()) ?? 'Success';

    return next.handle().pipe(map((body) => ({ body, message })));
  }
}
