import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MessagingModule } from './messaging/messaging.module';
import { TransferModule } from './transfer/transfer.module';
import { UsersSubscribers } from './users/users.subscribers';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MessagingModule.forRoot(),
    PrismaModule,
    UsersModule,
    AuthModule,
    TransferModule,
  ],
  providers: [UsersSubscribers],
})
export class AppModule {}
