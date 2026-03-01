import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/infrastructure/database.module';
import { UserController } from './web/user.controller';
import { PrismaUserRepository } from './persistence/prisma-user.repository';
import { USER_REPOSITORY, UserRepository } from '../domain/user.repository';
import { CreateEmployeeUseCase } from '../application/create-employee/create-employe.use-case';
import { FindUserByIdUseCase } from '../application/find-by-id/find-by-id.use-case';
import { FindAllEmployeesUseCase } from '../application/find-all-employees/find-all-employees.use-case';
import { FindUserByEmailUseCase } from '../application/find-by-email/find-by-email.use-case';
import { UpdateUserUseCase } from '../application/update-user/update-user.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: CreateEmployeeUseCase,
      useFactory: (userRepository: UserRepository) =>
        new CreateEmployeeUseCase(userRepository),
      inject: [USER_REPOSITORY],
    },
    {
      provide: FindAllEmployeesUseCase,
      useFactory: (userRepository: UserRepository) =>
        new FindAllEmployeesUseCase(userRepository),
      inject: [USER_REPOSITORY],
    },
    {
      provide: FindUserByIdUseCase,
      useFactory: (userRepository: UserRepository) =>
        new FindUserByIdUseCase(userRepository),
      inject: [USER_REPOSITORY],
    },
    {
      provide: FindUserByEmailUseCase,
      useFactory: (userRepository: UserRepository) =>
        new FindUserByEmailUseCase(userRepository),
      inject: [USER_REPOSITORY],
    },
    {
      provide: UpdateUserUseCase,
      useFactory: (userRepository: UserRepository) =>
        new UpdateUserUseCase(userRepository),
      inject: [USER_REPOSITORY],
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
