import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from './redis/redis.module';
import { GovApiModule } from './gov-api/gov-api.module';
import { TransferModule } from './transfer/transfer.module';
import { MessagingModule } from './messaging/messaging.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    RedisModule,
    GovApiModule,
    TransferModule,
    MessagingModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
