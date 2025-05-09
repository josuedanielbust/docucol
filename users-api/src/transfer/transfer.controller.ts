import { Controller, Logger, Inject } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RmqContext, Transport, ClientProxy } from '@nestjs/microservices';
import { User } from '@prisma/client';
import { UsersService } from 'src/users/users.service';

/**
 * Interface representing transfer data
 */
interface UserTransferData {
  userId: string;
  transferId: string;
  message: string;
  status: string;
}

/**
 * Controller handling transfer operations via RabbitMQ
 */
@Controller()
export class TransferController {
  private readonly logger = new Logger(TransferController.name);

  constructor(
    private readonly usersService: UsersService,
    @Inject('TRANSFER_SERVICE') private readonly documentsTransferClient: ClientProxy
  ) {}

  /**
   * Handler for transfer initiation requests
   * 
   * @param data The transfer request data
   * @param context The RabbitMQ context for message handling
   * @returns Transfer acknowledgment with status
   */
  @MessagePattern('document.transfer.initiate', Transport.RMQ)
  async handleTransferInitiate(
    @Payload() data: UserTransferData,
    @Ctx() context: RmqContext
  ) {
    this.logger.log(`transfer initiation received: ${JSON.stringify(data)}`);

    try {
      const transferResult = await this.processTransfer(data);
      
      // Acknowledge the message
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
      
      const eventPayload = {
        success: true,
        message: 'user data for transfer successfully obtained',
        transferId: data.transferId,
        status: transferResult.status,
        user: transferResult.user
      };

      // Publish the response to a queue for further processing
      await this.publishTransferResponse('document.transfer.user.response', eventPayload);
      this.logger.log(`Published transfer response for user ${transferResult.user.id}`);

      return eventPayload;
    } catch (error) {
      this.logger.error(`Error processing transfer: ${(error as Error).message}`, (error as Error).stack);
      
      // Acknowledge the message to prevent redelivery loops
      // In a production scenario, you might want to use a dead-letter queue instead
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
      
      const errorPayload = {
        success: false,
        message: `Failed to initiate transfer: ${(error as Error).message}`,
        transferId: data.transferId,
      };
      
      // Publish error message to error queue
      await this.publishTransferResponse('document.transfer.error', errorPayload);
      
      return errorPayload;
    }
  }

  /**
   * Processes the transfer (mock implementation)
   */
  private async processTransfer(data: UserTransferData): Promise<{ status: string, user: Omit<User, 'password'> }> {
    const userDetails = await this.usersService.findOne(data.userId);

    if (!userDetails) {
      throw new Error(`User with ID ${data.userId} not found`);
    }

    // Create a sanitized user object without the password
    const { password, ...sanitizedUser } = userDetails;

    return {
      status: 'pending_documents',
      user: sanitizedUser,
    };
  }
  
  /**
   * Publishes a transfer response to the specified queue
   * 
   * @param pattern The routing pattern/queue name
   * @param payload The message payload to publish
   */
  private async publishTransferResponse(pattern: string, payload: any): Promise<void> {
    try {
      this.documentsTransferClient.emit(pattern, payload);
      this.logger.log(`Message published to ${pattern}`);
    } catch (error) {
      this.logger.error(`Failed to publish message to ${pattern}: ${(error as Error).message}`);
      // Not throwing here to avoid disrupting the main flow if publishing fails
    }
  }
}
