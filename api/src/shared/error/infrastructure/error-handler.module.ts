import { Module } from '@nestjs/common';
import { ErrorHandlerService } from './error-handler.service';
import { HttpErrorFilter } from './http-exception.filter';

@Module({
  providers: [ErrorHandlerService, HttpErrorFilter],
  exports: [ErrorHandlerService, HttpErrorFilter],
})
export class ErrorHandlerModule {}
