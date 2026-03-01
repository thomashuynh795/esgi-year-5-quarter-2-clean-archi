import { User } from '../../domain/user.entity';
import { UserRepository } from '../../domain/user.repository';

export class FindUserByIdUseCase {
  public constructor(private readonly userRepository: UserRepository) {}

  public async execute(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }
}
