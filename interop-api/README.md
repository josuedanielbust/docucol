# Interop API

This service is designed to provide an interoperation layer between DocuCol and external government systems. It provides authentication, user management, and connectivity to government document services.

## Features

- User authentication and management
- Integration with government document systems
- Document validation and retrieval
- Secure document history tracking
- Asynchronous messaging via RabbitMQ for document transfers

## Technologies Used

- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications.
- **Prisma**: A modern database toolkit that simplifies database access and management.
- **JWT**: JSON Web Tokens for secure authentication.
- **RabbitMQ**: Message broker for asynchronous communication between services.

## Modules

### Auth Module
Handles user authentication, providing secure access to the API.

### Users Module
Manages user profiles and information.

### GovApi Module
Connects to external government APIs to validate users and retrieve official documents.

### Transfer Module
Manages document transfers between users and sends notifications through RabbitMQ.

### Messaging Module
Handles asynchronous communication via RabbitMQ for reliable event-driven processes.

## Project Structure

```
interop-api
├── src
│   ├── app.module.ts
│   ├── main.ts
│   ├── config
│   │   └── configuration.ts
│   ├── auth
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   └── dto
│   │       ├── login.dto.ts
│   │       └── register.dto.ts
│   ├── users
│   │   ├── users.controller.ts
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   └── entities
│   │       └── user.entity.ts
│   ├── govapi
│   │   ├── govapi.controller.ts
│   │   ├── govapi.module.ts
│   │   ├── govapi.service.ts
│   │   └── entities
│   │       └── document.entity.ts
│   ├── transfer
│   │   ├── transfer.controller.ts
│   │   ├── transfer.module.ts
│   │   ├── transfer.service.ts
│   │   └── dto
│   │       └── transfer.dto.ts
│   ├── messaging
│   │   ├── messaging.module.ts
│   │   ├── messaging.service.ts
│   │   └── dto
│   │       └── message.dto.ts
│   └── prisma
│       ├── prisma.module.ts
│       ├── prisma.service.ts
│       └── schema.prisma
├── test
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── .env
├── .gitignore
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
   cd interop-api
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Configuration

Create a `.env` file in the root directory and add the following:

```
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
JWT_SECRET=your_jwt_secret
GOV_CARPETA_BASE_URL=https://govcarpeta-apis-4905ff3c005b.herokuapp.com
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE=documents_queue
```

## Running the Application

To start the application, run:
```
npm run start
```

## Testing

To run the end-to-end tests, use:
```
npm run test:e2e
```

## License

This project is licensed under the MIT License.