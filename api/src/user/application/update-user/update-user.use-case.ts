import { BadRequestException } from '../../../shared/error/domain/bad-request.exception';
import { NotFoundException } from '../../../shared/error/domain/not-found.exception';
import { UserRole } from '../../domain/enums/user-role.enum';
import { VehicleType } from '../../domain/enums/vehicle-type.enum';
import { User } from '../../domain/user.entity';
import { UserRepository } from '../../domain/user.repository';

export class UpdateUserUseCase {
  public constructor(private readonly userRepository: UserRepository) {}

  public async execute(params: {
    actorId: string;
    userId: string;
    firstName?: string;
    lastName?: string;
    roles?: UserRole[];
    vehicleType?: VehicleType;
    isActive?: boolean;
  }): Promise<User> {
    const actor = await this.userRepository.findById(params.actorId);

    if (!actor) {
      throw new NotFoundException('Actor user not found.');
    }

    const isAdmin = actor.roles.some(
      (r) => r === UserRole.Manager || r === UserRole.Secretary,
    );
    if (!isAdmin) {
      throw new BadRequestException(
        'Only managers/secretaries can manage users.',
      );
    }

    const existing = await this.userRepository.findById(params.userId);
    if (!existing) {
      throw new NotFoundException('User not found.');
    }

    const updated = new User(
      existing.id,
      existing.email,
      params.roles ?? existing.roles,
      params.vehicleType ?? existing.vehicleType,
      existing.passwordHash,
      params.firstName ?? existing.firstName,
      params.lastName ?? existing.lastName,
      params.isActive ?? existing.isActive,
    );

    return this.userRepository.save(updated);
  }
}
