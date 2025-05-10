import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { OperatorsService } from './operators.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  providers: [OperatorsService],
  exports: [OperatorsService],
})
export class OperatorsModule {}