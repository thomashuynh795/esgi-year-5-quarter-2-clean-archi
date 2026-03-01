import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthPort } from '../../domain/ports/auth.port';
import * as passwordPort from '../../domain/ports/password.port';
import { PrismaService } from '../../../database/infrastructure/prisma/prisma.service';
import { BadRequestException } from '../../../shared/error/domain/bad-request.exception';
import { Token } from '../../domain/token';

@Injectable()
export class AuthAdapter implements AuthPort {
  public constructor(
    private readonly prismaService: PrismaService,
    @Inject(passwordPort.PASSWORD_PORT)
    private readonly passwordPort: passwordPort.PasswordPort,
    private readonly jwtService: JwtService,
  ) {}

  public async logIn(email: string, password: string): Promise<Token> {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      throw new BadRequestException('Invalid credentials');
    }

    if (
      !(await this.passwordPort.isPasswordCorrect(
        password,
        existingUser.passwordHash,
      ))
    ) {
      throw new BadRequestException('Invalid credentials');
    }

    return (await this.jwtService.signAsync({
      sub: existingUser.id,
    })) as Token;
  }
}
