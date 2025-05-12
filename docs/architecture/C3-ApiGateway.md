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
    Gateway --> NotificationsAPI[Notifications API]
    Gateway --> StorageService[Document Storage Service]
    
    subgraph "Document Management"
        DocumentAPI -- "1. Writes file" --> DocStorage[/Document Storage Volume\]
        StorageService -- "2. Reads file" --> DocStorage
        SharedVolume[Shared Volume Group] --- DocStorage
    end
    
    DocumentAPI --> DocumentDB[(Document Database)]
    UsersAPI --> UsersDB[(Users Database)]
    UsersAPI --> MessageBroker[RabbitMQ]
    InteropAPI --> MessageBroker[RabbitMQ]
    NotificationsAPI --> MessageBroker[RabbitMQ]
    DocumentAPI --> MessageBroker[RabbitMQ]
    
    classDef solution fill:#d6f9d6,stroke:#00a300,stroke-width:2px;
    class SharedVolume solution;
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
    participant N as Minio (S3 - document-storage)
    
    C->>G: POST /documents (with file)
    G->>D: Forward request
    D->>D: Process & validate document
    D->>V: Save file with shared group permissions (GID: shared-docs)
    Note over D,V: File saved with group = shared-docs, permissions 664
    D->>C: Return document metadata (including fileId)
    
    C->>G: GET /storage/{fileId}
    G->>N: Forward request
    Note over N,V: Minio is member of shared-docs group
    N->>V: Read file with group permissions
    N->>C: 200 OK (File content)
```

## Permission Solution

To resolve the file permission issues between the Document API and Storage Service:

1. **Shared Group Strategy**: 
   - Create a shared system group (e.g., `shared-docs`) on the host
   - Add both the Node.js user (Document API) and Nginx user to this group
   - Configure containers to use this group when writing/reading files

2. **Container Configuration**:
   ```yaml
   document-api:
     # ...existing config...
     user: "node:shared-docs"
     volumes:
       - document_uploads:/app/uploads
     
   document-storage:
     # ...existing config...
     user: "nginx:shared-docs"
     volumes:
       - document_uploads:/usr/share/nginx/html/files:ro
   ```

3. **File Permission Settings**:
   - Set the Document API to save files with `664` permissions (`rw-rw-r--`)
   - Set the `umask` in the Document API to ensure proper group permissions
   - Mount the volume with appropriate options for both containers

This solution maintains security by using the principle of least privilege while enabling both services to interact with the shared files.

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
- `/api/v1/users` → Users API
- `/api/v1/documents` → Document API
- `/api/v1/gov-api` → Interop API
- `/storage` → Document Storage Service

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
