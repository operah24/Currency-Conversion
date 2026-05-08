import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorators';

export interface ResponseFormat<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ResponseFormat<T>
> {
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseFormat<T>> {
    const handler = context.getHandler();
    const customMessage = this.reflector.get<string>(
      RESPONSE_MESSAGE_KEY,
      handler,
    );

    return next.handle().pipe(
      map((data) => {
        // If controller already returned a custom response, keep it
        if (data && data.success !== undefined) return data;

        return {
          success: true,
          message: customMessage || 'Request successful',
          data,
        };
      }),
    );
  }
}
