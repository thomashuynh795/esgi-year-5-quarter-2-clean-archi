import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorHandlerService } from './error-handler.service';

@Catch()
@Injectable()
export class HttpErrorFilter implements ExceptionFilter {
  constructor(private readonly errorHandler: ErrorHandlerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    this.errorHandler.getErrorForControllerLayer(exception, res);
  }
}
