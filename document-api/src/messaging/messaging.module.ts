import { Module, DynamicModule, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { DocumentsModule } from '../documents/documents.module';
import { RABBIT_PROVIDER } from './constants';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => DocumentsModule),
    ClientsModule.registerAsync([
      {
        name: RABBIT_PROVIDER,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('rabbitmq.url') || 
                  `amqp://${configService.get<string>('rabbitmq.username')}:${configService.get<string>('rabbitmq.password')}@${configService.get<string>('rabbitmq.host')}:${configService.get<number>('rabbitmq.port')}`],
            queue: `${configService.get<string>('rabbitmq.queue')}_transfers`,
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [MessagingController],
  providers: [MessagingService],
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
