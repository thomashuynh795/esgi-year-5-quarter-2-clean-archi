export const QUEUE_PORT = Symbol('QUEUE_PORT');

export interface QueuePort {
  publishReservationCreated(reservationId: string, payload: any): void;
}
