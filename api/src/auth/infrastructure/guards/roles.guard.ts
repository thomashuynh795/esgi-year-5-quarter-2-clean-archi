import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../../database/infrastructure/prisma/prisma.service';
import { CustomizedExpressRequest } from '../../../shared/types/customized-express-request';
import { UserRole } from '../../../user/domain/enums/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<CustomizedExpressRequest>();
    const userId = request.user?.id;

    if (!userId) {
      return false;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { roles: true },
    });

    if (!user) {
      return false;
    }

    const userRoles = user.roles as unknown as UserRole[];
    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
