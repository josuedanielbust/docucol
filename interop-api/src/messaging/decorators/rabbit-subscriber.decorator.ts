import { applyDecorators, SetMetadata } from '@nestjs/common';
import { MessagePattern, Transport } from '@nestjs/microservices';
import { RABBIT_SUBSCRIBER_METADATA } from '../constants';

export interface RabbitSubscriberOptions {
  pattern: string;
  queue?: string;
  exchange?: string;
}

/**
 * Decorator for RabbitMQ subscribers
 * @param options Subscriber options including message pattern
 * @deprecated Use @MessagePattern with Transport.RMQ directly for new code
 */
export const RabbitSubscriber = (options: RabbitSubscriberOptions) => {
  return applyDecorators(
    SetMetadata(RABBIT_SUBSCRIBER_METADATA, options),
    MessagePattern(options.pattern, Transport.RMQ)
  );
};
