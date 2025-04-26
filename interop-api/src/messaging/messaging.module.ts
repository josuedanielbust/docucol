import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { RedisService } from '../redis/redis.service';

@Module({
  providers: [MessagingService, RedisService],
  exports: [MessagingService],
})
export class MessagingModule {}