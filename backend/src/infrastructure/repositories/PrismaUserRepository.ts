import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { User, UserRole } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';

import prisma from '../database/prisma';

export class PrismaUserRepository implements UserRepository {
    private prisma: PrismaClient = prisma;

    constructor() {
    }

    async findByEmail(email: string): Promise<User | null> {
        const prismaUser = await this.prisma.user.findUnique({ where: { email } });
        return prismaUser ? this.mapToEntity(prismaUser) : null;
    }

    async findById(id: number): Promise<User | null> {
        const prismaUser = await this.prisma.user.findUnique({ where: { id } });
        return prismaUser ? this.mapToEntity(prismaUser) : null;
    }

    async findAll(): Promise<User[]> {
        const prismaUsers = await this.prisma.user.findMany();
        return prismaUsers.map(this.mapToEntity);
    }

    private mapToEntity(prismaUser: PrismaUser): User {
        return new User(
            prismaUser.id,
            prismaUser.email,
            prismaUser.role as UserRole
        );
    }
}
