import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { InitiateTransferEvent, CompleteTransferEvent } from './events/transfer.event';
import { ConfigService } from '@nestjs/config';
import * as amqplib from 'amqplib';
import { Channel, ChannelModel } from 'amqplib';

@Injectable()
export class MessagingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MessagingService.name);
  
  constructor(
    private readonly configService: ConfigService,
  ) {}

  private connection!: ChannelModel;
  private channel!: Channel;
  private queueName!: string;

  async onModuleInit() {
    try {
      this.queueName = this.configService.get('RABBITMQ_QUEUE') || 'documents_queue';
      this.connection = await amqplib.connect(this.configService.get('RABBITMQ_URL') || 'amqp://localhost');
      this.channel = await this.connection.createChannel();
      
      // Setup queue with durability
      await this.channel.assertQueue(this.queueName, { durable: true });
      
      this.logger.log('RabbitMQ connection established successfully');
    } catch (error) {
      this.logger.error('RabbitMQ connection failed:', error);
    }
  }

  async onModuleDestroy() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      this.logger.log('RabbitMQ connection closed successfully');
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connections:', error);
    }
  }

  async publishInitiateTransferEvent(userId: string, routingTopic = 'document.transfer.request'): Promise<void> {
    try {
      const event = new InitiateTransferEvent(
        userId,
        new Date().toISOString(),
        'INITIATE_TRANSFER',
        routingTopic  // Store the provided topic in the event
      );
      
      // Send directly to queue
      await this.channel.sendToQueue(
        this.queueName,
        Buffer.from(JSON.stringify(event)),
        { persistent: true }
      );
      
      this.logger.log(`Published InitiateTransferEvent to queue ${this.queueName} for user ${userId}`);
    } catch (error) {
      this.logger.error('Error publishing event:', error);
      throw error;
    }
  }

  async publishCompleteTransferEvent(userId: string, routingTopic = 'document.transfer.confirmation'): Promise<void> {
    try {
      const event = new CompleteTransferEvent(
        userId,
        new Date().toISOString(),
        'COMPLETE_TRANSFER',
        routingTopic
      );
      
      // Send directly to queue
      await this.channel.sendToQueue(
        this.queueName,
        Buffer.from(JSON.stringify(event)),
        { persistent: true }
      );
      
      this.logger.log(`Published CompleteTransferEvent to queue ${this.queueName} for user ${userId}`);
    } catch (error) {
      this.logger.error('Error publishing event:', error);
      throw error;
    }
  }
}