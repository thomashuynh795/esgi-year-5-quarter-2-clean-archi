import { ReservationSlot } from '../../domain/enums/reservation-slot.enum';

export type DailySlotHistory = {
  date: string;
  slot: ReservationSlot;
  usedSpotIds: string[];
  freeSpotIds: string[];
};

export type GetReservationHistoryResult = DailySlotHistory[];
