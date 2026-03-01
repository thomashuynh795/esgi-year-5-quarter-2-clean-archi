import { UserRole } from './enums/user-role.enum';
import { VehicleType } from './enums/vehicle-type.enum';

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly roles: UserRole[],
    public readonly vehicleType: VehicleType,
    public readonly passwordHash?: string,
    public readonly firstName?: string,
    public readonly lastName?: string,
    public readonly isActive: boolean = true,
  ) {}
}
