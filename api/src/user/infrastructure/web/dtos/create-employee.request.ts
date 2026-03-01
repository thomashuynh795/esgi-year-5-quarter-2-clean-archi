import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { VehicleType } from '../../../domain/enums/vehicle-type.enum';

export class CreateEmployeeRequest {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  vehicleType!: VehicleType;
}
