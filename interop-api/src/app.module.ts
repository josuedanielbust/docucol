import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from './redis/redis.module';
import { GovApiModule } from './gov-api/gov-api.module';
import { TransferModule } from './transfer/transfer.module';
import { MessagingModule } from './messaging/messaging.module';
import configuration from './config/configuration';
import { OperatorsModule } from './operators/operators.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    HttpModule,
    RedisModule,
    GovApiModule,
    TransferModule,
    MessagingModule,
    OperatorsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
