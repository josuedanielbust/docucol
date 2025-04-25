import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TransferService } from './transfer.service';
import { TransferController } from './transfer.controller';
import { GovApiService } from '../gov-api/gov-api.service';
import { MessagingService } from '../messaging/messaging.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  controllers: [TransferController],
  providers: [TransferService, GovApiService, MessagingService],
  exports: [TransferService],
})
export class TransferModule {}