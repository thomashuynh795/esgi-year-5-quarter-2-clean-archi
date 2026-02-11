
import { Module } from '@nestjs/common';
import { UsersService } from './application/Users.service';
import { PrismaUserRepository } from './infrastructure/PrismaUserRepository';
import { USER_REPOSITORY } from './domain/UserRepository';

@Module({
    providers: [
        UsersService,
        {
            provide: USER_REPOSITORY,
            useClass: PrismaUserRepository,
        },
    ],
    exports: [UsersService],
})
export class UsersModule { }
