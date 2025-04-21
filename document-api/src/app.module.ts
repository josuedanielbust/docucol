import { Module } from '@nestjs/common';
import { DocumentsModule } from './documents/documents.module';
import { MessagingModule } from './messaging/messaging.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [DocumentsModule, MessagingModule, PrismaModule],
})
export class AppModule {}