import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { GovApiService } from 'src/gov-api/gov-api.service'
import { 
  InitiateTransferDto,
  ConfirmTransferDto,
  TransferResponseDto,
  TransferCitizenDto,
  TransferCitizenConfirmDto
} from './dto/transfer.dto';

@Injectable()
export class TransferService {
  private readonly logger = new Logger(TransferService.name);

  constructor(
    private readonly govApiServive: GovApiService,
    @Inject('TRANSFER_SERVICE') private readonly transferClient: ClientProxy
  ) { }

  /**
   * Initiates a document transfer from one user to another
   * @param initiateTransferDto Transfer details
   * @returns Transfer response with transfer ID and status
   */
  async initiateTransfer(initiateTransferDto: InitiateTransferDto): Promise<TransferResponseDto> {
    try {
      // Validate user is registered with this provider
      const validateUser = await this.govApiServive.validateUser(initiateTransferDto.userId);
      if (validateUser.exists === false) {
        this.logger.error(`Error validating userId - ${initiateTransferDto.userId}`);
        throw new HttpException(
          'Not registered with this operator',
          HttpStatus.UNAUTHORIZED
        );
      }

      // Send message to RabbitMQ with userId as payload
      this.logger.log(`Sending userId ${initiateTransferDto.userId} to RabbitMQ queue with pattern: document.transfer.initiate`);
      const eventPayload = {
        message: 'initiating transfer',
        transferId: `transfer-${Date.now()}`,
        userId: initiateTransferDto.userId,
        operatorId: initiateTransferDto.operatorId,
        status: 'pending_user',
      };

      this.transferClient.emit('document.transfer.initiate', eventPayload);
      
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
   * Initiates a document transfer from one user to another
   * @param transferCitizenDto Transfer details
   * @returns Transfer response with transfer ID and status
   */
  async transferCitizen(transferCitizenDto: TransferCitizenDto): Promise<TransferResponseDto> {
    try {
      // Send message to RabbitMQ with userId as payload
      this.logger.log(`Sending userId ${transferCitizenDto.id} to RabbitMQ queue with pattern: document.incoming-transfer.initiate`);
      const eventPayload = {
        status: 'pending_user_creation',
        message: 'initiating transfer',
        transferId: `incoming-transfer-${Date.now()}`,
        payload: transferCitizenDto,
      };

      this.transferClient.emit('document.incoming-transfer.initiate', eventPayload);
      
      return { userId: transferCitizenDto.id, message: 'Transfers citizen initiated' }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Error initiating transfer citizen: ${(error as Error).message}`);
      throw new HttpException(
        'Failed to initiate transfer citizen',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Initiates a document transfer from one user to another
   * @param userId Transfer details
   * @returns Transfer response with transfer ID and status
   */
  async transferCitizenConfirmUserId(userId: string): Promise<TransferResponseDto> {
    try {
      // Decode the base64 userId
      const decodedUserId = Buffer.from(userId, 'base64').toString('utf-8');
      this.logger.log(`Decoded userId ${decodedUserId} from base64 string`);

      // Send message to RabbitMQ with userId as payload
      this.logger.log(`Sending userId ${decodedUserId} to RabbitMQ queue with pattern: transfer.get.user.details`);
      const eventPayload = { userId: decodedUserId };

      this.transferClient.emit('transfer.get.user.details', eventPayload);
      
      return { userId: decodedUserId, message: 'Trying to retrieve user details' }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Error confirming user transfer: ${(error as Error).message}`);
      throw new HttpException(
        'Failed to confirm user transfer',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Initiates a document transfer from one user to another
   * @param transferCitizenConfirmDto Transfer details
   * @returns Transfer response with transfer ID and status
   */
  async transferCitizenConfirm(transferCitizenConfirmDto: TransferCitizenConfirmDto): Promise<TransferResponseDto> {
    try {
      // Send message to RabbitMQ with userId as payload
      this.logger.log(`Sending userId ${transferCitizenConfirmDto.id} to RabbitMQ queue with pattern: document.incoming-confirmation.initiate`);
      const eventPayload = {
        status: 'pending_user_removal',
        message: 'initiating deletion',
        transferId: `incoming-confirmation-${Date.now()}`,
        payload: transferCitizenConfirmDto,
      };

      this.transferClient.emit('document.incoming-confirmation.initiate', eventPayload);
      
      return { userId: String(transferCitizenConfirmDto.id), message: 'Removal initiated' }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Error confirmation transfer citizen: ${(error as Error).message}`);
      throw new HttpException(
        'Failed to confirmate documents transfer',
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
      this.logger.log(`Sending confirmation for userId ${confirmTransferDto.userId} to RabbitMQ queue with pattern`);
      const eventPayload = {
        message: 'confirming transfer',
        userId: confirmTransferDto.userId,
        status: 'pending_user',
      };

      this.transferClient.emit('document.transfer.complete', eventPayload);
      
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