import {
  Injectable,
  Logger,
  OnModuleDestroy,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { QueuePort } from '../../application/ports/queue.port';

type AmqpChannelLike = {
  assertQueue(queue: string, options?: { durable?: boolean }): Promise<unknown>;
  sendToQueue(
    queue: string,
    content: Buffer,
    options?: {
      persistent?: boolean;
      contentType?: string;
      contentEncoding?: string;
      timestamp?: number;
      type?: string;
    },
  ): boolean;
  close(): Promise<void>;
  on?(event: string, listener: (...args: unknown[]) => void): void;
};

type AmqpConnectionLike = {
  createChannel(): Promise<AmqpChannelLike>;
  close(): Promise<void>;
  on?(event: string, listener: (...args: unknown[]) => void): void;
};

type AmqpModuleLike = {
  connect(url: string): Promise<AmqpConnectionLike>;
};

@Injectable()
export class RabbitMQQueueAdapter implements QueuePort, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQQueueAdapter.name);
  private connection: AmqpConnectionLike | null = null;
  private channel: AmqpChannelLike | null = null;
  private channelPromise: Promise<AmqpChannelLike> | null = null;

  public constructor(private readonly configService: ConfigService) {}

  public async publish(topic: string, payload: unknown): Promise<void> {
    const queueName = this.resolveQueueName(topic);
    const channel = await this.getChannel();
    const content = Buffer.from(
      JSON.stringify({
        eventType: topic,
        occurredAt: new Date().toISOString(),
        payload,
      }),
      'utf8',
    );

    try {
      await channel.assertQueue(queueName, { durable: true });
      channel.sendToQueue(queueName, content, {
        persistent: true,
        contentType: 'application/json',
        contentEncoding: 'utf-8',
        timestamp: Date.now(),
        type: topic,
      });
      this.logger.log(`Published event "${topic}" to queue "${queueName}".`);
    } catch (error) {
      await this.resetChannel();
      throw error;
    }
  }

  public async onModuleDestroy(): Promise<void> {
    await this.resetChannel();
  }

  protected async loadAmqpModule(): Promise<AmqpModuleLike> {
    const moduleName = 'amqplib';
    return (await import(moduleName)) as AmqpModuleLike;
  }

  private async getChannel(): Promise<AmqpChannelLike> {
    if (this.channel) {
      return this.channel;
    }

    if (this.channelPromise) {
      return this.channelPromise;
    }

    this.channelPromise = this.createChannel();

    try {
      const channel = await this.channelPromise;
      this.channel = channel;
      return channel;
    } finally {
      this.channelPromise = null;
    }
  }

  private async createChannel(): Promise<AmqpChannelLike> {
    const rabbitMqUrl =
      this.configService.get<string>('RABBITMQ_URL') ??
      'amqp://guest:guest@localhost:5672';

    try {
      const amqp = await this.loadAmqpModule();
      const connection = await amqp.connect(rabbitMqUrl);
      const channel = await connection.createChannel();

      this.connection = connection;
      this.registerConnectionListeners(connection);
      this.registerChannelListeners(channel);

      return channel;
    } catch (error) {
      this.logger.error(
        `Unable to connect to RabbitMQ at ${rabbitMqUrl}.`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new ServiceUnavailableException(
        'RabbitMQ is unavailable. Reservation events could not be published.',
      );
    }
  }

  private registerConnectionListeners(connection: AmqpConnectionLike): void {
    connection.on?.('error', (error: unknown) => {
      this.logger.error(
        'RabbitMQ connection error.',
        error instanceof Error ? error.stack : undefined,
      );
    });

    connection.on?.('close', () => {
      this.logger.warn(
        'RabbitMQ connection closed. The next publish will reconnect.',
      );
      this.connection = null;
      this.channel = null;
    });
  }

  private registerChannelListeners(channel: AmqpChannelLike): void {
    channel.on?.('error', (error: unknown) => {
      this.logger.error(
        'RabbitMQ channel error.',
        error instanceof Error ? error.stack : undefined,
      );
    });

    channel.on?.('close', () => {
      this.logger.warn(
        'RabbitMQ channel closed. The next publish will reconnect.',
      );
      this.channel = null;
    });
  }

  private resolveQueueName(topic: string): string {
    if (topic === 'reservation.created') {
      return (
        this.configService.get<string>('RABBITMQ_RESERVATION_CREATED_QUEUE') ??
        this.withPrefix(topic)
      );
    }

    return this.withPrefix(topic);
  }

  private withPrefix(queueName: string): string {
    const prefix =
      this.configService.get<string>('RABBITMQ_QUEUE_PREFIX') ?? '';
    return `${prefix}${queueName}`;
  }

  private async resetChannel(): Promise<void> {
    const channel = this.channel;
    const connection = this.connection;

    this.channel = null;
    this.connection = null;
    this.channelPromise = null;

    if (channel) {
      try {
        await channel.close();
      } catch {
        this.logger.warn('Failed to close RabbitMQ channel cleanly.');
      }
    }

    if (connection) {
      try {
        await connection.close();
      } catch {
        this.logger.warn('Failed to close RabbitMQ connection cleanly.');
      }
    }
  }
}
