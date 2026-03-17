import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainError } from '@domain/errors/domain.error';
import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponse {
  @ApiProperty({ type: String, example: '2024-10-16T12:34:56Z' })
  timestamp: string;

  @ApiProperty({ type: String, example: '/transactions' })
  path: string;

  @ApiProperty({ type: String, example: 'Internal server error' })
  message: string;

  @ApiProperty({ type: String, required: false, example: 'INVALID_TRANSACTION_STATUS' })
  errorCode?: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  data?: Record<string, unknown>;
}

interface ErrorDetails {
  status: HttpStatus;
  message: string;
  errorCode?: string;
  data?: Record<string, unknown>;
}

@Catch()
export class RestExceptionFilter implements ExceptionFilter {
  catch(error: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorDetails = this.getErrorDetails(error, request);

    response.status(errorDetails.status).json({
      timestamp: new Date().toISOString(),
      path: request.url,
      message: errorDetails.message,
      ...(errorDetails.errorCode && { errorCode: errorDetails.errorCode }),
      ...(errorDetails.data && { data: errorDetails.data }),
    });
  }

  private getErrorDetails(error: Error, request: Request): ErrorDetails {
    if (error instanceof DomainError) {
      console.warn(`[DomainError] ${error.errorCode}: ${error.message}`, error.data ?? '');
      return {
        status: HttpStatus.BAD_REQUEST,
        message: error.message,
        errorCode: error.errorCode,
        data: error.data,
      };
    }

    if (error instanceof HttpException) {
      const res = error.getResponse();
      const message = typeof res === 'object' && res !== null ? res['message'] : res;
      console.info(`[HttpException] ${error.getStatus()}: ${JSON.stringify(message)}`);
      return {
        status: error.getStatus(),
        message,
      };
    }

    console.error(`[UnhandledError] ${error.message}`, error.stack);
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }
}
