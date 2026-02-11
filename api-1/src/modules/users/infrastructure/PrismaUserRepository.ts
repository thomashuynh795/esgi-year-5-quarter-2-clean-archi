
import { Injectable } from '@nestjs/common';
import { User, UserRole } from '../domain/User';
import { UserRepository } from '../domain/UserRepository';
import { PrismaService } from '../../../shared/prisma/prisma.service';

@Injectable()
export class PrismaUserRepository implements UserRepository {
    constructor(private prisma: PrismaService) { }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        return user ? this.mapToEntity(user) : null;
    }

    async findById(id: number): Promise<User | null> {
        const user = await this.prisma.user.findUnique({ where: { id } });
        return user ? this.mapToEntity(user) : null;
    }

    async create(email: string, role: UserRole, password?: string): Promise<User> {
        const user = await this.prisma.user.create({
            data: {
                email,
                role,
                password: password || '',
            },
        });
        return this.mapToEntity(user);
    }

    async findAll(): Promise<User[]> {
        const users = await this.prisma.user.findMany();
        return users.map(this.mapToEntity);
    }

    private mapToEntity(prismaUser: any): User {
        return new User(
            prismaUser.id,
            prismaUser.email,
            prismaUser.role as UserRole,
            prismaUser.password,
        );
    }
}
