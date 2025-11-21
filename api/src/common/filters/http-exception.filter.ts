import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const correlationId = (request as any).correlationId || 'unknown';

    const exceptionResponse = exception.getResponse();
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || exception.message;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      correlationId,
      message: Array.isArray(message) ? message : [message],
      ...(typeof exceptionResponse === 'object' &&
        !(exceptionResponse instanceof String) && {
          error: (exceptionResponse as any).error,
        }),
    };

    // Log error details
    const errorMessage = Array.isArray(message) ? message.join(', ') : message;
    this.logger.error(
      `[${correlationId}] ${request.method} ${request.url} ${status} - ${errorMessage} - User: ${(request as any).user?.id || (request as any).user?.userId || 'anonymous'} - IP: ${request.ip}`,
    );

    response.status(status).json(errorResponse);
  }
}
