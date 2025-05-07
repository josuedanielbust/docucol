# Users API

This project is a NestJS application designed for user management and authentication. It utilizes Prisma.js for database interactions and RabbitMQ for messaging as part of the DocuCol architecture.

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

Create a `.env` file in the root directory and add your database connection string and RabbitMQ credentials.

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

Example subscriber:
```typescript
@RabbitSubscriber({ pattern: 'user.created' })
async handleUserCreated(data: UserCreatedEvent) {
  // Handle the user created event
}
```

## Testing

To run the end-to-end tests, use:
```
npm run test:e2e
```

## License

This project is licensed under the MIT License.
