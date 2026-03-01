import { freezeDeeply } from '../../../shared/utils/freeze-deeply';

export const ReservationSlot = freezeDeeply({
  AM: 'AM',
  PM: 'PM',
} as const);

export type ReservationSlot =
  (typeof ReservationSlot)[keyof typeof ReservationSlot];
