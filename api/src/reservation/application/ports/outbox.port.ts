export const OUTBOX_PORT = Symbol('OUTBOX_PORT');

export type OutboxEventToCreate = {
  type: string;
  payload: unknown;
};

export type OutboxEvent = {
  id: string;
  type: string;
  payload: unknown;
  createdAt: Date;
  processedAt: Date | null;
};

export interface OutboxPort {
  add(event: OutboxEventToCreate): Promise<void>;

  findPending(params: { limit: number }): Promise<OutboxEvent[]>;

  markProcessed(eventId: string, processedAt: Date): Promise<void>;
}
