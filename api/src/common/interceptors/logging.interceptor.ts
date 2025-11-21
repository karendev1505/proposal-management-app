import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Generate correlation ID if not present
    const correlationId = request.headers['x-correlation-id'] || uuidv4();
    request.correlationId = correlationId;
    response.setHeader('X-Correlation-ID', correlationId);

    const { method, url, ip, user } = request;
    const userAgent = request.get('user-agent') || '';
    const now = Date.now();

    // Log request
    this.logger.log(
      `[${correlationId}] ${method} ${url} - IP: ${ip} - User: ${user?.id || user?.userId || 'anonymous'}`,
    );

    return next.handle().pipe(
      tap((data) => {
        const delay = Date.now() - now;
        const statusCode = response.statusCode;

        // Log successful response
        this.logger.log(
          `[${correlationId}] ${method} ${url} ${statusCode} - ${delay}ms - User: ${user?.id || user?.userId || 'anonymous'}`,
        );
      }),
      catchError((error) => {
        const delay = Date.now() - now;
        const statusCode = error.status || 500;

        // Log error response
        const errorMessage = `[${correlationId}] ${method} ${url} ${statusCode} - ${delay}ms - Error: ${error.message} - User: ${user?.id || user?.userId || 'anonymous'}`;
        if (process.env.NODE_ENV === 'development' && error.stack) {
          this.logger.error(errorMessage + '\n' + error.stack);
        } else {
          this.logger.error(errorMessage);
        }

        throw error;
      }),
    );
  }
}
