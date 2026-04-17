import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    try {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();

      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;

      let message: string | string[] = 'Internal server error';
      let errorName = 'InternalServerError';

      if (exception instanceof HttpException) {
        const res = exception.getResponse();
        if (typeof res === 'string') {
          message = res;
        } else if (typeof res === 'object' && res !== null) {
          const r = res as any;
          message = r.message ?? exception.message;
          errorName = r.error ?? exception.name;
        }
      } else if (exception instanceof Error) {
        message = exception.message;
        errorName = exception.name;
      }

      this.logger.error(
        `${request.method} ${request.url} -> ${status} ${JSON.stringify(message)}`,
      );

      response.status(status).json({
        success: false,
        statusCode: status,
        error: errorName,
        message,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      this.logger.error('Error inside HttpExceptionFilter', err as any);
    }
  }
}
