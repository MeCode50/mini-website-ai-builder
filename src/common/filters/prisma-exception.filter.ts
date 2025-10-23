import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;

    switch (exception.code) {
      case 'P2002':
        status = HttpStatus.CONFLICT;
        message = 'A record with this information already exists';
        break;
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
        break;
      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        message = 'Foreign key constraint failed';
        break;
      case 'P2014':
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid ID provided';
        break;
      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Database operation failed';
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      prismaCode: exception.code,
    };

    this.logger.error(
      `Prisma error ${exception.code}: ${request.method} ${request.url}`,
      exception,
    );

    response.status(status).json(errorResponse);
  }
}
