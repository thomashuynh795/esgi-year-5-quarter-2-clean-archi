import { Module } from '@nestjs/common';
import { IdGeneratorServiceImpl } from './infrastructure/id-generator.service.impl';
import { ID_GENERATOR_SERVICE } from './domain/id-generator.service';

@Module({
    providers: [
        {
            provide: ID_GENERATOR_SERVICE,
            useClass: IdGeneratorServiceImpl,
        },
    ],
    exports: [
        {
            provide: ID_GENERATOR_SERVICE,
            useClass: IdGeneratorServiceImpl,
        },
    ],
})
export class IdGeneratorModule { }
