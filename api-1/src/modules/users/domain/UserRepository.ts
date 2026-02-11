
import { User, UserRole } from './User';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface UserRepository {
    findByEmail(email: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    create(email: string, role: UserRole, password?: string): Promise<User>;
    findAll(): Promise<User[]>;
}
