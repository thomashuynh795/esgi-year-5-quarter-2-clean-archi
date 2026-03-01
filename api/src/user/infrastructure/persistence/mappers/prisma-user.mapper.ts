import type { User as PrismaUser } from '@prisma/client';
import { User } from '../../../domain/user.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { VehicleType } from '../../../domain/enums/vehicle-type.enum';

export class PrismaUserMapper {
  static toDomain(prismaUser: PrismaUser): User {
    return new User(
      prismaUser.id,
      prismaUser.email,
      prismaUser.roles as UserRole[],
      prismaUser.vehicleType,
      prismaUser.passwordHash,
      prismaUser.firstName ?? undefined,
      prismaUser.lastName ?? undefined,
      prismaUser.isActive,
    );
  }

  static toPrismaUpdate(user: User): Partial<PrismaUser> {
    return {
      email: user.email,
      roles: user.roles,
      vehicleType: user.vehicleType,
      passwordHash: user.passwordHash ?? '',
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      isActive: user.isActive,
    };
  }

  static toPrismaCreate(user: User): Partial<PrismaUser> {
    return {
      email: user.email,
      roles: user.roles,
      vehicleType: user.vehicleType,
      passwordHash: user.passwordHash ?? '',
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      isActive: user.isActive,
    };
  }
}
