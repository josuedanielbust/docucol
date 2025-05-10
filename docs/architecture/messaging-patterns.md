# DocuCol Messaging Patterns

## Introduction

This document outlines the messaging patterns and standards used in the DocuCol system. These patterns ensure consistent, reliable communication between microservices using RabbitMQ as the message broker.

## Event Naming Conventions

DocuCol uses a consistent event naming convention to ensure clarity and discoverability:

```
<domain>.<event-type>
```

Examples:
- `user.created`
- `document.uploaded`
- `document.ownership.updated`
- `transfer.initiated`
- `transfer.confirmed`

## Message Structure

All messages should follow a consistent structure:

```typescript
interface Message<T> {
  // Metadata
  eventId: string;        // Unique identifier for the event
  eventType: string;      // The type of event (e.g., 'user.created')
  timestamp: string;      // ISO timestamp of when the event was created
  producer: string;       // Service that produced the event
  
  // Content
  data: T;                // The actual event data payload
  
  // Optional fields
  correlationId?: string; // For tracking related events
  version?: string;       // Schema version
}
```

## Common Message Types

### User Events

**user.created**
```typescript
{
  userId: string;
  email: string;
  name: string;
  createdAt: string;
}
```

**user.updated**
```typescript
{
  userId: string;
  updatedFields: {
    [key: string]: any;
  };
  updatedAt: string;
}
```

### Document Events

**document.uploaded**
```typescript
{
  id: string;
  title: string;
  userId: string;
  fileName: string;
  filePath: string;
  uploadedAt: string;
}
```

**document.deleted**
```typescript
{
  id: string;
  userId: string;
  deletedAt: string;
}
```

### Transfer Events

**transfer.initiated**
```typescript
{
  transferId: string;
  documentId: string;
  fromUserId: string;
  toUserId: string;
  initiatedAt: string;
}
```

**transfer.confirmed**
```typescript
{
  transferId: string;
  documentId: string;
  fromUserId: string;
  toUserId: string;
  confirmed: boolean;
  confirmedAt: string;
}
```

## Publisher Implementation

Services publish messages using the `MessagingService`:

```typescript
@Injectable()
export class UserService {
  constructor(private messagingService: MessagingService) {}

  async createUser(userData: CreateUserDto): Promise<User> {
    // Create user logic
    const user = await this.prismaService.user.create({ data: userData });
    
    // Publish event
    await this.messagingService.publish('user.created', {
      userId: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString()
    });
    
    return user;
  }
}
```

## Subscriber Implementation

### Using NestJS Built-in Decorators

For services that are designed as microservices, use the built-in NestJS decorators:

```typescript
@Controller()
export class UserEventsController {
  constructor(private readonly documentService: DocumentService) {}

  @MessagePattern('user.created', Transport.RMQ)
  async handleUserCreated(
    @Payload() data: UserCreatedEvent,
    @Ctx() context: RmqContext
  ) {
    try {
      await this.documentService.processNewUser(data);
      // Acknowledge message
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
    } catch (error) {
      // Handle error, potentially reject message
      this.logger.error(`Error processing user.created event: ${error.message}`);
    }
  }
}
```

### Using Custom Decorator

For services where auto-discovery is preferred, use the custom `@RabbitSubscriber` decorator:

```typescript
@Injectable()
export class UserEventHandler {
  private readonly logger = new Logger(UserEventHandler.name);

  @RabbitSubscriber({ pattern: 'user.created' })
  async handleUserCreated(data: UserCreatedEvent) {
    try {
      this.logger.log(`Processing user created event for ${data.email}`);
      // Handle the user created event
    } catch (error) {
      this.logger.error(`Failed to process user.created event: ${error.message}`);
      throw error; // Rethrow to trigger proper error handling
    }
  }
}
```

## Error Handling

### Publishing Errors

When publishing messages, use try/catch blocks and implement retry logic:

```typescript
try {
  await this.messagingService.publish('event.name', eventData);
} catch (error) {
  this.logger.error(`Failed to publish event: ${error.message}`);
  // Implement retry logic or fallback behavior
}
```

### Subscriber Errors

When handling incoming messages, properly catch and log errors:

```typescript
try {
  // Process message
  await this.processEvent(data);
  
  // Acknowledge message
  channel.ack(originalMsg);
} catch (error) {
  this.logger.error(`Error processing event: ${error.message}`);
  
  // Decide whether to reject or requeue based on error type
  if (isTemporaryError(error)) {
    channel.nack(originalMsg, false, true); // Requeue
  } else {
    channel.nack(originalMsg, false, false); // Don't requeue (to dead letter)
  }
}
```

## Dead Letter Strategy

For messages that fail processing repeatedly, configure a dead letter exchange and queue:

```typescript
{
  queueOptions: {
    durable: true,
    deadLetterExchange: 'docucol_dlx',
    deadLetterRoutingKey: 'dead_letter'
  }
}
```

Implement a separate process to monitor and handle dead letter queues.

## Testing Strategies

### Unit Testing Message Handlers

```typescript
describe('UserEventHandler', () => {
  let handler: UserEventHandler;
  let mockService: MockType<UserService>;
  
  beforeEach(async () => {
    // Setup test module with mocks
  });
  
  it('should process user.created events', async () => {
    const eventData = { userId: '123', email: 'test@example.com' };
    await handler.handleUserCreated(eventData);
    
    expect(mockService.processNewUser).toHaveBeenCalledWith(eventData);
  });
});
```

### Integration Testing with RabbitMQ

For integration tests, use a test RabbitMQ instance:

```typescript
describe('Messaging Integration', () => {
  let app: INestApplication;
  let messagingService: MessagingService;
  
  beforeAll(async () => {
    // Setup application with test config pointing to test RabbitMQ
  });
  
  it('should publish and receive messages', async () => {
    // Publish a test message
    await messagingService.publish('test.event', { data: 'test' });
    
    // Wait for processing
    await new Promise(r => setTimeout(r, 100));
    
    // Verify the handler was called (via spy or state check)
  });
});
```

## References

- [NestJS Microservices Documentation](https://docs.nestjs.com/microservices/basics)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [Event-Driven Architecture ADR](./ADR/ADR-002-Event-Driven-Communication.md)
- [Messaging Component Diagram](./C3-MessagingComponent.md)
