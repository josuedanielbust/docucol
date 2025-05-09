import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TransferController } from './transfer.controller';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { GovApiService } from 'src/gov-api/gov-api.service';
import { RedisService } from 'src/redis/redis.service';
import { TransferService } from './transfer.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'TRANSFER_SERVICE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('rabbitmq.url', 'amqp://localhost:5672')],
            queue: `${configService.get<string>('rabbitmq.queue', 'docucol_events')}_users`,
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
  ],
  providers: [
    TransferService,
    GovApiService,
    ConfigService,
    RedisService,
  ],
  exports: [
    TransferService,
  ],
  controllers: [TransferController],
})
export class TransferModule {}
