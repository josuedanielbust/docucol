import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GovApiModule } from './gov-api/gov-api.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    GovApiModule,
  ],
})
export class AppModule {}
