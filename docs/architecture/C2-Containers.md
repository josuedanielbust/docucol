# DocuCol Container Diagram (C2)

## Overview
This document describes the high-level technology choices for DocuCol and how responsibilities are distributed across containers.

## Container Diagram

```mermaid
C4Container
    title Container Diagram for DocuCol

    Person(user, "User", "A user of the DocuCol system")
    
    System_Boundary(docuCol, "DocuCol System") {
        Container(webApp, "Web Application", "React, TypeScript", "Provides document management functionality to users via their web browser")
        Container(mobileApp, "Mobile Application", "React Native", "Provides document management functionality to users on mobile devices")
        Container(apiGateway, "API Gateway", "Node.js, Express", "Handles API requests and routes them to appropriate microservices")
        
        Container(documentService, "Document Service", "Node.js, Express", "Manages document operations and metadata")
        Container(collaborationService, "Collaboration Service", "Node.js, Socket.io", "Handles real-time collaboration features")
        Container(userService, "User Service", "Node.js, Express", "Manages user profiles and settings")
        Container(searchService, "Search Service", "Elasticsearch", "Provides document search functionality")
        
        ContainerDb(docDatabase, "Document Database", "MongoDB", "Stores document metadata and structure")
        ContainerDb(userDatabase, "User Database", "PostgreSQL", "Stores user information and settings")
    }
    
    System_Ext(storageSystem, "Document Storage", "Cloud storage for document files")
    System_Ext(authSystem, "Authentication Service", "Handles user authentication")
    System_Ext(notificationSystem, "Notification Service", "Sends notifications to users")
    
    Rel(user, webApp, "Uses", "HTTPS")
    Rel(user, mobileApp, "Uses", "HTTPS")
    
    Rel(webApp, apiGateway, "Makes API calls to", "JSON/HTTPS")
    Rel(mobileApp, apiGateway, "Makes API calls to", "JSON/HTTPS")
    
    Rel(apiGateway, documentService, "Routes document requests to", "JSON/HTTPS")
    Rel(apiGateway, collaborationService, "Routes collaboration requests to", "JSON/HTTPS")
    Rel(apiGateway, userService, "Routes user requests to", "JSON/HTTPS")
    Rel(apiGateway, searchService, "Routes search requests to", "JSON/HTTPS")
    
    Rel(documentService, docDatabase, "Reads from and writes to", "MongoDB Driver")
    Rel(userService, userDatabase, "Reads from and writes to", "SQL/JDBC")
    Rel(documentService, storageSystem, "Stores document files in", "API Calls")
    Rel(userService, authSystem, "Authenticates users via", "HTTPS/OAuth")
    Rel(collaborationService, notificationSystem, "Sends notifications through", "API Calls")
    Rel(searchService, docDatabase, "Indexes and searches", "MongoDB Driver")
```

## Container Descriptions

### Frontend Applications
- **Web Application**: Browser-based interface built with React and TypeScript
- **Mobile Application**: Native mobile experience built with React Native

### Backend Services
- **API Gateway**: Entry point for all client requests, handles routing and basic validation
- **Document Service**: Core service managing document operations and metadata
- **Collaboration Service**: Enables real-time collaborative editing and commenting
- **User Service**: Handles user profile management and settings
- **Search Service**: Provides document search and discovery capabilities

### Data Stores
- **Document Database**: MongoDB database storing document metadata and structure
- **User Database**: PostgreSQL database storing user information and settings

## Communication Patterns

The system uses:
- RESTful APIs for most service-to-service communication
- WebSockets for real-time collaboration features
- Message queues for asynchronous processing

## References

- [System Context Diagram](./C1-SystemContext.md)
- [Component Diagrams](./C3-Components.md)
- [Deployment Architecture](./DeploymentDiagram.md)
