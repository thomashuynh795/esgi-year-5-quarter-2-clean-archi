import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';

@Injectable()
export class ErrorHandlerService {
    private readonly logger = new Logger(ErrorHandlerService.name);

    public getErrorForControllerLayer(error: any, res: Response): Response {
        this.logger.error('Exception caught in controller:', error);
        if (error?.stack) {
            this.logger.error(error.stack);
        }

        const { statusCode, message } = this.mapErrorToHttpResponse(error);
        return res.status(statusCode).json({ statusCode, message });
    }

    private mapErrorToHttpResponse(error: Error): { statusCode: number, message: string } {
        if (error instanceof HttpException) {
            const statusCode = error.getStatus();
            const errorResponse = error.getResponse();
            const message = typeof errorResponse === 'string'
                ? errorResponse
                : (errorResponse as Record<string, any>).message || 'An error occurred.';

            return { statusCode, message };
        }

        if (error instanceof PrismaClientKnownRequestError)
            return this.handlePrismaError(error);

        switch (error.name) {
            case 'NotFoundException':

                return {
                    statusCode: HttpStatus.NOT_FOUND,
                    message: error.message,
                };
            case 'BadRequestException':
                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: error.message,
                };
            case 'UnauthorizedException':
                return {
                    statusCode: HttpStatus.UNAUTHORIZED,
                    message: error.message,
                };
            case 'ForbiddenException':
                return {
                    statusCode: HttpStatus.FORBIDDEN,
                    message: error.message,
                };
            case 'ConflictException':
                return {
                    statusCode: HttpStatus.CONFLICT,
                    message: error.message,
                };
            case 'InternalServerErrorException':
                return {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: error.message,
                };
            case 'NullException':
                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: error.message,
                };
            default:
                return {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: error.message,
                };
        }
    }

    private handlePrismaError(error: PrismaClientKnownRequestError): { statusCode: HttpStatus, message: string } {
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
                message = `An unexpected Prisma error occurred (code: ${error.code}).`;
                break;
        }

        return { statusCode, message };
    }
}
