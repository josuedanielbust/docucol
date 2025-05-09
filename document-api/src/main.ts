import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';


async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);
  
  // Apply validation pipe globally
  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get(ConfigService);
  
  // Connect to RabbitMQ for microservices
  const rabbitMqUrl = configService.get<string>('rabbitmq.url') || 
    `amqp://${configService.get<string>('rabbitmq.username')}:${configService.get<string>('rabbitmq.password')}@${configService.get<string>('rabbitmq.host')}:${configService.get<number>('rabbitmq.port')}`;
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitMqUrl],
      queue: `${configService.get<string>('rabbitmq.queue')}_documents`,
      queueOptions: {
        durable: true,
      },
      noAck: false,
    },
  });

  await app.startAllMicroservices();
  logger.log('Microservices started');

  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port);
  logger.log(`HTTP server running on port ${port}`);
}
bootstrap();