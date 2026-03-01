import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/infrastructure/prisma/prisma.service';
import { User } from '../../../user/domain/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  public constructor(
    public readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET is missing');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  public async validate(payload: {
    sub: string;
  }): Promise<Partial<User> | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!prismaUser || !prismaUser.isActive) {
      throw new UnauthorizedException();
    }

    const user = {
      id: prismaUser.id,
      email: prismaUser.email,
      firstName: prismaUser.firstName ?? '',
      lastName: prismaUser.lastName ?? '',
    };

    return user;
  }
}
