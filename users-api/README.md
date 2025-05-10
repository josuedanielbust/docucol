# Users API

This project is a NestJS application designed for user management and authentication. It utilizes Prisma.js for database interactions and RabbitMQ for messaging as part of the DocuCol architecture.

## 1. System Context

The Users API serves as the central authentication and user management service within the DocuCol ecosystem. It manages user identities, handles authentication requests, and broadcasts user-related events to other services.

```mermaid
C4Context
title System Context Diagram - Users API

Person(user, "User", "A user of the DocuCol system")
System(usersAPI, "Users API", "Handles user authentication and management")
System_Ext(database, "Database", "Stores user information")
System_Ext(rabbitmq, "RabbitMQ", "Message broker for event distribution")
System(otherServices, "Other DocuCol Services", "Document management, workflow, etc.")

Rel(user, usersAPI, "Authenticates and manages profile")
Rel(usersAPI, database, "Stores and retrieves user data")
Rel(usersAPI, rabbitmq, "Publishes user events")
Rel(rabbitmq, otherServices, "Distributes user events")
Rel(otherServices, usersAPI, "Verifies user identity")
```

## 2. Container Architecture

The Users API is built as a NestJS application with a modular architecture following domain-driven design principles.

```mermaid
C4Container
title Container Diagram - Users API

Container(api, "API Layer", "NestJS Controllers", "Handles HTTP requests")
Container(auth, "Auth Module", "NestJS Module", "Manages authentication and authorization")
Container(users, "Users Module", "NestJS Module", "Manages user profiles and operations")
Container(messaging, "Messaging Module", "NestJS Module", "Handles event publishing and subscribing")
ContainerDb(prisma, "Prisma Service", "ORM", "Database access layer")
Container_Ext(rmq, "RabbitMQ Client", "Message Broker Client", "Connects to RabbitMQ")
System_Ext(db, "Database", "PostgreSQL", "Stores user data")
System_Ext(queue, "Message Queue", "RabbitMQ", "Event distribution")

Rel(api, auth, "Uses")
Rel(api, users, "Uses")
Rel(auth, prisma, "Uses")
Rel(users, prisma, "Uses")
Rel(users, messaging, "Publishes events")
Rel(messaging, rmq, "Uses")
Rel(prisma, db, "Connects to")
Rel(rmq, queue, "Connects to")
```

## 3. Component Architecture

### Auth Module
Handles user authentication, registration, and authorization through JWT tokens.

```mermaid
C4Component
title Component Diagram - Auth Module

Component(authController, "Auth Controller", "NestJS Controller", "Exposes authentication endpoints")
Component(authService, "Auth Service", "NestJS Service", "Handles authentication logic")
Component(jwtStrategy, "JWT Strategy", "Passport Strategy", "Validates JWT tokens")
Component(jwtGuard, "JWT Guard", "NestJS Guard", "Protects routes with JWT")
Component(decorator, "Auth Decorators", "Custom Decorators", "Role-based access control")

Rel(authController, authService, "Uses")
Rel(authService, jwtStrategy, "Uses")
Rel(jwtGuard, jwtStrategy, "Uses")
Rel(decorator, jwtGuard, "Enhances")
```

### Messaging Module
Provides integration with RabbitMQ for event-driven architecture.

```mermaid
C4Component
title Component Diagram - Messaging Module

Component(messagingService, "Messaging Service", "NestJS Service", "Publishes and subscribes to messages")
Component(explorer, "Message Explorer", "Service", "Discovers subscriber methods")
Component(decorator, "RabbitSubscriber Decorator", "Decorator", "Marks methods as subscribers")
Component(rmqClient, "RabbitMQ Client", "ClientProxy", "Connects to RabbitMQ")

Rel(messagingService, rmqClient, "Uses")
Rel(messagingService, explorer, "Uses")
Rel(explorer, decorator, "Finds")
```

## 4. Architecture Decision Records (ADRs)

### ADR-001: Hybrid Application Architecture
**Context**: The application needs to serve both HTTP requests and handle asynchronous messages.

**Decision**: Implement a hybrid NestJS application that supports both HTTP and microservice transports.

**Status**: Accepted

**Consequences**: 
- Enables the service to respond to both synchronous API requests and asynchronous events
- Increases complexity in application setup and configuration
- Provides better separation of concerns between API endpoints and event handlers

### ADR-002: Event-Driven Communication
**Context**: Services within DocuCol need to communicate effectively while remaining loosely coupled.

**Decision**: Use RabbitMQ for event-driven communication between services.

**Status**: Accepted

**Consequences**:
- Reduces direct dependencies between services
- Improves system resilience through message persistence
- Enables easy scaling of individual services
- Introduces complexity in ensuring message delivery and handling

### ADR-003: Prisma as ORM
**Context**: The service needs efficient and type-safe database access.

**Decision**: Use Prisma as the ORM for database operations.

**Status**: Accepted

**Consequences**:
- Provides type safety through generated TypeScript types
- Simplifies database operations with its fluent API
- Migrations can be versioned and managed through code
- May have performance overhead compared to raw SQL in some cases

## Features

- User registration and authentication
- User profile management
- Role-based access control
- JWT-based authentication
- Integration with RabbitMQ for event-driven architecture

## Technologies Used

- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications
- **Prisma**: A modern database toolkit that simplifies database access and management
- **RabbitMQ**: A message broker that facilitates communication between different parts of the application
- **Passport & JWT**: Authentication and authorization middleware
- **bcrypt**: Library for password hashing and verification

## Project Structure

```
users-api
├── src
│   ├── app.module.ts
│   ├── main.ts
│   ├── config
│   │   └── configuration.ts
│   ├── auth
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── decorators/
│   │   ├── dto/
│   │   └── jwt/
│   ├── messaging
│   │   ├── constants.ts
│   │   ├── decorators
│   │   │   └── rabbit-subscriber.decorator.ts
│   │   ├── interfaces
│   │   │   └── message.interface.ts
│   │   ├── messaging.explorer.ts
│   │   ├── messaging.module.ts
│   │   └── messaging.service.ts
│   ├── prisma
│   │   ├── prisma.module.ts
│   │   ├── prisma.service.ts
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── transfer/
│   └── users/
├── test
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── .env
├── Dockerfile
├── Makefile
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd users-api
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Configuration

Create a `.env` file in the root directory with the following environment variables:

```
# Application
APP_PORT=3000
APP_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/users_db?schema=public"

# Authentication
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="1d"

# RabbitMQ
RABBITMQ_URL="amqp://guest:guest@localhost:5672"
# Or individual connection parameters
RABBITMQ_HOST="localhost"
RABBITMQ_PORT=5672
RABBITMQ_USERNAME="guest"
RABBITMQ_PASSWORD="guest"
RABBITMQ_QUEUE="docucol"
```

## Running the Application

### Using npm

```bash
# Generate Prisma client and start the application
npm run start:fresh

# Development mode with hot-reload
npm run dev
```

### Using Make

```bash
# Generate Prisma client
make prisma-generate

# Run Prisma migrations
make prisma-migrate

# Open Prisma Studio
make prisma-studio
```

### Using Docker

```bash
# Build Docker image
make docker-build

# Run Docker container
make docker-run
```

## RabbitMQ Integration

The application uses RabbitMQ for event-driven communication:

- **Publishers**: The `MessagingService` provides methods to publish messages to RabbitMQ.
- **Subscribers**: Use the `@RabbitSubscriber()` decorator to subscribe to specific message patterns.

### Messaging Architecture

The Users API implements a hybrid application model:

1. **HTTP Server**: Handles synchronous API requests
2. **RabbitMQ Consumer**: Processes asynchronous events from other services

The messaging module connects to RabbitMQ with these key components:

- **MessagingModule**: Configures RabbitMQ connection and provides services
- **MessagingService**: Offers methods for publishing messages to RabbitMQ
- **MessagingExplorer**: Automatically discovers methods decorated with @RabbitSubscriber
- **RabbitSubscriber Decorator**: Marks methods as subscribers to specific event patterns

### Message Patterns

Users API publishes these event types:
- `user.created`: When a new user is registered
- `user.updated`: When user information is modified
- `user.deleted`: When a user account is removed

Users API subscribes to these event types:
- `document.ownership.updated`: When document ownership changes
- `transfer.confirmed`: When a document transfer is completed

### Example Publisher

```typescript
@Injectable()
export class UserService {
  constructor(private messagingService: MessagingService) {}

  async createUser(userData: CreateUserDto): Promise<User> {
    // Create user logic
    const user = await this.prismaService.user.create({ data: userData });
    
    // Publish event
    await this.messagingService.publish('user.created', user);
    
    return user;
  }
}
```

### Example Subscriber

```typescript
@Injectable()
export class UserEventHandler {
  @RabbitSubscriber({ pattern: 'user.created' })
  async handleUserCreated(data: UserCreatedEvent) {
    // Handle the user created event
    console.log('User created:', data);
  }
}
```

## Testing

### Unit Tests

```bash
# Run unit tests
npm test
```

### End-to-End Tests

```bash
# Run e2e tests
npm run test:e2e
```

The e2e tests cover:
- User registration and authentication
- User profile management
- Access control

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | /auth/signup | Register new user | No |
| POST | /auth/signin | Authenticate user | No |
| GET | /users | List all users | Yes |
| GET | /users/:id | Get single user | Yes |
| PATCH | /users/:id | Update user | Yes |
| DELETE | /users/:id | Delete user | Yes |

## License

This project is licensed under the MIT License.
