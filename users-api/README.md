# Document API

This project is a NestJS application designed for uploading and retrieving documents. It utilizes Prisma.js for database interactions and RabbitMQ for messaging.

## Features

- Upload documents with metadata.
- Retrieve a list of uploaded documents.
- Integration with RabbitMQ for event-driven architecture.

## Technologies Used

- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications.
- **Prisma**: A modern database toolkit that simplifies database access and management.
- **RabbitMQ**: A message broker that facilitates communication between different parts of the application.

## Project Structure

```
document-api
├── src
│   ├── app.module.ts
│   ├── main.ts
│   ├── config
│   │   └── configuration.ts
│   ├── documents
│   │   ├── documents.controller.ts
│   │   ├── documents.module.ts
│   │   ├── documents.service.ts
│   │   ├── dto
│   │   │   ├── create-document.dto.ts
│   │   │   └── update-document.dto.ts
│   │   └── entities
│   │       └── document.entity.ts
│   ├── messaging
│   │   ├── messaging.module.ts
│   │   ├── messaging.service.ts
│   │   └── events
│   │       └── document-uploaded.event.ts
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
   cd document-api
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Configuration

Create a `.env` file in the root directory and add your database connection string and RabbitMQ credentials.

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