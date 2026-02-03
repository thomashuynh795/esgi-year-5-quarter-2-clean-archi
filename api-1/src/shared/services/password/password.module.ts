import { Module } from '@nestjs/common';
import { PasswordServiceImpl } from './infrastructure/password.service.impl';
import { PASSWORD_SERVICE } from './domain/password.service';

@Module({
    controllers: [],
    providers: [
        {
            provide: PASSWORD_SERVICE,
            useClass: PasswordServiceImpl,
        },
    ],
    exports: [
        {
            provide: PASSWORD_SERVICE,
            useClass: PasswordServiceImpl,
        },
    ],
})
export class PasswordModule { }
