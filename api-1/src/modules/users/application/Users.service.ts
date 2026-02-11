
import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { User, UserRole } from '../domain/User';
import { UserRepository, USER_REPOSITORY } from '../domain/UserRepository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @Inject(USER_REPOSITORY) private userRepository: UserRepository,
    ) { }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findByEmail(email);
    }

    async findById(id: number): Promise<User | null> {
        return this.userRepository.findById(id);
    }

    async create(email: string, role: UserRole, password?: string): Promise<User> {
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
        return this.userRepository.create(email, role, hashedPassword);
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.findAll();
    }
}
