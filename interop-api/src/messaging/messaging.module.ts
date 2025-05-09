import { Module, DynamicModule, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MessagingService } from './messaging.service';
import { RABBIT_PROVIDER } from './constants';
import { DiscoveryModule } from '@nestjs/core';
import { MessagingExplorer } from './messaging.explorer';

@Module({
  imports: [
    ConfigModule,
    DiscoveryModule,
    ClientsModule.registerAsync([
      {
        name: RABBIT_PROVIDER,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('rabbitmq.url') || 
                  `amqp://${configService.get<string>('rabbitmq.username')}:${configService.get<string>('rabbitmq.password')}@${configService.get<string>('rabbitmq.host')}:${configService.get<number>('rabbitmq.port')}`],
            queue: `${configService.get<string>('rabbitmq.queue')}`,
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [MessagingService, MessagingExplorer],
  exports: [MessagingService],
})
export class MessagingModule {
  static forRoot(): DynamicModule {
    return {
      module: MessagingModule,
      global: true,
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: MessagingModule,
    };
  }
}
