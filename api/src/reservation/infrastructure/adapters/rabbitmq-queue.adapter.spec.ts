import { ConfigService } from '@nestjs/config';
import { RabbitMQQueueAdapter } from './rabbitmq-queue.adapter';

describe('RabbitMQQueueAdapter', () => {
  it('publishes a durable JSON message to the configured reservation queue', async () => {
    const assertQueue = jest.fn().mockResolvedValue(undefined);
    const sendToQueue = jest.fn().mockReturnValue(true);
    const closeChannel = jest.fn().mockResolvedValue(undefined);
    const closeConnection = jest.fn().mockResolvedValue(undefined);
    const createChannel = jest.fn().mockResolvedValue({
      assertQueue,
      sendToQueue,
      close: closeChannel,
      on: jest.fn(),
    });
    const connect = jest.fn().mockResolvedValue({
      createChannel,
      close: closeConnection,
      on: jest.fn(),
    });

    class TestAdapter extends RabbitMQQueueAdapter {
      protected async loadAmqpModule() {
        return { connect };
      }
    }

    const adapter = new TestAdapter(
      new ConfigService({
        RABBITMQ_URL: 'amqp://parking:parking@localhost:5672',
        RABBITMQ_RESERVATION_CREATED_QUEUE: 'reservation-confirmation-email',
      }),
    );

    await adapter.publish('reservation.created', {
      reservationId: 'res-1',
      userId: 'user-1',
    });

    expect(connect).toHaveBeenCalledWith('amqp://parking:parking@localhost:5672');
    expect(assertQueue).toHaveBeenCalledWith('reservation-confirmation-email', {
      durable: true,
    });
    expect(sendToQueue).toHaveBeenCalledTimes(1);

    const [queueName, content, options] = sendToQueue.mock.calls[0] as [
      string,
      Buffer,
      Record<string, unknown>,
    ];

    expect(queueName).toBe('reservation-confirmation-email');
    expect(JSON.parse(content.toString('utf8'))).toMatchObject({
      eventType: 'reservation.created',
      payload: {
        reservationId: 'res-1',
        userId: 'user-1',
      },
    });
    expect(options).toMatchObject({
      persistent: true,
      contentType: 'application/json',
      contentEncoding: 'utf-8',
      type: 'reservation.created',
    });
  });

  it('reuses the same channel across multiple publishes', async () => {
    const channel = {
      assertQueue: jest.fn().mockResolvedValue(undefined),
      sendToQueue: jest.fn().mockReturnValue(true),
      close: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
    };
    const createChannel = jest.fn().mockResolvedValue(channel);
    const connect = jest.fn().mockResolvedValue({
      createChannel,
      close: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
    });

    class TestAdapter extends RabbitMQQueueAdapter {
      protected async loadAmqpModule() {
        return { connect };
      }
    }

    const adapter = new TestAdapter(new ConfigService({}));

    await adapter.publish('reservation.created', { reservationId: 'res-1' });
    await adapter.publish('reservation.created', { reservationId: 'res-2' });

    expect(connect).toHaveBeenCalledTimes(1);
    expect(createChannel).toHaveBeenCalledTimes(1);
    expect(channel.sendToQueue).toHaveBeenCalledTimes(2);
  });
});
