# Document API

This project is a NestJS application designed for uploading and retrieving documents. It utilizes Prisma.js for database interactions and RabbitMQ for messaging.

## Features

- Upload documents with metadata and file attachments
- Store files securely on the server's file system
- Retrieve a list of uploaded documents
- Update and delete document functionality
- Integration with RabbitMQ for event-driven architecture

## Technologies Used

- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications
- **Prisma**: A modern database toolkit that simplifies database access and management
- **RabbitMQ**: A message broker that facilitates communication between different parts of the application
- **Multer**: Middleware for handling multipart/form-data, used for file uploads

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
```
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
RABBITMQ_URL=amqp://user:password@localhost:5672
RABBITMQ_QUEUE=document_uploads
PORT=3000
UPLOADS_DIRECTORY=./uploads
```
Make sure to replace the placeholders with your actual database and RabbitMQ credentials.

## Running the Application

To start the application, run:
```
npm run start
```

For production:
```
npm run build npm run start:prod
```

To run the application in development mode with hot reloading:
```
npm run start:dev
```

To run the application in watch mode:
```
npm run start:watch
```

## API Endpoints

### Documents

- **POST /documents** - Upload a document with file attachment
  - Request: multipart/form-data with fields:
    - `file`: The document file to upload
    - `title`: Document title
    - `userId`: ID of the user who owns the document
  - Response: JSON object with document details including ID and file metadata

- **GET /documents** - Retrieve all documents
  - Response: Array of document objects

- **GET /documents/user/:userId** - Retrieve all documents for a specific user
  - Response: Array of document objects belonging to the specified user

- **GET /documents/:id** - Retrieve a specific document by ID
  - Response: Document object

- **DELETE /documents/:id** - Delete a document
  - Response: Success status

## File Storage

By default, uploaded files are stored in the `uploads` directory at the root of the project. This location can be customized by setting the `UPLOADS_DIRECTORY` environment variable.

## Testing

To run the end-to-end tests:
```
npm run test:e2e
```

To run the unit tests:
```
npm run test
```

To run the tests with coverage:
```
npm run test:cov
```

## License

This project is licensed under the MIT License.