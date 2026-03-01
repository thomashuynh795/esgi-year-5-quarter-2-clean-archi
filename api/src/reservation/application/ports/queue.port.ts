export const QUEUE_PORT = Symbol('QUEUE_PORT');

export interface QueuePort {
  publish(topic: string, payload: unknown): Promise<void>;
}
