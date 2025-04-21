import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GovApiService } from './gov-api.service';
import { GovApiController } from './gov-api.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  controllers: [GovApiController],
  providers: [GovApiService],
  exports: [GovApiService],
})
export class GovApiModule {}