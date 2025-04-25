import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GovApiModule } from './gov-api/gov-api.module';
import { TransferModule } from './transfer/transfer.module';
import { MessagingModule } from './messaging/messaging.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    GovApiModule,
    TransferModule,
    MessagingModule
  ],
})
export class AppModule {}
