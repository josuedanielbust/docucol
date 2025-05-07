import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RmqContext, Transport } from '@nestjs/microservices';
import { UserCreatedEvent, UserUpdatedEvent, UserDeletedEvent } from '../messaging/interfaces/message.interface';

@Controller()
export class UsersSubscribers {
  private readonly logger = new Logger(UsersSubscribers.name);

  @MessagePattern('docucol.user.created', Transport.RMQ)
  async handleUserCreated(
    @Payload() data: UserCreatedEvent,
    @Ctx() context: RmqContext
  ) {
    this.logger.log(`User created event received: ${JSON.stringify(data)}`);
    
    // Access the original message if needed
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    
    // Handle the user created event
    
    // Acknowledge the message
    channel.ack(originalMsg);
    
    return true;
  }

  @MessagePattern('docucol.user.updated', Transport.RMQ)
  async handleUserUpdated(
    @Payload() data: UserUpdatedEvent,
    @Ctx() context: RmqContext
  ) {
    this.logger.log(`User updated event received: ${JSON.stringify(data)}`);
    
    // Handle the user updated event
    
    // Acknowledge the message
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
    
    return true;
  }

  @MessagePattern('docucol.user.deleted', Transport.RMQ)
  async handleUserDeleted(
    @Payload() data: UserDeletedEvent,
    @Ctx() context: RmqContext
  ) {
    this.logger.log(`User deleted event received: ${JSON.stringify(data)}`);
    
    // Handle the user deleted event
    
    // Acknowledge the message
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
    
    return true;
  }
}
