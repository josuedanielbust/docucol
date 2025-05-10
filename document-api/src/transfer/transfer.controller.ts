import { Controller, Logger, Inject } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RmqContext, Transport, ClientProxy } from '@nestjs/microservices';
import { DocumentsService } from 'src/documents/documents.service';
import { MessagingService } from 'src/messaging/messaging.service';

/**
 * Interface representing transfer data
 */
interface DocumentTransferData {
  success: boolean;
  message: string;
  transferId: string;
  operatorId: string;
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
  }
}

/**
 * Controller handling transfer operations via RabbitMQ
 */
@Controller()
export class TransferController {
  private readonly logger = new Logger(TransferController.name);

  constructor(
    private readonly documentsService: DocumentsService,
    private readonly messagingService: MessagingService,
    @Inject('NOTIFICATIONS_SERVICE') private readonly notificationsClient: ClientProxy,
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
        operatorId: data.operatorId,
        status: transferResult.status,
        documents: transferResult.documents,
      };

      // Publish the response to a queue for further processing
      await this.publishTransferResponse('document.transfer.documents.response', eventPayload);
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
    const documentsList = await this.documentsService.findOnS3ByUserId(String(data.user.id));
    return {
      status: 'pending_confirmation',
      documents: documentsList,
    };
  }

  /**
   * Handler for transfer confirmation requests
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
        message: 'documents successfully created',
      };

      // Publish the response to a queue for further processing
      await this.publishTransferResponse('document.incoming-transfer.notifications.response', eventPayload, false);
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
    this.logger.log(`Processing incoming transfer for user ${data.user.id} with ${Object.keys(data.payload.urlDocuments).length} document types`);
    
    // Process each document type and their URLs
    for (const [documentType, urls] of Object.entries(data.payload.urlDocuments)) {
      this.logger.log(`Processing document type: ${documentType} with ${urls.length} files`);
      
      // Process each URL for the current document type
      for (const [key, url] of Object.entries(urls)) {
      try {
        // Download the document from the URL
        const documentResponse = await fetch(url);
        
        if (!documentResponse.ok) {
        throw new Error(`Failed to download document: ${documentResponse.statusText}`);
        }
        
        // Get the file buffer and use the key as filename
        const fileBuffer = await documentResponse.arrayBuffer();
        const fileName = key;
        
        // Create a file object compatible with Express.Multer.File
        const fileObject = {
          fieldname: 'file',
          originalname: fileName,
          encoding: '7bit',
          mimetype: documentResponse.headers.get('content-type') || 'application/octet-stream',
          buffer: Buffer.from(fileBuffer),
          size: fileBuffer.byteLength
        } as Express.Multer.File;

        // Create the document in the documents module
        await this.documentsService.create({
          userId: String(data.user.id),
          title: fileName,
        }, fileObject);
        
        this.logger.log(`Successfully processed document: ${fileName}`);
      } catch (error) {
        this.logger.error(`Error processing document URL ${url}: ${(error as Error).message}`);
        // Continue processing other documents even if one fails
      }
      }
    }

    return { status: 'pending_notification' };
  }
  
  /**
   * Publishes a transfer response to the specified queue
   * 
   * @param pattern The routing pattern/queue name
   * @param payload The message payload to publish
   */
  private async publishTransferResponse(pattern: string, payload: any, useMessaging: boolean = true): Promise<void> {
    try {
      if (useMessaging) {
        await this.messagingService.publish(pattern, payload);
      } else {
        await this.notificationsClient.emit(pattern, payload);
      }
    } catch (error) {
      this.logger.error(`Failed to publish message to ${pattern}: ${(error as Error).message}`);
      // Not throwing here to avoid disrupting the main flow if publishing fails
    }
  }
}
