import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ReservationSlot } from '../../../domain/enums/reservation-slot.enum';

export class CreateReservationRequestDto {
  @IsString()
  spotId!: string;

  @IsDateString()
  startDate!: string;

  @IsEnum(ReservationSlot)
  slot!: ReservationSlot;

  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @IsOptional()
  @IsBoolean()
  needsCharging?: boolean;
}
