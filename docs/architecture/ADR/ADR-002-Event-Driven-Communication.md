# ADR-002: Event-Driven Communication with RabbitMQ

## Status
Accepted

## Date
2023-04-17

## Context
DocuCol consists of multiple microservices that need to communicate efficiently while maintaining loose coupling. We need to determine the best communication pattern for inter-service communication that supports our scalability, resilience, and maintainability goals.

## Decision
We will implement an event-driven architecture using RabbitMQ as our message broker, with each service producing and consuming events relevant to its domain.

## Detailed Design

### Message Broker
- **RabbitMQ**: Selected for its reliability, maturity, and support for multiple messaging patterns

### Queue Structure
- Each service will have a dedicated queue following the naming pattern: `{base_queue_name}_{service_name}`
- Example: `docucol_users`, `docucol_documents`, `docucol_transfers`

### Message Patterns
1. **Event Notifications**: Services publish domain events when significant state changes occur
2. **Command Messages**: Services can request actions from other services via direct commands
3. **Query Messages**: When services need data from other services (used selectively)

### Implementation Details
- **NestJS Integration**: Using NestJS Microservices module for RabbitMQ integration
- **Dynamic Discovery**: Custom decorator pattern for automatic subscription discovery
- **Hybrid Services**: Both HTTP endpoints and message consumers within each service
- **Acknowledgment Mode**: Explicit acknowledgment required for reliable message processing

### Queue Configuration
```typescript
{
  transport: Transport.RMQ,
  options: {
    urls: [rabbitMqUrl],
    queue: queueName,
    queueOptions: {
      durable: true,  // Survive broker restarts
    },
    noAck: false,     // Explicit acknowledgment required
  }
}
```

## Rationales

1. **Loose Coupling**: Services only need to know about events, not the specifics of other services
2. **Scalability**: Services can be scaled independently based on message processing needs
3. **Resilience**: Message persistence ensures no data loss even if a service is temporarily down
4. **Asynchronous Processing**: Services can process events at their own pace
5. **Event Sourcing Support**: Architectural foundation for potential event sourcing in the future
6. **Observability**: Central point for message monitoring and tracing

## Consequences

### Positive
- Reduced direct dependencies between services
- Improved system resilience through message persistence
- Easier horizontal scaling of individual services
- Better handling of traffic spikes through queue buffering
- Foundation for implementing CQRS patterns if needed

### Negative
- Increased complexity in system architecture
- Eventual consistency challenges
- More complex testing and debugging scenarios
- Need for error handling and dead letter strategies
- Operational overhead of managing RabbitMQ

## Implementation Strategy

1. **Core Messaging Module**: Create reusable messaging module pattern for all services
2. **Decorator Pattern**: Implement `@RabbitSubscriber()` decorator for declarative subscriptions
3. **Message Explorer**: Use reflection to automatically discover and register subscribers
4. **Consistent Naming**: Standardize event names across the system (e.g., `user.created`)
5. **Error Handling**: Implement consistent error handling for message processing
6. **Schema Validation**: Validate message structure to ensure compatibility

## Alternatives Considered

### REST API Calls
- **Pros**: Simpler implementation, synchronous responses
- **Cons**: Tighter coupling, less resilient, potential performance issues
- **Rejected** due to coupling concerns and scalability limitations

### gRPC
- **Pros**: High performance, strong typing, bi-directional streaming
- **Cons**: Less mature ecosystem, steeper learning curve
- **Rejected** in favor of more mature message broker solution

### Kafka
- **Pros**: Excellent for high-volume event streaming, long-term event storage
- **Cons**: More complex to operate, potentially overkill for our current scale
- **Considered** for future adoption as system scales

## References
- [NestJS Microservices Documentation](https://docs.nestjs.com/microservices/basics)
- [RabbitMQ Patterns](https://www.rabbitmq.com/getstarted.html)
- [Enterprise Integration Patterns](https://www.enterpriseintegrationpatterns.com/)
- [C3-MessagingComponent](../C3-MessagingComponent.md)
