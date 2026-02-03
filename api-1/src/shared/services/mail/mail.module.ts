import { Module } from '@nestjs/common';
import { MailServiceImpl } from './infrastructure/mail.service.impl';
import { MAIL_SERVICE } from './domain/mail.service';

@Module({
    controllers: [],
    providers: [
        {
            provide: MAIL_SERVICE,
            useClass: MailServiceImpl,
        },
    ],
})
export class MailModule { }
