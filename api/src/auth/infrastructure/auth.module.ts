import { Module } from '@nestjs/common';
import { AuthController } from './web/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { LogInUseCase } from '../application/log-in.usecase';
import { AuthAdapter } from './adapters/auth.adapter';
import { GetRoleFromUserIdUseCase } from '../application/get-role-from-user-id.usecase';
import { AUTH_PORT, AuthPort } from '../domain/ports/auth.port';
import { PrismaUserRepository } from '../../user/infrastructure/persistence/prisma-user.repository';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../../user/domain/user.repository';
import { PrismaService } from '../../database/infrastructure/prisma/prisma.service';
import { PASSWORD_PORT } from '../domain/ports/password.port';
import { Argon2PasswordAdapter } from './adapters/argon2-password.adapter';
import { ErrorHandlerModule } from '../../shared/error/infrastructure/error-handler.module';
import { UserModule } from '../../user/infrastructure/user.module';

@Module({
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    PrismaService,
    {
      provide: PASSWORD_PORT,
      useClass: Argon2PasswordAdapter,
    },
    {
      provide: AUTH_PORT,
      useClass: AuthAdapter,
    },
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: LogInUseCase,
      useFactory: (authRepository: AuthPort) =>
        new LogInUseCase(authRepository),
      inject: [AUTH_PORT],
    },
    {
      provide: GetRoleFromUserIdUseCase,
      useFactory: (userRepository: UserRepository) =>
        new GetRoleFromUserIdUseCase(userRepository),
      inject: [USER_REPOSITORY],
    },
  ],
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '100y' },
      }),
    }),
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ErrorHandlerModule,
  ],
  exports: [PassportModule],
})
export class AuthModule {}
