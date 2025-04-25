import { Controller, Post, Body, Get, Param, Logger } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { 
  InitiateTransferDto, 
  ConfirmTransferDto, 
  TransferResponseDto 
} from './dto/transfer.dto';

@Controller('transfer')
export class TransferController {
  private readonly logger = new Logger(TransferController.name);

  constructor(private readonly transferService: TransferService) {}

  @Post('initiate')
  async initiateTransfer(
    @Body() initiateTransferDto: InitiateTransferDto,
  ): Promise<TransferResponseDto> {
    this.logger.log(`Initiating transfer for document ${initiateTransferDto.userId}`);
    return this.transferService.initiateTransfer(initiateTransferDto);
  }

  @Post('confirm')
  async confirmTransfer(
    @Body() confirmTransferDto: ConfirmTransferDto,
  ): Promise<TransferResponseDto> {
    this.logger.log(`Confirming transfer for document ${confirmTransferDto.userId}`);
    return this.transferService.confirmTransfer(confirmTransferDto);
  }
}
