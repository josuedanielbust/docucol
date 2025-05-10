import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RmqContext, Transport } from '@nestjs/microservices';
import { EmailService } from 'src/email/email.service';
import { MessagingService } from 'src/messaging/messaging.service';

/**
 * Interface representing transfer data
 */
interface DocumentTransferData {
  success: boolean;
  message: string;
  transferId: string;
  status: string;
  user: Record<string, string | number | boolean>;
}

interface DocumentIncomingTransferData {
  status: string;
  message: string;
  transferId: string;
  password: string;
  payload: {
    id: string;
    citizenName: string;
    citizenEmail: string;
    urlDocuments: Record<string, string[]>;
    citizenAddress: string;
    confirmAPI: string;
  },
  user: {
    id: string;
    email: string;
    first_name: string;
  }
}

/**
 * Controller handling transfer operations via RabbitMQ
 */
@Controller()
export class TransferController {
  private readonly logger = new Logger(TransferController.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly messagingService: MessagingService
  ) {}

  /**
   * Handler for transfer initiation requests
   * 
   * @param data The transfer request data
   * @param context The RabbitMQ context for message handling
   * @returns Transfer acknowledgment with status
   */
  @MessagePattern('document.transfer.user.response', Transport.RMQ)
  async handleTransferInitiate(
    @Payload() data: DocumentTransferData,
    @Ctx() context: RmqContext
  ) {
    // const eventMessage = JSON.parse(context.getMessage().content.toString());
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
        user: data.user,
        transferId: data.transferId,
        status: transferResult.status,
        documents: transferResult.documents,
      };

      // Publish the response to a queue for further processing
      await this.publishTransferResponse('document.transfer.notifications.response', eventPayload);
      this.logger.log(`Published transfer response for user ${eventPayload.user.id}`);

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
      };
      
      // Publish error message to error queue
      await this.publishTransferResponse('document.transfer.error', errorPayload);
      
      return errorPayload;
    }
  }

  /**
   * Processes the transfer (mock implementation)
   */
  private async processTransfer(data: DocumentTransferData): Promise<{
    status: string,
    documents: { id: string, title: string, presignedUrl: string }[]
  }> {
    const documentsList = await this.emailService.sendTemplateEmail(
      '',
      String(data.user.email),
      {
        name: data.user.name,
        appName: 'Docucol'
      }
    );
    return {
      status: 'pending_confirmation',
      documents: documentsList,
    };
  }

  /**
   * Handler for transfer initiation requests
   * 
   * @param data The transfer request data
   * @param context The RabbitMQ context for message handling
   * @returns Transfer acknowledgment with status
   */
  @MessagePattern('document.incoming-transfer.user.response', Transport.RMQ)
  async handleIncomingTransferInitiate(
    @Payload() data: DocumentIncomingTransferData,
    @Ctx() context: RmqContext
  ) {
    this.logger.log(`transfer initiation received: ${JSON.stringify(data)}`);
    
    try {
      const transferResult = await this.processIncomingTransfer(data);
      
      // Acknowledge the message
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);

      const eventPayload = {
        ...data,
        status: transferResult.status,
        message: 'notifications successfully sent',
      };

      // Publish the response to a queue for further processing
      await this.publishTransferResponse('document.incoming-transfer.notifications.response', eventPayload);
      this.logger.log(`Published incoming transfer response for user ${data.user.id}`);

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
  private async processIncomingTransfer(data: DocumentIncomingTransferData): Promise<{ status: string }> {
    // Encode user ID and transfer ID for security
    const encodedUserId = Buffer.from(data.user.id.toString()).toString('base64');
    
    // Create verification link with encoded parameters
    const verificationLink = `http://localhost/interop/transfer/transferCitizen/confirm/${encodedUserId}`;
    
    const documentsList = await this.emailService.sendTemplateEmail(
      '',
      String(data.user.email),
      {
      name: data.user.first_name,
      password: data.password,
      appName: 'Docucol',
      verificationLink: verificationLink
      }
    );
    return { status: 'pending_confirmation' };
  }
  
  /**
   * Publishes a transfer response to the specified queue
   * 
   * @param pattern The routing pattern/queue name
   * @param payload The message payload to publish
   */
  private async publishTransferResponse(pattern: string, payload: any): Promise<void> {
    try {
      await this.messagingService.publish(pattern, payload);
    } catch (error) {
      this.logger.error(`Failed to publish message to ${pattern}: ${(error as Error).message}`);
      // Not throwing here to avoid disrupting the main flow if publishing fails
    }
  }
}
