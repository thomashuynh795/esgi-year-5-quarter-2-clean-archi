import { UserRole } from '../../domain/enums/user-role.enum';
import { VehicleType } from '../../domain/enums/vehicle-type.enum';
import { User } from '../../domain/user.entity';
import { UserRepository } from '../../domain/user.repository';

export class CreateEmployeeUseCase {
  public constructor(private readonly userRepository: UserRepository) {}

  public async execute(
    email: string,
    firstName?: string,
    lastName?: string,
    vehicleType: VehicleType = VehicleType.None,
  ): Promise<User> {
    const newUser = new User(
      '',
      email,
      [UserRole.Employee],
      vehicleType,
      undefined,
      firstName,
      lastName,
    );
    return this.userRepository.save(newUser);
  }
}
