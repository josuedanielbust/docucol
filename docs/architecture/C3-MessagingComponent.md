# Messaging Architecture (C3)

## Overview

The DocuCol system implements a robust messaging architecture using RabbitMQ to enable asynchronous communication between microservices. This design facilitates loose coupling, improved resilience, and scalability across the system.

## Component Diagram

```mermaid
C4Component
title Messaging Architecture - Component Diagram

Container_Boundary(usersApi, "Users API") {
    Component(usersApiApp, "NestJS Application", "NestJS", "Handles user management and authentication")
    Component(usersMsgModule, "Messaging Module", "NestJS", "Handles message publishing and subscribing")
    Component(usersMsgService, "Messaging Service", "NestJS", "Provides methods for publishing messages")
    Component(usersMsgExplorer, "Message Explorer", "NestJS", "Discovers subscriber methods using reflection")
    Component(usersRmqClient, "RabbitMQ Client", "NestJS ClientProxy", "Connects to RabbitMQ message broker")
}

Container_Boundary(documentApi, "Document API") {
    Component(docsApiApp, "NestJS Application", "NestJS", "Handles document management")
    Component(docsMsgModule, "Messaging Module", "NestJS", "Handles message publishing and subscribing")
    Component(docsMsgService, "Messaging Service", "NestJS", "Provides methods for publishing messages")
    Component(docsMsgController, "Messaging Controller", "NestJS", "Handles incoming message events")
    Component(docsRmqClient, "RabbitMQ Client", "NestJS ClientProxy", "Connects to RabbitMQ message broker")
}

Container_Boundary(interopApi, "Interop API") {
    Component(interopApiApp, "NestJS Application", "NestJS", "Handles integration with external systems")
    Component(interopMsgModule, "Messaging Module", "NestJS", "Handles message publishing and subscribing")
    Component(interopMsgService, "Messaging Service", "NestJS", "Provides methods for publishing messages")
    Component(interopMsgExplorer, "Message Explorer", "NestJS", "Discovers subscriber methods using reflection")
    Component(interopRmqClient, "RabbitMQ Client", "NestJS ClientProxy", "Connects to RabbitMQ message broker")
    Component(transferModule, "Transfer Module", "NestJS", "Handles document transfers between users")
}

System_Ext(rabbitmq, "RabbitMQ", "Message broker for inter-service communication")

Rel(usersMsgService, usersRmqClient, "Uses")
Rel(usersMsgExplorer, usersMsgService, "Registers subscribers with")
Rel(usersMsgModule, usersMsgService, "Provides")
Rel(usersMsgModule, usersMsgExplorer, "Uses")
Rel(usersApiApp, usersMsgModule, "Uses")

Rel(docsMsgService, docsRmqClient, "Uses")
Rel(docsMsgController, docsMsgService, "Uses")
Rel(docsMsgModule, docsMsgService, "Provides")
Rel(docsMsgModule, docsMsgController, "Registers")
Rel(docsApiApp, docsMsgModule, "Uses")

Rel(interopMsgService, interopRmqClient, "Uses")
Rel(interopMsgExplorer, interopMsgService, "Registers subscribers with")
Rel(interopMsgModule, interopMsgService, "Provides")
Rel(interopMsgModule, interopMsgExplorer, "Uses")
Rel(interopApiApp, interopMsgModule, "Uses")
Rel(transferModule, interopMsgService, "Uses")

Rel(usersRmqClient, rabbitmq, "Connects to")
Rel(docsRmqClient, rabbitmq, "Connects to")
Rel(interopRmqClient, rabbitmq, "Connects to")
```

## Message Flow Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant UsersAPI
    participant RabbitMQ
    participant DocumentAPI
    participant InteropAPI

    User->>UsersAPI: Create user account
    UsersAPI->>RabbitMQ: Publish user.created event
    RabbitMQ-->>DocumentAPI: Deliver user.created event
    RabbitMQ-->>InteropAPI: Deliver user.created event
    
    User->>DocumentAPI: Upload document
    DocumentAPI->>RabbitMQ: Publish document.uploaded event
    RabbitMQ-->>InteropAPI: Deliver document.uploaded event
    
    User->>InteropAPI: Transfer document
    InteropAPI->>RabbitMQ: Publish transfer.initiated event
    RabbitMQ-->>DocumentAPI: Deliver transfer.initiated event
    DocumentAPI->>RabbitMQ: Publish document.ownership.updated event
    RabbitMQ-->>UsersAPI: Deliver document.ownership.updated event
```

## Queue Architecture

Each microservice in DocuCol uses dedicated queues to ensure proper message delivery:

1. **Users API Queue**: 
   - Queue name: `{rabbitmq.queue}_users`
   - Handles user-related events like registration, updates, and profile changes

2. **Document API Queue**: 
   - Queue name: `{rabbitmq.queue}_documents`
   - Processes document-related events such as uploads, updates, and deletions

3. **Transfer Queue**: 
   - Queue name: `{rabbitmq.queue}_transfer`
   - Manages document transfer requests between users

4. **Interop API Queue**:
   - Queue name: `{rabbitmq.queue}`
   - Handles events related to external system integration

## Message Discovery and Registration

DocuCol implements a dynamic message subscription discovery system:

1. **Messaging Explorer**:
   - Uses NestJS's `DiscoveryService` to scan for methods decorated with `@RabbitSubscriber`
   - Automatically registers these methods as message handlers
   - Provides a declarative way to define message consumers

2. **Message Subscriber Decorator**:
   - Custom decorator (`@RabbitSubscriber`) marks methods as message subscribers
   - Defines which message patterns a method should handle
   - Stores metadata that's later discovered by the MessagingExplorer

## Connection Configuration

Services connect to RabbitMQ using a consistent configuration pattern:

```typescript
ClientsModule.registerAsync([
  {
    name: RABBIT_PROVIDER,
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
      transport: Transport.RMQ,
      options: {
        urls: [configService.get<string>('rabbitmq.url') || 
              `amqp://${configService.get<string>('rabbitmq.username')}:${configService.get<string>('rabbitmq.password')}@${configService.get<string>('rabbitmq.host')}:${configService.get<number>('rabbitmq.port')}`],
        queue: `${configService.get<string>('rabbitmq.queue')}_[service-specific-suffix]`,
        queueOptions: {
          durable: true,
        },
      },
    }),
    inject: [ConfigService],
  },
]),
```

This pattern allows for consistent configuration across services while enabling service-specific queue names.

## Hybrid Application Structure

The Users API and Document API implement a hybrid application structure:

1. **HTTP API**: Handles synchronous REST requests from clients
2. **Microservice Listener**: Processes asynchronous messages from RabbitMQ

This dual-mode operation is configured in each service's `main.ts`:

```typescript
// Create HTTP application
const app = await NestFactory.create(AppModule);

// Connect microservice transport
app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.RMQ,
  options: {
    urls: [rabbitMqUrl],
    queue: `${configService.get<string>('rabbitmq.queue')}_[service-name]`,
    queueOptions: { durable: true },
    noAck: false, // Explicit acknowledgment required
  },
});

// Start both HTTP and microservice modes
await app.startAllMicroservices();
await app.listen(port);
```

## Error Handling and Message Acknowledgment

The system implements reliable messaging with explicit acknowledgments:

1. **Message Acknowledgment**: 
   - `noAck: false` configuration requires explicit message acknowledgment
   - Prevents message loss when processing fails

2. **Error Handling**:
   - Services implement error handling around message processing
   - Failed messages can be retried or sent to dead-letter queues

## References

- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [ADR-002: Event-Driven Communication](./ADR/ADR-002-Event-Driven-Communication.md)
- [C2-Containers](./C2-Containers.md)
