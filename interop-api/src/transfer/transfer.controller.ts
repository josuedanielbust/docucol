import { Controller, Get, Post, Body, Logger, Param } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RmqContext, Transport } from '@nestjs/microservices';
import { TransferService } from './transfer.service';
import { OperatorsService } from 'src/operators/operators.service';
import { GovApiService } from 'src/gov-api/gov-api.service';
import { 
  InitiateTransferDto, 
  ConfirmTransferDto, 
  TransferResponseDto,
  TransferCitizenDto,
  TransferCitizenConfirmDto
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

  @Post('transferCitizen')
  async transferCitizen(
    @Body() transferCitizenDto: TransferCitizenDto,
  ): Promise<TransferResponseDto> {
    this.logger.log(`Initiating Citizen transfer for document ${transferCitizenDto.id}`);
    return this.transferService.transferCitizen(transferCitizenDto);
  }

  @Get('transferCitizen/confirm/:id')
  async transferCitizenConfirmUserId(
    @Param('id') userId: string,
  ): Promise<any> {
    this.logger.log(`Confirming Citizen transfer for document ${userId}`);
    return this.transferService.transferCitizenConfirmUserId(userId);
  }

  @Post('transferCitizenConfirm')
  async transferCitizenConfirm(
    @Body() transferCitizenConfirmDto: TransferCitizenConfirmDto,
  ): Promise<TransferResponseDto> {
    this.logger.log(`Completing Citizen transfer for document ${transferCitizenConfirmDto.id}`);
    return this.transferService.transferCitizenConfirm(transferCitizenConfirmDto);
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

  @MessagePattern('transfer.get.user.details.response', Transport.RMQ)
  async handleGetUserDetails(
    @Payload() data: { userId: string, name: string, email: string, address: string },
    @Ctx() context: RmqContext
  ) {
    this.logger.log(`get user details received: ${JSON.stringify(data)}`);
    
    try {
      // Get user details from the message payload
      const userId = data.userId;
      this.logger.log(`Processing user details for ID: ${userId}`);

      // Call the government API service to register the user
      const registrationResponse = await this.govApiService.registerUser({
        userId: data.userId,
        name: data.name,
        address: data.address,
        email: data.email
      });

      if (!registrationResponse.registered) {
        throw new Error(`Failed to register user ${userId} with government API`);
      }

      this.logger.log(`Successfully registered user ${userId} with government API`);

      // Acknowledge the message
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);

      // Return successful response
      return {
        success: true,
        message: `User ${userId} successfully registered`,
        userId: userId
      };
    } catch (error) {
      this.logger.error(`Failed to register user ${data.userId} with government API: ${(error as Error).message}`, (error as Error).stack);
      
      // Acknowledge the message to prevent redelivery loops
      // In a production scenario, you might want to use a dead-letter queue instead
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
      
      const errorPayload = {
        success: false,
        message: `Failed to register user: ${(error as Error).message}`,
      };
      
      return errorPayload;
    }
  }
}
