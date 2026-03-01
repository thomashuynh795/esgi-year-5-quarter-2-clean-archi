import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { VehicleType } from '../../../domain/enums/vehicle-type.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IsEnum } from 'class-validator';

export class UpdateUserRequest {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles?: UserRole[];

  @IsOptional()
  @IsEnum(VehicleType)
  vehicleType?: VehicleType;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
