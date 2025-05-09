import { Controller, Post, Body, Logger, Inject } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RmqContext, Transport, ClientProxy } from '@nestjs/microservices';
import { TransferService } from './transfer.service';
import { OperatorsService } from 'src/operators/operators.service';
import { GovApiService } from 'src/gov-api/gov-api.service';
import { 
  InitiateTransferDto, 
  ConfirmTransferDto, 
  TransferResponseDto 
} from './dto/transfer.dto';

/**
 * Interface representing transfer data
 */
interface TransferData {
  success: boolean;
  message: string;
  transferId: string;
  operatorId: string;
  status: string;
  user: Record<string, string | number | boolean>;
  documents: Record<string, string | number | boolean>;
}

@Controller('transfer')
export class TransferController {
  private readonly logger = new Logger(TransferController.name);

  constructor(
    private readonly transferService: TransferService,
    private readonly govApiService: GovApiService,
    private readonly operatorsService: OperatorsService
  ) {}

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

  @MessagePattern('document.transfer.documents.response', Transport.RMQ)
  async handleTransferInitiate(
    @Payload() data: TransferData,
    @Ctx() context: RmqContext
  ) {
    this.logger.log(`data for transfer received: ${JSON.stringify(data)}`);
    
    try {
      const unregisterResponse = await this.govApiService.unregisterUser(String(data.user.id));

      if (unregisterResponse.unregistered === false) {
        throw new Error('Cannot unregister user');
      }

      const operator: { transferAPIURL: string } = await this.govApiService.getOperatorById(data.operatorId);

      const sendTransferResponse = await this.operatorsService.sendTransferRequest(operator.transferAPIURL, data);

      if (sendTransferResponse === false) {
        throw new Error('Cannot contact third party operator');
      }

      // Acknowledge the message
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);

    } catch (error) {
      this.logger.error(`Error processing transfer: ${(error as Error).message}`, (error as Error).stack);
      
      // Acknowledge the message to prevent redelivery loops
      // In a production scenario, you might want to use a dead-letter queue instead
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
      
      const errorPayload = {
        success: false,
        message: `Failed to complete transfer: ${(error as Error).message}`,
      };
      
      return errorPayload;
    }
  }
}
