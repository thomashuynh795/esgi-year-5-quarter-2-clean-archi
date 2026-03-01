import { User } from '../../domain/user.entity';
import { UserRepository } from '../../domain/user.repository';

export class FindUserByEmailUseCase {
  public constructor(private readonly userRepository: UserRepository) {}

  public async execute(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
}
