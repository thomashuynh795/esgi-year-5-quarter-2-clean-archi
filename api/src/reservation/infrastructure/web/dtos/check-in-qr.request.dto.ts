import { IsISO8601, IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ReservationSlot } from '../../../domain/enums/reservation-slot.enum';

export class CheckInQrRequestDto {
  @IsString()
  @IsNotEmpty()
  spotId!: string;

  @IsISO8601()
  date!: string;

  @IsEnum(ReservationSlot)
  slot!: ReservationSlot;
}
