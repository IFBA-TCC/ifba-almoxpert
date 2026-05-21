import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request  = ctx.getRequest<Request>();
    const status   = exception.getStatus();
    const body     = exception.getResponse();

    response.status(status).json({
      statusCode: status,
      timestamp:  new Date().toISOString(),
      path:       request.url,
      message:
        typeof body === 'object' && 'message' in (body as object)
          ? (body as any).message
          : body,
    });
  }
}
