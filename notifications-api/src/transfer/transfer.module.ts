import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TransferController } from './transfer.controller';
import { EmailModule } from 'src/email/email.module';
import { ConfigService, ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    EmailModule,
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'TRANSFER_SERVICE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('rabbitmq.url') || 
              `amqp://${configService.get<string>('rabbitmq.username')}:${configService.get<string>('rabbitmq.password')}@${configService.get<string>('rabbitmq.host')}:${configService.get<number>('rabbitmq.port')}`],
            queue: `${configService.get<string>('rabbitmq.queue')}_transfer`,
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [TransferController],
})
export class TransferModule {}
