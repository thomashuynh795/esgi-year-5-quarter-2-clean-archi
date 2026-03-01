import { Module } from '@nestjs/common';
import { ID_GENERATOR } from '../domain/id-generator';
import { IdGeneratorAdapter } from './id-generator.adapter';

@Module({
  providers: [
    {
      provide: ID_GENERATOR,
      useClass: IdGeneratorAdapter,
    },
  ],
  exports: [ID_GENERATOR],
})
export class IdModule {}
