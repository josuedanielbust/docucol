import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  // Create a hybrid application (HTTP + Microservices)
  const app = await NestFactory.create(AppModule);
  
  // Add validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  const configService = app.get(ConfigService); 

  // Connect to RabbitMQ
  const rabbitMqUrl = configService.get<string>('rabbitmq.url') || 
    `amqp://${configService.get<string>('rabbitmq.username')}:${configService.get<string>('rabbitmq.password')}@${configService.get<string>('rabbitmq.host')}:${configService.get<number>('rabbitmq.port')}`;
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitMqUrl],
      queue: `${configService.get<string>('rabbitmq.queue')}_users`,
      queueOptions: {
        durable: true
      },
      noAck: false, // Explicit acknowledgment required
    },
  });

  // Start microservice
  await app.startAllMicroservices();
  logger.log('RabbitMQ microservice is listening');

  // Also start HTTP server
  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port);
  logger.log(`HTTP server running on port ${port}`);
}

bootstrap().catch(err => {
  console.error('Failed to start application', err);
});