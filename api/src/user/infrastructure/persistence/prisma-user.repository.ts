import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { User } from '../../domain/user.entity';
import { PrismaService } from '../../../database/infrastructure/prisma/prisma.service';
import { User as PrismaUser } from '@prisma/client';
import { UserRole } from '../../domain/enums/user-role.enum';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<User> {
    const payload = {
      email: user.email,
      roles: user.roles,
      vehicleType: user.vehicleType,
      passwordHash: user.passwordHash || '',
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
    };

    const prismaUser = user.id
      ? await this.prisma.user.update({
          where: { id: user.id },
          data: payload,
        })
      : await this.prisma.user.create({
          data: payload,
        });

    return this.toDomain(prismaUser);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toDomain(user) : null;
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map((u) => this.toDomain(u));
  }

  private toDomain(prismaUser: PrismaUser): User {
    return new User(
      prismaUser.id,
      prismaUser.email,
      prismaUser.roles as UserRole[],
      prismaUser.vehicleType,
      prismaUser.passwordHash,
      prismaUser.firstName || undefined,
      prismaUser.lastName || undefined,
      prismaUser.isActive,
    );
  }
}
