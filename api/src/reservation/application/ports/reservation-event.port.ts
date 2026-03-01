export const RESERVATION_EVENT_PORT = Symbol('RESERVATION_EVENT_PORT');

export type ReservationEventPayload = Record<string, unknown> | null;

export interface ReservationEventPort {
  append(params: {
    reservationId: string;
    type: string;
    payload?: ReservationEventPayload;
    actorId?: string | null;
    createdAt?: Date;
  }): Promise<void>;
}
