import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { MessagingService } from '../messaging/messaging.service';
import { 
  InitiateTransferDto,
  ConfirmTransferDto,
  TransferResponseDto
} from './dto/transfer.dto';

import { GovApiService } from '../gov-api/gov-api.service'

@Injectable()
export class TransferService {
  private readonly logger = new Logger(TransferService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly govApiServive: GovApiService,
    private readonly messagingService: MessagingService
  ) { }

  /**
   * Initiates a document transfer from one user to another
   * @param initiateTransferDto Transfer details
   * @returns Transfer response with transfer ID and status
   */
  async initiateTransfer(initiateTransferDto: InitiateTransferDto): Promise<TransferResponseDto> {
    try {
      // Validate user is registered with this provider
      // const validateUser = await this.govApiServive.validateUser(initiateTransferDto.userId);
      // if (validateUser.exists === false) {
      //   this.logger.error(`Error validating userId - ${initiateTransferDto.userId}`);
      //   throw new HttpException(
      //     'Not registered with this operator',
      //     HttpStatus.UNAUTHORIZED
      //   );
      // }

      // Send message to RabbitMQ with userId as payload
      this.logger.log(`Sending userId ${initiateTransferDto.userId} to RabbitMQ queue`);
      await this.messagingService.publishInitiateTransferEvent(initiateTransferDto.userId);
      
      return { userId: initiateTransferDto.userId, message: 'Transfers initiated' }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Error initiating transfer: ${(error as Error).message}`);
      throw new HttpException(
        'Failed to initiate documents transfer',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Confirms or rejects a document transfer
   * @param confirmTransferDto Transfer confirmation details
   * @returns Updated transfer status
   */
  async confirmTransfer(confirmTransferDto: ConfirmTransferDto): Promise<TransferResponseDto> {
    try {
      // Send confirmation message to RabbitMQ
      this.logger.log(`Sending confirmation for userId ${confirmTransferDto.userId} to RabbitMQ queue`);
      await this.messagingService.publishCompleteTransferEvent(confirmTransferDto.userId);
      
      return { userId: confirmTransferDto.userId, message: 'Transfer completed' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Error confirming transfer: ${(error as Error).message}`);
      throw new HttpException(
        'Failed to confirm document transfer',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}