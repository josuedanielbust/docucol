import { Controller, Logger, Inject } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RmqContext, Transport, ClientProxy } from '@nestjs/microservices';
import { User } from '@prisma/client';
import { UsersService } from 'src/users/users.service';

/**
 * Interface representing transfer data
 */
interface UserTransferData {
  userId: string;
  operatorId: string;
  transferId: string;
  message: string;
  status: string;
}

interface UserIncomingTransferData {
  status: string;
  message: string;
  transferId: string;
  payload: {
    id: string;
    citizenName: string;
    citizenEmail: string;
    urlDocuments: Record<string, string[]>;
    citizenAddress: string;
    confirmAPI: string;
  },
}

/**
 * Controller handling transfer operations via RabbitMQ
 */
@Controller()
export class TransferController {
  private readonly logger = new Logger(TransferController.name);

  constructor(
    private readonly usersService: UsersService,
    @Inject('TRANSFER_SERVICE') private readonly documentsTransferClient: ClientProxy,
    @Inject('INTEROP_SERVICE') private readonly interopTransferClient: ClientProxy
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
      const transferResult = await this.processTransfer(data.userId);
      
      // Acknowledge the message
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
      
      const eventPayload = {
        success: true,
        message: 'user data for transfer successfully obtained',
        transferId: data.transferId,
        operatorId: data.operatorId,
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
  private async processTransfer(userId: string): Promise<{ status: string, user: Omit<User, 'password'> }> {
    const userDetails = await this.usersService.findOne(userId);

    if (!userDetails) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Create a sanitized user object without the password
    const { password, ...sanitizedUser } = userDetails;

    return {
      status: 'pending_documents',
      user: sanitizedUser,
    };
  }

  /**
   * Handler for incoming transfer initiation requests
   * 
   * @param data The transfer request data
   * @param context The RabbitMQ context for message handling
   * @returns Transfer acknowledgment with status
   */
  @MessagePattern('document.incoming-transfer.initiate', Transport.RMQ)
  async handleIncomingTransferInitiate(
    @Payload() data: UserIncomingTransferData,
    @Ctx() context: RmqContext
  ) {
    this.logger.log(`incoming transfer initiation received: ${JSON.stringify(data)}`);

    try {
      const transferResult = await this.processIncomingTransfer(data);
      
      // Acknowledge the message
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
      
      const eventPayload = {
        ...data,
        user: transferResult.user,
        password: transferResult.password,
        status: transferResult.status,
        message: 'user successfully created',
      };

      // Publish the response to a queue for further processing
      await this.publishTransferResponse('document.incoming-transfer.user.response', eventPayload);
      this.logger.log(`Published incoming transfer response for user ${transferResult.user.id}`);

      return eventPayload;
    } catch (error) {
      this.logger.error(`Error processing incoming transfer: ${(error as Error).message}`, (error as Error).stack);
      
      // Acknowledge the message to prevent redelivery loops
      // In a production scenario, you might want to use a dead-letter queue instead
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
      
      const errorPayload = {
        success: false,
        message: `Failed to initiate incoming transfer: ${(error as Error).message}`,
        transferId: data.transferId,
      };
      
      // Publish error message to error queue
      await this.publishTransferResponse('document.incoming-transfer.error', errorPayload);
      
      return errorPayload;
    }
  }

  /**
   * Processes the transfer (mock implementation)
   */
  private async processIncomingTransfer(data: UserIncomingTransferData): Promise<{ status: string, user: User, password: string }> {
    // Generate a random 8 character password
    const generateRandomPassword = (): string => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let password = '';
      for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      password += chars[randomIndex];
      }
      return password;
    };

    const randomPassword = generateRandomPassword();
    
    const user = await this.usersService.create({
      id: data.payload.id,
      first_name: data.payload.citizenName,
      address: data.payload.citizenAddress,
      password: randomPassword,
      email: data.payload.citizenEmail
    });

    if (!user) {
      throw new Error(`User with ID ${data.payload.id} not created`);
    }

    return { status: 'pending_documents', user, password: randomPassword };
  }

  /**
   * Handler for incoming transfer initiation requests
   * 
   * @param data The transfer request data
   * @param context The RabbitMQ context for message handling
   * @returns Transfer acknowledgment with status
   */
  @MessagePattern('transfer.get.user.details', Transport.RMQ)
  async handleGetUserDetails(
    @Payload() data: { userId: string },
    @Ctx() context: RmqContext
  ) {
    this.logger.log(`incoming get user details received: ${JSON.stringify(data)}`);

    try {
      const transferResult = await this.processTransfer(data.userId);
      
      // Acknowledge the message
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
      
      const eventPayload = { user: transferResult.user };

      // Publish the response to a queue for further processing
      await this.interopTransferClient.emit('transfer.get.user.details.response', eventPayload);
      this.logger.log(`Published incoming get user details for user ${transferResult.user.id}`);

      return eventPayload;
    } catch (error) {
      this.logger.error(`Error processing incoming transfer: ${(error as Error).message}`, (error as Error).stack);
      
      // Acknowledge the message to prevent redelivery loops
      // In a production scenario, you might want to use a dead-letter queue instead
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
      
      const errorPayload = {
        success: false,
        message: `Failed to get details for user: ${(error as Error).message}`
      };
      
      // Publish error message to error queue
      await this.publishTransferResponse('transfer.get.user.details.error', errorPayload);
      
      return errorPayload;
    }
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
