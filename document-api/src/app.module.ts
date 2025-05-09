import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DocumentsModule } from './documents/documents.module';
import { PrismaModule } from './prisma/prisma.module';
import configuration from './config/configuration';
import { MessagingModule } from './messaging/messaging.module';
import { TransferModule } from './transfer/transfer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    MessagingModule.forRoot(),
    DocumentsModule,
    PrismaModule,
    TransferModule,
  ],
})
export class AppModule {}