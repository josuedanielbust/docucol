import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true
  });
  await app.listen(3000);
}
bootstrap();