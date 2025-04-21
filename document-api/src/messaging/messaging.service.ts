import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { DocumentUploadedEvent } from './events/document-uploaded.event';
import * as amqplib from 'amqplib';
import { Channel, ChannelModel } from 'amqplib';

@Injectable()
export class MessagingService implements OnModuleInit, OnModuleDestroy {
  private connection!: ChannelModel;
  private channel!: Channel;

  async onModuleInit() {
    try {
      this.connection = await amqplib.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
      this.channel = await this.connection.createChannel();
      const queueName = process.env.RABBITMQ_QUEUE || 'document_uploads';
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

  async publishDocumentUploadedEvent(documentId: string, title: string): Promise<void> {
    try {
      const event = new DocumentUploadedEvent(documentId, title);
      const queueName = process.env.RABBITMQ_QUEUE || 'document_uploads';
      this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(event)));
    } catch (error) {
      console.error('Error publishing event:', error);
    }
  }

  async consumeDocumentUploadedEvents(callback: (message: any) => void): Promise<void> {
    const queueName = process.env.RABBITMQ_QUEUE || 'document_uploads';
    this.channel.consume(queueName, (message) => {
      if (message) {
        try {
          const content = JSON.parse(message.content.toString());
          callback(content);
          this.channel.ack(message);
        } catch (error) {
          console.error('Error processing message:', error);
          this.channel.nack(message);
        }
      }
    });
  }
}