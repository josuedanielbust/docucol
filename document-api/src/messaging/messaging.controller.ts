import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { DocumentProcessingEvent } from './events/document.events';
import { DocumentsService } from '../documents/documents.service';

@Controller()
export class MessagingController {
  private readonly logger = new Logger(MessagingController.name);

  constructor(
    private readonly documentsService: DocumentsService,
  ) {}

  @EventPattern('document_events.document.processing')
  async handleDocumentProcessingEvent(@Payload() event: DocumentProcessingEvent): Promise<void> {
    this.logger.log(`Received document processing event for document ${event.id}`);
    
    try {
      // Here we would update the document with processing status information
      // For now just logging the event
      this.logger.log(`Processing status for document ${event.id}: ${event.status}`);
      
      if (event.status === 'failed') {
        this.logger.error(`Processing failed for document ${event.id}: ${event.error}`);
      }
      
    } catch (error) {
      this.logger.error(`Error handling document processing event: ${(error as Error).message}`);
    }
  }
}
