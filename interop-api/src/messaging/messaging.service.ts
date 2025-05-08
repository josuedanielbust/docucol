import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { RABBIT_PROVIDER, RABBIT_EXCHANGE } from './constants';

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    @Inject(RABBIT_PROVIDER) private readonly client: ClientProxy,
  ) {}

  async publish<T = any>(pattern: string, data: T): Promise<void> {
    try {
      this.logger.log(`Publishing message to ${pattern}`);
      await lastValueFrom(this.client.emit<any>(pattern, data));
      this.logger.log(`Message published to ${pattern}`);
    } catch (error) {
      this.logger.error(`Failed to publish message to ${pattern}`, error);
      throw error;
    }
  }

  async publishToExchange<T = any>(routingKey: string, data: T): Promise<void> {
    return this.publish(`${RABBIT_EXCHANGE}.${routingKey}`, data);
  }

  getClient(): ClientProxy {
    return this.client;
  }
}
