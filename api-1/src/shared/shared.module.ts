import { Global, Module } from '@nestjs/common';
import { ErrorHandlerService } from './error-handler/error-handler.service';
import { DateService } from './date/date.service';
import { StringService } from './string/string.service';
import { MailModule } from './services/mail/mail.module';
import { PasswordModule } from './services/password/password.module';
import { IdGeneratorModule } from './services/id-generator/id-generator.module';
import { IdGeneratorServiceImpl } from './services/id-generator/infrastructure/id-generator.service.impl';
import { ID_GENERATOR_SERVICE } from './services/id-generator/domain/id-generator.service';

@Global()
@Module({
    providers: [
        ErrorHandlerService,
        DateService,
        StringService,
        {
            provide: ID_GENERATOR_SERVICE,
            useClass: IdGeneratorServiceImpl,
        },
    ],
    exports: [
        ErrorHandlerService,
        DateService,
        StringService,
        {
            provide: ID_GENERATOR_SERVICE,
            useClass: IdGeneratorServiceImpl,
        },
    ],
    imports: [PasswordModule, MailModule, IdGeneratorModule],
})
export class SharedModule { }
