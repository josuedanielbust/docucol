import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InitiateTransferEvent, CompleteTransferEvent } from './events/transfer.event';
import { ConfigService } from '@nestjs/config';
import * as amqplib from 'amqplib';
import { Channel, ChannelModel } from 'amqplib';

@Injectable()
export class MessagingService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  private connection!: ChannelModel;
  private channel!: Channel;

  async onModuleInit() {
    try {
      this.connection = await amqplib.connect(this.configService.get('RABBITMQ_URL') || 'amqp://localhost');
      this.channel = await this.connection.createChannel();
      const queueName = this.configService.get('RABBITMQ_QUEUE') || 'documents_queue';
      await this.channel.assertQueue(queueName);
    } catch (error) {
      console.error('RabbitMQ connection failed:', error);
    }
  }

  async onModuleDestroy() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
    } catch (error) {
      console.error('Error closing RabbitMQ connections:', error);
    }
  }

  async publishInitiateTransferEvent(userId: string): Promise<void> {
    try {
      const event = new InitiateTransferEvent(userId, new Date().toISOString(), 'INITIATE_TRANSFER');
      const queueName = this.configService.get('RABBITMQ_QUEUE') || 'documents_queue';
      this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(event)));
    } catch (error) {
      console.error('Error publishing event:', error);
    }
  }

  async publishCompleteTransferEvent(userId: string): Promise<void> {
    try {
      const event = new CompleteTransferEvent(userId, new Date().toISOString(), 'COMPLETE_TRANSFER');
      const queueName = this.configService.get('RABBITMQ_QUEUE') || 'documents_queue';
      this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(event)));
    } catch (error) {
      console.error('Error publishing event:', error);
    }
  }
}