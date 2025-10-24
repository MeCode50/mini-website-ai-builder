import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class DetailedExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DetailedExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let error: string;
    let message: string;
    let details: any = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = this.getErrorType(status);
      } else {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || this.getErrorType(status);
        details = (exceptionResponse as any).details || {};
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      error = 'INTERNAL_SERVER_ERROR';
      message = 'An unexpected error occurred';
      details = {
        originalError: exception instanceof Error ? exception.message : 'Unknown error'
      };
    }

    // Add request context to details
    details.timestamp = new Date().toISOString();
    details.path = request.url;
    details.method = request.method;

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : exception,
    );

    // Send detailed error response
    response.status(status).json({
      statusCode: status,
      error,
      message,
      details,
    });
  }

  private getErrorType(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'VALIDATION_ERROR';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'RATE_LIMIT_EXCEEDED';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'INTERNAL_SERVER_ERROR';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'SERVICE_UNAVAILABLE';
      default:
        return 'UNKNOWN_ERROR';
    }
  }
}
