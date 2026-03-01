import { UserRepository } from '../../user/domain/user.repository';
import { NotFoundException } from '../../shared/error/domain/not-found.exception';
import { UserRole } from '../../user/domain/enums/user-role.enum';

export class GetRoleFromUserIdUseCase {
  public constructor(private readonly userRepository: UserRepository) {}

  public async execute(userId: string): Promise<UserRole[]> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.roles;
  }
}
