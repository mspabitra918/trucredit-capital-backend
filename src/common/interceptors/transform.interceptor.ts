import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const httpCtx = context.switchToHttp();
    const response = httpCtx.getResponse();

    return next.handle().pipe(
      map((payload: any) => {
        const message =
          payload && typeof payload === 'object' && 'message' in payload
            ? payload.message
            : 'Success';
        const data =
          payload && typeof payload === 'object' && 'data' in payload
            ? payload.data
            : payload;

        return {
          success: true,
          statusCode: response.statusCode,
          message,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
