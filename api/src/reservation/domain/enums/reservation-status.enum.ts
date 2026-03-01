import { freezeDeeply } from '../../../shared/utils/freeze-deeply';

export const ReservationStatus = freezeDeeply({
  Booked: 'BOOKED',
  CheckedIn: 'CHECKED_IN',
  Cancelled: 'CANCELLED',
  NoShow: 'NO_SHOW',
  Released: 'RELEASED',
} as const);

export type ReservationStatus =
  (typeof ReservationStatus)[keyof typeof ReservationStatus];
