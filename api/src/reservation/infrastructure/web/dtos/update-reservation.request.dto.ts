import { IsBoolean, IsISO8601, IsOptional, IsString } from 'class-validator';
import { ReservationSlot } from '../../../domain/enums/reservation-slot.enum';
import { IsEnum } from 'class-validator';

export class UpdateReservationRequestDto {
  @IsOptional()
  @IsString()
  spotId?: string;

  @IsOptional()
  @IsISO8601()
  date?: string;

  @IsOptional()
  @IsEnum(ReservationSlot)
  slot?: ReservationSlot;

  @IsOptional()
  @IsBoolean()
  needsCharging?: boolean;
}
