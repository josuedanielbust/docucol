# API Gateway Architecture (C3)

## Overview

The API Gateway serves as the single entry point for all client applications, routing requests to the appropriate microservices.

### Component Diagram
```mermaid
graph TD
    Client[Client Application] --> Gateway[Traefik API Gateway]
    
    Gateway --> UsersAPI[Users API]
    Gateway --> DocumentAPI[Document API]
    Gateway --> InteropAPI[Interop API]
    Gateway --> StorageService[Document Storage Service]
    
    subgraph "Document Management"
        DocumentAPI -- "1. Writes file" --> DocStorage[/Document Storage Volume\]
        StorageService -- "2. Reads file" --> DocStorage
    end
    
    DocumentAPI --> DocumentDB[(Document Database)]
    DocumentAPI --> MessageBroker[RabbitMQ]
    
    classDef problem fill:#f9d6d6,stroke:#a30000,stroke-width:2px;
    class StorageService problem;
    class DocStorage problem;
```

### Deployment Flow Sequence Diagram
```mermaid
sequenceDiagram
    participant C as Client
    participant G as API Gateway (Traefik)
    participant D as Document API
    participant S as Storage Service (Nginx)
    
    note over C,S: Document Upload Flow
    C->>G: POST /documents (with file)
    G->>D: Forward request
    D->>D: Process & validate document
    D->>D: Save file to document_uploads volume
    D->>C: Return document metadata (including fileId)
    
    note over C,S: Document Retrieval Flow
    C->>G: GET /storage/{fileId}
    G->>S: Forward request
    S->>C: Return document file (direct from volume)
```

### File Access Flow Sequence Diagram
```mermaid
sequenceDiagram
    participant C as Client
    participant G as API Gateway (Traefik)
    participant D as Document API
    participant V as Volume (document_uploads)
    participant N as Nginx (document-storage)
    
    C->>G: POST /documents (with file)
    G->>D: Forward request
    D->>D: Process & validate document
    D->>V: Save file with permissions <font color="red">(UID: Node.js process)</font>
    Note over D,V: File saved with owner = Node.js user
    D->>C: Return document metadata (including fileId)
    
    C->>G: GET /storage/{fileId}
    G->>N: Forward request
    Note over N,V: Nginx runs as different user (nginx)
    N--xV: <font color="red">Permission denied?</font>
    N->>C: 404 Not Found
```

## Implementation Benefits

- **Zero-configuration service discovery** - Traefik automatically detects services and configures routes
- **Simple routing based on URL paths** - Uses path-based routing aligned with microservice architecture
- **Dashboard for monitoring and debugging** - Built-in visualization of routes and services
- **Easy SSL/TLS configuration** - Simple integration with Let's Encrypt for production
- **Docker-native integration** - Uses Docker labels for configuration

## Getting Started

1. Save the updated docker-compose.yml file
2. Start the services: `docker-compose up -d`
3. Access the Traefik dashboard at http://localhost:8080
4. Your services will be available at:
   - `/users` → Users API
   - `/documents` → Document API
   - `/gov-api` → Interop API

## Security Considerations for Production

For production deployment, you should:

- Disable the Traefik dashboard or secure it with authentication
- Enable HTTPS using Let's Encrypt or your own certificates
- Consider adding rate limiting middleware
- Implement proper network segmentation
- Secure the Docker socket

## Additional Documentation

For more advanced configuration including authentication, monitoring, and scaling, refer to the [Traefik documentation](https://doc.traefik.io/traefik/).

This implementation aligns with the DocuCol architectural principles while providing an easy-to-setup API gateway solution that integrates seamlessly with your Docker-based infrastructure.

## Conclusion
The API Gateway is a crucial component of the DocuCol architecture, providing a unified entry point for all client applications. By leveraging Traefik, we can achieve a robust, scalable, and easy-to-manage gateway that simplifies routing and enhances security.

This architecture allows for easy integration of new microservices and provides a clear separation of concerns, making it easier to manage and scale the system as needed.

The use of Docker and Traefik also ensures that the deployment process is streamlined, allowing for rapid development and testing cycles.

This document serves as a guide for implementing the API Gateway in the DocuCol architecture, providing a solid foundation for future enhancements and optimizations.
