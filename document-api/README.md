# Document API

## Overview

This service is a core component of the DocuCol system, responsible for document management operations including upload, storage, retrieval, and deletion. It serves as the central repository for all document-related operations in the DocuCol platform. 

The Document API implements the following architectural decisions:
- Uses a microservice architecture ([ADR-001-Microservice-Architecture](../docs/architecture/ADR/ADR-001-Microservice-Architecture.md))
- Implements event-driven communication patterns ([ADR-002-Event-Driven-Communication](../docs/architecture/ADR/ADR-002-Event-Driven-Communication.md))
- Follows the document storage strategy ([ADR-008-Document-Storage-Strategy](../docs/architecture/ADR/ADR-008-Document-Storage-Strategy.md))
- Provides HTTP services for document storage ([ADR-009-Document-Storage-HTTP-Service](../docs/architecture/ADR/ADR-009-Document-Storage-HTTP-Service.md))
- Supports document transfer features ([ADR-011-Document-Transfer-Feature](../docs/architecture/ADR/ADR-011-Document-Transfer-Feature.md))
- Utilizes MinIO for object storage ([ADR-012-Migrate-to-MinIO-Storage](../docs/architecture/ADR/ADR-012-Migrate-to-MinIO-Storage.md))

### Key Technologies
- **NestJS**: Framework for server-side application development
- **Prisma.js**: Database ORM for PostgreSQL interactions
- **MinIO**: S3-compatible object storage for document files
- **RabbitMQ**: Message broker for event-driven communication

## Architecture

### System Context (C1)

The Document API is a core component in the DocuCol system that serves as the primary interface for document operations. It interacts with external clients, storage systems, and other microservices through defined interfaces as documented in [C1-SystemContext](../docs/architecture/C1-SystemContext.md).

```mermaid
C4Context
title Document API System Context

Person(user, "User", "A user of the DocuCol system")
System(documentApi, "Document API", "Handles document operations including upload, storage, retrieval, and deletion")
System(usersApi, "Users API", "Manages user authentication and profiles")
System(interopApi, "Interop API", "Handles communication with government systems")
System(notificationsApi, "Notifications API", "Sends notifications to users")
System_Ext(storageSystem, "MinIO Storage", "Object storage for document files")
System_Ext(database, "PostgreSQL Database", "Stores document metadata")
System_Ext(messageBus, "RabbitMQ", "Message broker for inter-service communication")

Rel(user, documentApi, "Uses", "REST API")
Rel(documentApi, storageSystem, "Stores files in", "S3 API")
Rel(documentApi, database, "Reads and writes data to", "Prisma ORM")
Rel(documentApi, messageBus, "Publishes events to", "AMQP")
Rel(documentApi, usersApi, "Verifies users with", "REST API")
Rel(documentApi, interopApi, "Transfers documents to", "Events")
Rel(documentApi, notificationsApi, "Triggers notifications via", "Events")
Rel(messageBus, notificationsApi, "Delivers messages to")
```

### Container Diagram (C2)

This diagram shows the internal structure of the Document API microservice as part of the DocuCol container architecture documented in [C2-Containers](../docs/architecture/C2-Containers.md).

```mermaid
C4Container
title Document API Container Diagram

Container(apiController, "API Controller", "NestJS", "Handles HTTP requests and responses")
Container(documentService, "Document Service", "NestJS", "Business logic for document operations")
Container(messagingService, "Messaging Service", "NestJS", "Handles message publishing and subscription")
Container(transferService, "Transfer Service", "NestJS", "Manages document transfer operations")
Container(prismaService, "Prisma Service", "NestJS/Prisma", "Database access layer")
Container(minioService, "MinIO Client", "NestJS/MinIO", "Object storage client")

System_Ext(db, "PostgreSQL", "Document metadata storage")
System_Ext(minio, "MinIO", "Document file storage")
System_Ext(rabbitmq, "RabbitMQ", "Message broker")

Rel(apiController, documentService, "Uses")
Rel(apiController, transferService, "Uses")
Rel(documentService, prismaService, "Uses")
Rel(documentService, minioService, "Uses")
Rel(documentService, messagingService, "Uses")
Rel(transferService, messagingService, "Publishes transfer events via")
Rel(transferService, documentService, "Retrieves documents via")
Rel(prismaService, db, "Connects to")
Rel(minioService, minio, "Stores files in")
Rel(messagingService, rabbitmq, "Publishes to and subscribes from")
```

### Component Diagram (C3)

The Document API consists of several components that work together to provide document management functionality. Key components are documented in [C3-TransferComponent](../docs/architecture/C3-TransferComponent.md) and [C3-MessagingComponent](../docs/architecture/C3-MessagingComponent.md).

```mermaid
C4Component
title Document API Components

Component(docController, "Documents Controller", "NestJS", "Handles document CRUD operations via REST endpoints")
Component(docService, "Documents Service", "NestJS", "Core business logic for document management")
Component(transferController, "Transfer Controller", "NestJS", "API endpoints for document transfer operations")
Component(transferService, "Transfer Service", "NestJS", "Business logic for document transfers")
Component(messageController, "Messaging Controller", "NestJS", "Handles incoming message events")
Component(messageService, "Messaging Service", "NestJS", "Publishes and subscribes to events")
Component(fileStorage, "File Storage", "MinIO Client", "Manages object storage operations")
Component(dbAccess, "Database Access", "Prisma", "Handles database operations")

Rel(docController, docService, "Uses")
Rel(docService, fileStorage, "Stores and retrieves files via")
Rel(docService, dbAccess, "Persists metadata via")
Rel(docService, messageService, "Publishes events via")
Rel(transferController, transferService, "Uses")
Rel(transferService, docService, "Uses")
Rel(transferService, messageService, "Publishes transfer events via")
Rel(messageController, messageService, "Subscribes via")
Rel(messageService, docService, "Triggers updates via")
```

## Features

### Core Document Management
- Upload documents with metadata and file attachments
- Store files securely in MinIO object storage
- Retrieve a list of uploaded documents
- Filter documents by user ID and other parameters
- Update document metadata
- Delete documents and associated files

### Document Transfer Capabilities
- Transfer documents between users within the system
- Send documents to external government agencies via the Interop API
- Track document transfer status and history
- Support for transfer notifications

### Event-Driven Integration
- Publish events when documents are uploaded, updated, deleted, or transferred
- Subscribe to document processing events from other services
- Implement messaging patterns as defined in [messaging-patterns](../docs/architecture/messaging-patterns.md)
- Support for distributed transaction patterns

## Technologies Used

| Technology | Purpose | Architectural Significance |
|------------|---------|----------------------------|
| **NestJS** | Server-side framework | Enables modular architecture and dependency injection |
| **Prisma** | Database toolkit | Provides type-safe database access with migrations |
| **MinIO** | Object storage | S3-compatible document storage (ADR-012) |
| **RabbitMQ** | Message broker | Facilitates event-driven communication (ADR-002) |
| **NestJS Microservices** | Service integration | Simplifies implementation of microservices pattern |
| **PostgreSQL** | Database | Relational storage for document metadata |
| **TypeScript** | Programming language | Type safety and modern JavaScript features |
| **Jest** | Testing framework | Comprehensive unit and integration testing |

## Project Structure

```
document-api
├── src
│   ├── app.module.ts
│   ├── main.ts
│   ├── config/
│   │   └── configuration.ts
│   ├── documents/
│   │   ├── documents.controller.ts
│   │   ├── documents.module.ts
│   │   ├── documents.service.ts
│   │   ├── dto/
│   │   │   ├── create-document.dto.ts
│   │   │   └── update-document.dto.ts
│   │   └── entities/
│   │       └── document.entity.ts
│   ├── messaging/
│   │   ├── constants.ts
│   │   ├── messaging.controller.ts
│   │   ├── messaging.module.ts
│   │   ├── messaging.service.ts
│   │   └── events/
│   │       └── document.events.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   ├── prisma.service.ts
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── transfer/
│       ├── transfer.controller.ts
│       └── transfer.module.ts
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── uploads/          # For local file storage (legacy)
├── Dockerfile
├── Makefile
├── .env
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

## Development Guide

### Prerequisites

- Node.js (v16.x or later)
- npm (v8.x or later)
- PostgreSQL (v13.x or later)
- RabbitMQ (v3.x or later)
- MinIO (latest version)
- Docker and Docker Compose (for containerized development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/DocuCol.git
   ```
2. Navigate to the document-api directory:
   ```bash
   cd DocuCol/document-api
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
5. Setup the database:
   ```bash
   npx prisma migrate dev --name init
   ```

### Configuration

Create a `.env` file in the root directory with the following configuration parameters:

```ini
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/docucol?schema=public"

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

# API Configuration
PORT=3000
NODE_ENV=development
API_PREFIX=api
GLOBAL_PREFIX=v1
CORS_ENABLED=true
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# Security Configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRATION=1d
```

### Environment-Specific Configuration

The application uses NestJS configuration module to support different environments. Configuration files are located in `src/config/`:

- `configuration.ts`: Base configuration
- `configuration.development.ts`: Development-specific settings
- `configuration.production.ts`: Production-specific settings
- `configuration.test.ts`: Test-specific settings

### Docker Development Environment

For a containerized development environment, use the provided Docker Compose file:

```bash
# Start all required services
docker-compose -f ../services/docker-compose.yml up -d

# Build and start only the document-api service
docker-compose -f ../services/docker-compose.yml up -d --build document-api
```

## Messaging Architecture

The Document API implements an event-driven architecture using RabbitMQ as described in [ADR-002-Event-Driven-Communication](../docs/architecture/ADR/ADR-002-Event-Driven-Communication.md) and follows the messaging patterns defined in [messaging-patterns](../docs/architecture/messaging-patterns.md).

### Message Exchange Structure

```mermaid
flowchart TD
    Producer[Document API] -->|Publishes| Exchange[docucol Exchange]
    Exchange -->|document.uploaded| DocumentUploadedQueue[document.uploaded Queue]
    Exchange -->|document.deleted| DocumentDeletedQueue[document.deleted Queue]
    Exchange -->|document.transferred| DocumentTransferredQueue[document.transferred Queue]
    Consumer1[Notifications API] -->|Subscribes| DocumentUploadedQueue
    Consumer2[Interop API] -->|Subscribes| DocumentTransferredQueue
    Consumer3[Processing Service] -->|Subscribes| DocumentUploadedQueue
    ProcessingExchange[processing Exchange] -->|document.processing| DocumentProcessingQueue[document.processing Queue]
    Producer -->|Subscribes| DocumentProcessingQueue
```

### Published Events

| Event | Exchange | Routing Key | Purpose | Payload Schema |
|-------|----------|------------|---------|---------------|
| **document.uploaded** | `docucol` | `document.uploaded` | Notifies when a new document is uploaded | ```{ id: string, title: string, userId: string, fileName: string, filePath: string, fileSize: number, mimeType: string, createdAt: string }``` |
| **document.updated** | `docucol` | `document.updated` | Notifies when a document metadata is modified | ```{ id: string, title: string, userId: string, updatedFields: string[], updatedAt: string }``` |
| **document.deleted** | `docucol` | `document.deleted` | Notifies when a document is deleted | ```{ id: string, userId: string, fileName: string, deletedAt: string }``` |
| **document.transferred.internal** | `docucol` | `document.transferred.internal` | Notifies when a document is transferred internally | ```{ id: string, documentId: string, senderId: string, recipientId: string, transferType: string, createdAt: string }``` |
| **document.transferred.external** | `docucol` | `document.transferred.external` | Notifies when a document is transferred to external system | ```{ id: string, documentId: string, senderId: string, targetSystem: string, externalId: string, createdAt: string }``` |

### Subscribed Events

| Event | Exchange | Queue | Purpose | Payload Schema | Action |
|-------|----------|-------|---------|---------------|--------|
| **document.processing** | `processing` | `document.processing` | Receives updates about document processing status | ```{ id: string, status: 'started'\|'completed'\|'failed', metadata?: object, error?: string, timestamp: string }``` | Updates document metadata with processing results |
| **document.transfer.status** | `transfer` | `document.transfer.status` | Receives updates about document transfer status | ```{ transferId: string, documentId: string, status: string, targetSystem?: string, error?: string, timestamp: string }``` | Updates transfer records with status changes |
| **document.access.requested** | `access` | `document.access` | Receives requests for temporary document access | ```{ requestId: string, documentId: string, userId: string, expiresIn: number, timestamp: string }``` | Creates temporary access URLs |

### Message Reliability Features

1. **Message Acknowledgment**: Messages are acknowledged only after successful processing
2. **Dead Letter Exchange**: Failed messages are sent to a dead letter queue for later processing
3. **Message TTL**: Time-to-live configuration prevents stale messages
4. **Persistent Messages**: Important messages are marked as persistent
5. **Circuit Breaker Pattern**: Prevents cascading failures when RabbitMQ is unavailable

### Local Development

Make sure the RabbitMQ server is running and accessible before starting the application.

Using Docker:
```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

Accessing RabbitMQ Management UI (for debugging):
```
http://localhost:15672/
username: guest
password: guest
```

## Running the Application

### Development Mode

Start the application in development mode with hot reloading:

```bash
# Development mode with file watching
npm run start:dev

# Development mode with debugging enabled
npm run start:debug
```

### Production Mode

Prepare and run the application for production:

```bash
# Build the application
npm run build

# Start the production server
npm run start:prod
```

### Using Makefile

The project includes a Makefile for common operations:

```bash
# Start the development server
make dev

# Build for production
make build

# Run tests
make test

# Generate Prisma client
make prisma-generate

# Apply database migrations
make prisma-migrate
```

### Docker Deployment

Build and run as a Docker container:

```bash
# Build the Docker image
docker build -t docucol/document-api .

# Run the container
docker run -p 3000:3000 --env-file .env docucol/document-api
```

## API Reference

The Document API provides RESTful endpoints for managing document resources and implements the architectural patterns defined in [C3-ApiGateway](../docs/architecture/C3-ApiGateway.md).

### Base URL

```
https://{environment}.docucol.example/api/v1
```

### Authentication

All endpoints require authentication using JWT Bearer tokens:

```
Authorization: Bearer {token}
```

### Documents Endpoints

#### Document Creation and Retrieval

##### **POST /documents**
- **Purpose**: Upload a new document with file attachment
- **Authentication**: Required
- **Request**: 
  - Content-Type: `multipart/form-data`
  - Body:
    - `file`: The document file to upload (Required)
    - `title`: Document title (Required)
    - `description`: Document description (Optional)
    - `tags`: Array of tags (Optional)
    - `metadata`: Additional metadata JSON (Optional)
- **Response**: 
  - Status: 201 Created
  - Body: JSON object with document details
  ```json
  {
    "id": "uuid",
    "title": "Document Title",
    "description": "Document description",
    "userId": "user-uuid",
    "fileName": "original-filename.pdf",
    "filePath": "stored-path/filename.pdf",
    "fileSize": 102400,
    "mimeType": "application/pdf",
    "tags": ["contract", "legal"],
    "metadata": {
      "customField": "value"
    },
    "createdAt": "2023-07-15T10:30:00Z",
    "updatedAt": "2023-07-15T10:30:00Z"
  }
  ```
- **Error Responses**:
  - 400 Bad Request: Invalid input
  - 401 Unauthorized: Authentication failed
  - 413 Payload Too Large: File exceeds size limits
  - 415 Unsupported Media Type: File format not supported
  - 500 Internal Server Error: Server processing error

##### **GET /documents**
- **Purpose**: Retrieve all documents with filtering and pagination
- **Authentication**: Required
- **Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `sort`: Sort field (e.g., createdAt)
  - `order`: Sort order (asc|desc)
  - `search`: Search term
  - `tags`: Filter by tags (comma-separated)
- **Response**: 
  - Status: 200 OK
  - Body: 
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "title": "Document Title",
        "userId": "user-uuid",
        "fileName": "filename.pdf",
        "createdAt": "2023-07-15T10:30:00Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "totalItems": 45,
      "totalPages": 5
    }
  }
  ```
- **Error Responses**:
  - 401 Unauthorized: Authentication failed
  - 500 Internal Server Error: Server processing error

##### **GET /documents/user/:userId**
- **Purpose**: Retrieve all documents for a specific user
- **Authentication**: Required
- **Parameters**: 
  - `userId`: ID of the user whose documents to retrieve
  - Same pagination/filtering parameters as GET /documents
- **Response**: Same format as GET /documents
- **Error Responses**:
  - 401 Unauthorized: Authentication failed
  - 404 Not Found: User not found
  - 500 Internal Server Error: Server processing error

##### **GET /documents/:id**
- **Purpose**: Retrieve a specific document by ID
- **Authentication**: Required
- **Parameters**:
  - `id`: Document ID
- **Response**:
  - Status: 200 OK
  - Body: Full document object with access URL
  ```json
  {
    "id": "uuid",
    "title": "Document Title",
    "description": "Document description",
    "userId": "user-uuid",
    "fileName": "original-filename.pdf",
    "filePath": "stored-path/filename.pdf",
    "fileSize": 102400,
    "mimeType": "application/pdf",
    "accessUrl": "https://minio.docucol.example/documents/uuid?token=xyz",
    "tags": ["contract", "legal"],
    "metadata": { "customField": "value" },
    "createdAt": "2023-07-15T10:30:00Z",
    "updatedAt": "2023-07-15T10:30:00Z"
  }
  ```
- **Error Responses**:
  - 401 Unauthorized: Authentication failed
  - 404 Not Found: Document not found
  - 500 Internal Server Error: Server processing error

##### **PATCH /documents/:id**
- **Purpose**: Update document metadata
- **Authentication**: Required
- **Parameters**:
  - `id`: Document ID
- **Request**:
  - Content-Type: `application/json`
  - Body: Fields to update
  ```json
  {
    "title": "Updated Title",
    "description": "Updated description",
    "tags": ["updated", "tags"]
  }
  ```
- **Response**:
  - Status: 200 OK
  - Body: Updated document object
- **Error Responses**:
  - 400 Bad Request: Invalid input
  - 401 Unauthorized: Authentication failed
  - 404 Not Found: Document not found
  - 500 Internal Server Error: Server processing error

##### **DELETE /documents/:id**
- **Purpose**: Delete a document
- **Authentication**: Required
- **Parameters**:
  - `id`: Document ID
- **Response**:
  - Status: 200 OK
  - Body: 
  ```json
  {
    "message": "Document deleted successfully",
    "id": "uuid"
  }
  ```
- **Error Responses**:
  - 401 Unauthorized: Authentication failed
  - 404 Not Found: Document not found
  - 500 Internal Server Error: Server processing error

### Transfer Endpoints

The Transfer API is documented in [ADR-011-Document-Transfer-Feature](../docs/architecture/ADR/ADR-011-Document-Transfer-Feature.md).

##### **POST /transfer/internal**
- **Purpose**: Transfer a document to another user within the system
- **Authentication**: Required
- **Request**:
  - Content-Type: `application/json`
  - Body:
  ```json
  {
    "documentId": "uuid",
    "recipientId": "recipient-user-uuid",
    "message": "Please review this document",
    "transferType": "copy|move"
  }
  ```
- **Response**:
  - Status: 201 Created
  - Body: Transfer record
  ```json
  {
    "id": "transfer-uuid",
    "documentId": "document-uuid",
    "senderId": "sender-user-uuid",
    "recipientId": "recipient-user-uuid",
    "status": "completed",
    "transferType": "copy",
    "message": "Please review this document",
    "createdAt": "2023-07-15T10:30:00Z"
  }
  ```
- **Error Responses**:
  - 400 Bad Request: Invalid input
  - 401 Unauthorized: Authentication failed
  - 403 Forbidden: Not authorized to transfer this document
  - 404 Not Found: Document or recipient not found
  - 500 Internal Server Error: Server processing error

##### **POST /transfer/external**
- **Purpose**: Transfer a document to an external system via the Interop API
- **Authentication**: Required
- **Request**:
  - Content-Type: `application/json`
  - Body:
  ```json
  {
    "documentId": "uuid",
    "targetSystem": "SYSTEM_CODE",
    "recipientId": "external-identifier",
    "metadata": {
      "caseNumber": "ABC123",
      "priority": "high"
    }
  }
  ```
- **Response**:
  - Status: 202 Accepted
  - Body: External transfer record
  ```json
  {
    "id": "transfer-uuid",
    "documentId": "document-uuid",
    "senderId": "sender-user-uuid",
    "targetSystem": "SYSTEM_CODE",
    "recipientId": "external-identifier",
    "status": "pending",
    "trackingId": "ext-tracking-id",
    "createdAt": "2023-07-15T10:30:00Z"
  }
  ```
- **Error Responses**:
  - 400 Bad Request: Invalid input
  - 401 Unauthorized: Authentication failed
  - 403 Forbidden: Not authorized for external transfers
  - 404 Not Found: Document not found
  - 500 Internal Server Error: Server processing error

##### **GET /transfer/status/:transferId**
- **Purpose**: Check the status of a document transfer
- **Authentication**: Required
- **Parameters**:
  - `transferId`: Transfer ID
- **Response**:
  - Status: 200 OK
  - Body: Transfer status details
  ```json
  {
    "id": "transfer-uuid",
    "documentId": "document-uuid",
    "status": "completed|pending|failed",
    "errorMessage": "Error details if failed",
    "createdAt": "2023-07-15T10:30:00Z",
    "completedAt": "2023-07-15T10:35:00Z"
  }
  ```
- **Error Responses**:
  - 401 Unauthorized: Authentication failed
  - 404 Not Found: Transfer record not found
  - 500 Internal Server Error: Server processing error

## Non-Functional Requirements

The Document API implements the non-functional requirements defined in [NFR](../docs/architecture/NFR.md). Key NFRs for this service include:

### Performance Requirements

| Requirement | Target | Measurement Method |
|-------------|--------|-------------------|
| API response time for metadata operations | < 200ms (P95) | Application metrics |
| File upload processing time | < 5 seconds for files up to 10MB | Load testing |
| Document retrieval time | < 500ms for files up to 50MB | Performance monitoring |
| Maximum throughput | 100 requests/second | Load testing |
| Concurrent uploads | Support for 50+ simultaneous uploads | Stress testing |

### Security Requirements

| Requirement | Implementation |
|-------------|---------------|
| Authentication | JWT-based authentication for all endpoints |
| Authorization | Role-based access control for documents |
| Data protection | TLS for all API communications |
| Storage security | MinIO with encryption at rest and in transit |
| Audit trail | Activity logging for all document operations |
| Input validation | Request validation and sanitization |
| Rate limiting | API rate limiting to prevent abuse |

### Scalability Requirements

| Requirement | Implementation |
|-------------|---------------|
| Horizontal scaling | Stateless design for load balancing |
| Database scaling | Connection pooling and query optimization |
| Storage scaling | MinIO distributed mode support |
| Message broker scaling | RabbitMQ clustering support |
| Regional deployment | Configurable for multi-region deployment |

### Reliability Requirements

| Requirement | Implementation |
|-------------|---------------|
| Availability target | 99.9% uptime |
| Error handling | Comprehensive error handling with proper status codes |
| Database transactions | ACID transactions for critical operations |
| Retry mechanisms | Automatic retries for transient failures |
| Circuit breakers | Circuit breaker patterns for external dependencies |
| Graceful degradation | Fallback mechanisms when services are unavailable |
| Monitoring and alerting | Prometheus metrics and alerts |

## File Storage Architecture

The Document API implements the storage strategy defined in [ADR-008-Document-Storage-Strategy](../docs/architecture/ADR/ADR-008-Document-Storage-Strategy.md) and [ADR-012-Migrate-to-MinIO-Storage](../docs/architecture/ADR/ADR-012-Migrate-to-MinIO-Storage.md).

```mermaid
flowchart LR
    Client[Client Application] -->|Upload| API[Document API]
    API -->|Store Metadata| DB[(PostgreSQL)]
    API -->|Store Files| MinIO[MinIO Object Storage]
    API -->|Generate Pre-signed URLs| MinIO
    Client -->|Access Files| MinIO
    
    subgraph Storage Configuration
    MinIO -->|Bucket| Docs[documents]
    MinIO -->|Bucket| Temp[temp-uploads]
    MinIO -->|Bucket| Archive[document-archives]
    end
```

### Storage Implementation

- **Development**: Files are stored in both the local `uploads` directory and MinIO
- **Production**: Files are stored exclusively in MinIO with appropriate retention policies
- **File Access**: Pre-signed URLs with expiration for secure file access
- **Storage Classes**: Different storage classes for different document types and access patterns
- **Versioning**: Object versioning enabled for audit and compliance

### Storage Migration

Legacy file storage in the `uploads` directory is supported for backward compatibility but deprecated as per ADR-012. Use the migration script to move files to MinIO:

```bash
npm run storage:migrate
```

## Testing Strategy

### Unit Tests

The Document API has comprehensive unit tests for all components:

```bash
# Run unit tests
npm run test

# Run unit tests with coverage
npm run test:cov
```

Unit tests focus on:
- Service layer business logic
- Controller request handling
- MinIO client integration
- Messaging service functionality

### Integration Tests

Integration tests verify the interaction between components:

```bash
# Run integration tests
npm run test:integration
```

### End-to-End Tests

End-to-end tests validate complete user journeys:

```bash
# Run e2e tests
npm run test:e2e
```

### Load Testing

JMeter test plans are provided for load testing:

```bash
# Run JMeter load tests
cd test/load
./run-load-tests.sh
```

## Integration Architecture

The Document API integrates with several other systems and services:

```mermaid
flowchart TD
    DocAPI[Document API] -->|Store/Retrieve Files| MinIO[MinIO]
    DocAPI -->|Store/Retrieve Metadata| DB[(PostgreSQL)]
    DocAPI -->|Publish Events| RMQ[RabbitMQ]
    DocAPI -->|Authenticate Users| UsersAPI[Users API]
    RMQ -->|Document Events| NotifAPI[Notifications API]
    RMQ -->|Transfer Events| InteropAPI[Interop API]
    DocAPI -->|Transfer Documents| InteropAPI
```

### External Systems
- **PostgreSQL Database**: Stores document metadata
- **MinIO**: S3-compatible object storage for document files
- **RabbitMQ**: Message broker for event-driven architecture

### Service Dependencies
- **Users API**: Provides user authentication and authorization
- **Interop API**: Handles document transfers to external systems
- **Notifications API**: Sends notifications about document events

## Contributing

Please see the [CONTRIBUTING.md](../CONTRIBUTING.md) file for guidelines on contributing to this project.

## Future Work

- Implementation of document versioning
- Support for document templates
- Enhanced search capabilities with full-text search
- Document categorization and tagging improvements
- Advanced access control with fine-grained permissions
- Integration with document processing for content extraction

## License

This project is licensed under the MIT License.

Copyright (c) 2025 DocuCol Contributors