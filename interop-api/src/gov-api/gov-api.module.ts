import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { GovApiService } from './gov-api.service';
import { GovApiController } from './gov-api.controller';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    RedisModule,
  ],
  controllers: [GovApiController],
  providers: [GovApiService],
  exports: [GovApiService],
})
export class GovApiModule {}