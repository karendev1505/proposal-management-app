import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = (request as any).correlationId || 'unknown';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let details: any = undefined;

    // Handle HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exception.message;
      error = (exceptionResponse as any).error || exception.name;
    }
    // Handle Prisma errors
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'Database Error';
      
      switch (exception.code) {
        case 'P2002':
          message = `Unique constraint violation on field: ${exception.meta?.target}`;
          break;
        case 'P2025':
          message = 'Record not found';
          status = HttpStatus.NOT_FOUND;
          break;
        case 'P2003':
          message = `Foreign key constraint violation`;
          break;
        default:
          message = `Database error: ${exception.message}`;
      }
      
      details = {
        code: exception.code,
        meta: exception.meta,
      };
    }
    // Handle Prisma validation errors
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'Validation Error';
      message = 'Invalid data provided to database';
    }
    // Handle other errors
    else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
      
      // Log full error details in development
      if (process.env.NODE_ENV === 'development') {
        details = {
          stack: exception.stack,
        };
      }
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      correlationId,
      error,
      message: Array.isArray(message) ? message : [message],
      ...(details && { details }),
    };

    // Log error with full details
    const errorMessage = Array.isArray(message) ? message.join(', ') : message;
    const logMessage = `[${correlationId}] ${request.method} ${request.url} ${status} - ${error}: ${errorMessage} - User: ${(request as any).user?.id || (request as any).user?.userId || 'anonymous'} - IP: ${request.ip}`;
    
    if (process.env.NODE_ENV === 'development' && exception instanceof Error && exception.stack) {
      this.logger.error(logMessage + '\n' + exception.stack);
    } else {
      this.logger.error(logMessage);
    }

    response.status(status).json(errorResponse);
  }
}

