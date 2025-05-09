# Document API

## Overview

This service is part of the DocuCol system, responsible for document management operations including upload, storage, retrieval, and deletion. It utilizes Prisma.js for database interactions, MinIO for file storage, and RabbitMQ for asynchronous communication with other services.

## Architecture

### System Context

The Document API is a core component in the DocuCol system that serves as the primary interface for document operations. It interacts with external clients, storage systems, and other microservices through defined interfaces.

```mermaid
C4Context
title Document API System Context

Person(user, "User", "A user of the DocuCol system")
System(documentApi, "Document API", "Handles document operations including upload, storage, retrieval, and deletion")
System_Ext(storageSystem, "MinIO Storage", "Object storage for document files")
System_Ext(database, "PostgreSQL Database", "Stores document metadata")
System_Ext(messageBus, "RabbitMQ", "Message broker for inter-service communication")
System_Ext(processingService, "Document Processing Service", "Processes documents for text extraction and analysis")

Rel(user, documentApi, "Uses", "REST API")
Rel(documentApi, storageSystem, "Stores files in", "S3 API")
Rel(documentApi, database, "Reads and writes data to", "Prisma ORM")
Rel(documentApi, messageBus, "Publishes events to", "AMQP")
Rel(messageBus, processingService, "Delivers messages to")
Rel(processingService, messageBus, "Sends processing status to")
Rel(documentApi, messageBus, "Subscribes to events from", "AMQP")
```

### Container Diagram

```mermaid
C4Container
title Document API Container Diagram

Container(apiController, "API Controller", "NestJS", "Handles HTTP requests and responses")
Container(documentService, "Document Service", "NestJS", "Business logic for document operations")
Container(messagingService, "Messaging Service", "NestJS", "Handles message publishing and subscription")
Container(prismaService, "Prisma Service", "NestJS/Prisma", "Database access layer")
Container(minioService, "MinIO Client", "NestJS/MinIO", "Object storage client")

System_Ext(db, "PostgreSQL", "Document metadata storage")
System_Ext(minio, "MinIO", "Document file storage")
System_Ext(rabbitmq, "RabbitMQ", "Message broker")

Rel(apiController, documentService, "Uses")
Rel(documentService, prismaService, "Uses")
Rel(documentService, minioService, "Uses")
Rel(documentService, messagingService, "Uses")
Rel(prismaService, db, "Connects to")
Rel(minioService, minio, "Stores files in")
Rel(messagingService, rabbitmq, "Publishes to and subscribes from")
```

## Features

- Upload documents with metadata and file attachments
- Store files securely in MinIO object storage
- Retrieve a list of uploaded documents
- Update and delete document functionality
- Integration with RabbitMQ for event-driven architecture
- Publish events when documents are uploaded or deleted
- Subscribe to document processing events

## Technologies Used

- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications
- **Prisma**: A modern database toolkit that simplifies database access and management
- **MinIO**: A high-performance object storage system compatible with Amazon S3 API
- **RabbitMQ**: A message broker that facilitates communication between different parts of the application
- **NestJS Microservices**: For easy integration with message brokers like RabbitMQ

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
│   │   ├── messaging.controller.ts
│   │   └── events
│   │       └── document.events.ts
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

Create a `.env` file in the root directory and add your database connection string, MinIO, and RabbitMQ credentials:

```
DATABASE_URL=postgresql://user:password@localhost:5432/mydb

# MinIO Configuration
MINIO_HOST=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=documents
MINIO_PUBLIC_URL=http://localhost:9000

# RabbitMQ Configuration
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_QUEUE_PREFIX=docucol_
RABBITMQ_DOCUMENT_EXCHANGE=document_events

# App Configuration
PORT=3000
```

## Message Events

The application publishes and subscribes to the following RabbitMQ events:

### Published Events

- **document.uploaded**: When a new document is uploaded
  - Payload: `{ id: string, title: string, userId: string, fileName: string, filePath: string }`
  - Exchange: `docucol`
  - Routing Key: `document.uploaded`

- **document.deleted**: When a document is deleted
  - Payload: `{ id: string, userId: string }`
  - Exchange: `docucol`
  - Routing Key: `document.deleted`

### Subscribed Events

- **document.processing**: Updates about document processing status from other services
  - Payload: `{ id: string, status: 'started'|'completed'|'failed', metadata?: any, error?: string }`
  - Exchange: `docucol`
  - Routing Key: `document.processing`

Make sure the RabbitMQ server is running and accessible before starting the application.

## Running the Application

To start the application, run:
```
npm run start
```

For production:
```
npm run build
npm run start:prod
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

- **POST /documents**
  - Purpose: Upload a new document with file attachment
  - Authentication: Required
  - Request: 
    - Content-Type: `multipart/form-data`
    - Body:
      - `file`: The document file to upload (Required)
      - `title`: Document title (Required)
      - `userId`: ID of the user who owns the document (Required)
  - Response: 
    - Status: 201 Created
    - Body: JSON object with document details
    ```json
    {
      "id": "uuid",
      "title": "Document Title",
      "userId": "user-uuid",
      "fileName": "original-filename.pdf",
      "filePath": "stored-path/filename.pdf",
      "createdAt": "2023-07-15T10:30:00Z",
      "updatedAt": "2023-07-15T10:30:00Z"
    }
    ```
  - Error Responses:
    - 400 Bad Request: Invalid input
    - 401 Unauthorized: Authentication failed
    - 500 Internal Server Error: Server processing error

- **GET /documents**
  - Purpose: Retrieve all documents
  - Authentication: Required
  - Response: 
    - Status: 200 OK
    - Body: Array of document objects
  - Error Responses:
    - 401 Unauthorized: Authentication failed
    - 500 Internal Server Error: Server processing error

- **GET /documents/user/:userId**
  - Purpose: Retrieve all documents for a specific user
  - Authentication: Required
  - Parameters: 
    - `userId`: ID of the user whose documents to retrieve
  - Response: 
    - Status: 200 OK
    - Body: Array of document objects
  - Error Responses:
    - 401 Unauthorized: Authentication failed
    - 404 Not Found: User not found
    - 500 Internal Server Error: Server processing error

- **GET /documents/:id**
  - Purpose: Retrieve a specific document by ID
  - Authentication: Required
  - Parameters:
    - `id`: Document ID
  - Response:
    - Status: 200 OK
    - Body: Document object
  - Error Responses:
    - 401 Unauthorized: Authentication failed
    - 404 Not Found: Document not found
    - 500 Internal Server Error: Server processing error

- **DELETE /documents/:id**
  - Purpose: Delete a document
  - Authentication: Required
  - Parameters:
    - `id`: Document ID
  - Response:
    - Status: 200 OK
    - Body: Success message
  - Error Responses:
    - 401 Unauthorized: Authentication failed
    - 404 Not Found: Document not found
    - 500 Internal Server Error: Server processing error

## Non-Functional Requirements

### Performance
- API response time should be under 200ms for metadata operations
- File upload operations should complete within 5 seconds for files up to 10MB
- Should support concurrent uploads from multiple clients

### Security
- All API endpoints require authentication
- Document access is restricted to the document owner
- File storage uses MinIO with proper access controls
- Environment variables used for all sensitive configuration

### Scalability
- Stateless design enables horizontal scaling
- Database operations are optimized for high throughput
- Asynchronous processing via message broker reduces coupling

### Reliability
- Error handling for all operations with appropriate status codes
- Transaction support for database operations
- Logging for all critical operations and errors
- Graceful degradation when dependent services are unavailable

## File Storage

By default, uploaded files are stored in the `uploads` directory at the root of the project. This location can be customized by setting the `UPLOADS_DIRECTORY` environment variable.

In production, files are stored in MinIO, which provides an S3-compatible object storage interface.

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

## Integration Points

### External Systems
- **PostgreSQL Database**: Stores document metadata
- **MinIO**: Stores document files
- **RabbitMQ**: Facilitates communication with other microservices

### Dependent Services
- **Authentication Service**: Verifies user credentials and permissions
- **Document Processing Service**: Processes uploaded documents for text extraction

## License

This project is licensed under the MIT License.