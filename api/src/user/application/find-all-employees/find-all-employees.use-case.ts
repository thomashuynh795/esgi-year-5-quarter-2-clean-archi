import { User } from '../../domain/user.entity';
import { UserRepository } from '../../domain/user.repository';

export class FindAllEmployeesUseCase {
  public constructor(private readonly userRepository: UserRepository) {}

  public async execute(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
