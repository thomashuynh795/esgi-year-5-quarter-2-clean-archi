import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { Response } from 'express';

type HttpMappedError = { statusCode: number; message: string };

@Injectable()
export class ErrorHandlerService {
  public getErrorForControllerLayer(error: unknown, res: Response): Response {
    const { statusCode, message } = this.mapErrorToHttpResponse(error);
    return res.status(statusCode).json({ statusCode, message });
  }

  private mapErrorToHttpResponse(error: unknown): HttpMappedError {
    if (error instanceof HttpException) {
      const statusCode = error.getStatus();
      const message = this.extractHttpExceptionMessage(error);
      return { statusCode, message };
    }

    if (this.isPrismaKnownRequestError(error)) {
      return this.handlePrismaError(error);
    }

    const err = this.normalizeError(error);

    switch (err.name) {
      case 'NotFoundException':
        return { statusCode: HttpStatus.NOT_FOUND, message: err.message };
      case 'BadRequestException':
        return { statusCode: HttpStatus.BAD_REQUEST, message: err.message };
      case 'UnauthorizedException':
        return { statusCode: HttpStatus.UNAUTHORIZED, message: err.message };
      case 'ForbiddenException':
        return { statusCode: HttpStatus.FORBIDDEN, message: err.message };
      case 'ConflictException':
        return { statusCode: HttpStatus.CONFLICT, message: err.message };
      case 'InternalServerErrorException':
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: this.safeInternalMessage(err),
        };
      case 'NullException':
        return { statusCode: HttpStatus.BAD_REQUEST, message: err.message };
      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: this.safeInternalMessage(err),
        };
    }
  }

  private extractHttpExceptionMessage(exception: HttpException): string {
    const response = exception.getResponse();

    if (typeof response === 'string') return response;

    if (this.isObjectRecord(response)) {
      const msg = response['message'];

      if (typeof msg === 'string') return msg;

      if (Array.isArray(msg) && msg.every((x) => typeof x === 'string')) {
        return msg.join(', ');
      }
    }

    return exception.message || 'An error occurred.';
  }

  private normalizeError(error: unknown): Error {
    if (error instanceof Error) return error;

    if (typeof error === 'string') return new Error(error);

    if (this.isObjectRecord(error)) {
      const message = error['message'];
      const name = error['name'];

      if (typeof message === 'string') {
        const e = new Error(message);
        if (typeof name === 'string') e.name = name;
        return e;
      }

      try {
        return new Error(JSON.stringify(error));
      } catch {
        return new Error('Unknown error');
      }
    }

    return new Error('Unknown error');
  }

  private safeInternalMessage(err: Error): string {
    if (process.env.NODE_ENV === 'production') return 'Internal server error';
    return err.message || 'Internal server error';
  }

  private isPrismaKnownRequestError(
    error: unknown,
  ): error is PrismaClientKnownRequestError {
    if (!this.isObjectRecord(error)) return false;

    const code = error['code'];
    const clientVersion = error['clientVersion'];

    return typeof code === 'string' && typeof clientVersion === 'string';
  }

  private handlePrismaError(error: PrismaClientKnownRequestError): {
    statusCode: HttpStatus;
    message: string;
  } {
    let statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred.';

    switch (error.code) {
      case 'P2000':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'The provided value is too long for this field.';
        break;
      case 'P2001':
        statusCode = HttpStatus.NOT_FOUND;
        message = 'The record you are looking for does not exist.';
        break;
      case 'P2002':
        statusCode = HttpStatus.CONFLICT;
        message = 'A unique constraint violation occurred.';
        break;
      case 'P2003':
        statusCode = HttpStatus.CONFLICT;
        message = 'A foreign key constraint violation occurred.';
        break;
      case 'P2004':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'A database constraint has been violated.';
        break;
      case 'P2005':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'The provided value is invalid for this field.';
        break;
      case 'P2006':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'The provided value is invalid.';
        break;
      case 'P2007':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Data validation error.';
        break;
      case 'P2008':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Failed to parse the query.';
        break;
      case 'P2009':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Failed to validate the query.';
        break;
      case 'P2010':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Raw query failed.';
        break;
      case 'P2011':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Null constraint violation.';
        break;
      case 'P2012':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Missing a required value.';
        break;
      case 'P2013':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Missing the required argument.';
        break;
      case 'P2014':
        statusCode = HttpStatus.CONFLICT;
        message =
          'The change you are trying to make would violate a required relation.';
        break;
      case 'P2015':
        statusCode = HttpStatus.NOT_FOUND;
        message = 'A related record could not be found.';
        break;
      case 'P2016':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Query interpretation error.';
        break;
      case 'P2017':
        statusCode = HttpStatus.CONFLICT;
        message = 'The records for this relation could not be connected.';
        break;
      case 'P2018':
        statusCode = HttpStatus.NOT_FOUND;
        message = 'The required connected records were not found.';
        break;
      case 'P2019':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Input error.';
        break;
      case 'P2020':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Value out of range for the type.';
        break;
      case 'P2021':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'The table does not exist in the current database.';
        break;
      case 'P2022':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'The column does not exist in the current database.';
        break;
      case 'P2023':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Inconsistent column data.';
        break;
      case 'P2024':
        statusCode = HttpStatus.REQUEST_TIMEOUT;
        message = 'The database operation timed out.';
        break;
      case 'P2025':
        statusCode = HttpStatus.NOT_FOUND;
        message = 'The requested resource does not exist.';
        break;
      case 'P2026':
        statusCode = HttpStatus.NOT_IMPLEMENTED;
        message =
          'This feature is not supported by the current database provider.';
        break;
      default:
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        message =
          process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : `An unexpected Prisma error occurred (code: ${error.code}).`;
        break;
    }

    return { statusCode, message };
  }

  private isObjectRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
