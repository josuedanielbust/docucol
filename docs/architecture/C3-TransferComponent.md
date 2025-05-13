# Document Transfer Component (C3)

## Overview

The Document Transfer component provides functionality for securely transferring document ownership between users in the DocuCol system. This component is part of the Interop API and coordinates with other services to ensure secure and auditable transfers.

## Component Diagram

```mermaid
graph TD
    Client[Client Application] --> Gateway[API Gateway]
    
    Gateway --> TransferAPI[Transfer API]
    
    subgraph "Interop API"
        TransferAPI[Transfer Module]
        TransferController[Transfer Controller]
        TransferService[Transfer Service]
        
        TransferController --> TransferService
    end
    
    TransferService --> UsersAPI[Users API]
    TransferService --> DocumentAPI[Document API]
    
    TransferService -- "1. Validates Sender" --> UsersAPI
    TransferService -- "2. Validates Recipient" --> UsersAPI
    TransferService -- "3. Checks Document Ownership" --> DocumentAPI
    TransferService -- "4. Updates Document Ownership" --> DocumentAPI
    
    classDef component fill:#f5f5f5,stroke:#333,stroke-width:1px;
    class TransferAPI,TransferController,TransferService component;
```

## Transfer Flow Sequence Diagram
```mermaid
sequenceDiagram
    participant C as Client
    participant G as API Gateway
    participant T as Transfer Service
    participant U as Users API
    participant D as Document API
    participant N as Notification Service
    
    note over C,D: Initiate Transfer Flow
    C->>G: POST /transfer/initiate 
    G->>T: Forward request
    
    %% Validation Steps
    T->>D: Validate document ownership
    
    alt Document not found or not owned
        D-->>T: Error: Invalid document ownership
        T-->>C: 403 Forbidden: Not authorized to transfer
    else Document valid
        D->>T: Confirm document belongs to sender
        
        T->>U: Validate recipient exists
        
        alt Recipient not found
            U-->>T: Error: Recipient not found
            T-->>C: 404 Not Found: Invalid recipient
        else Recipient valid
            U->>T: Confirm recipient is valid user
            
            T->>T: Create transfer record
            T->>N: Send transfer notification to recipient
            N-->>T: Notification sent
            T->>C: Return transfer details with transferId
        end
    end
```

## Component Responsibilities

### Transfer Controller
- Expose REST endpoints for transfer operations
- Validate incoming request data
- Handle request routing to the appropriate service methods
- Format responses to clients

### Transfer Service
- Implement business logic for transfer operations
- Coordinate with Users API to validate user information
- Coordinate with Document API to validate and update documents
- Maintain transfer state and audit information
- Enforce transfer security policies

## API Endpoints

## Data Models

### InitiateTransferDto
- **documentId**: ID of the document to transfer
- **fromUserId**: ID of the current document owner
- **toUserId**: ID of the intended recipient
- **reason**: Optional explanation for the transfer
- **metadata**: Optional additional information

### ConfirmTransferDto
- **transferId**: ID of the transfer to confirm
- **userId**: ID of the user confirming (must match the intended recipient)
- **accepted**: Boolean indicating acceptance or rejection
- **rejectionReason**: Optional explanation if rejected

### TransferResponseDto
- **transferId**: Unique identifier for the transfer
- **documentId**: ID of the transferred document
- **fromUserId**: Original owner
- **toUserId**: Intended recipient
- **status**: Current state ('initiated', 'confirmed', 'rejected', 'expired')
## Security Considerations

### Access Control:
- Only document owners can initiate transfers
- Only the intended recipient can confirm transfers

### Validation:
- Document existence and ownership verified before transfer
- User existence verified before transfer
- Transfer status checked before confirmation

### Audit Trail:
- All transfer activities are logged
- Complete history of ownership is maintained
## Error Handling

The Transfer component handles the following error scenarios:

- Document not found or not accessible
- User not authorized to transfer the document
- Recipient user not found
- Transfer not found when confirming
- User not authorized to confirm the transfer
## Future Enhancements

- **Expiration Policy**: Automatically expire transfers after a configurable period
- **Notifications**: Integrate with notification system to alert users about transfers
- **Batch Transfers**: Support transferring multiple documents in a single operation
## References

- ADR-011: Document Transfer Feature
- API Gateway Architecture
- Document API Component
Transfer already in a terminal state (confirmed/rejected)
## Implementation Summary

This implementation creates a complete transfer module within the Interop API, including:

1. **Module Definition**: Setting up the module structure with proper imports
2. **Data Transfer Objects**: Defining the request and response structures
3. **Service Implementation**: Business logic for initiating and confirming transfers
4. **Controller Implementation**: REST endpoints for transfer operations
5. **App Module Integration**: Including the new module in the application
6. **E2E Tests**: Testing the transfer flow end-to-end
7. **Architectural Documentation**: ADR and component documentation following C4 model

The module coordinates with the Document API and Users API to validate documents and users, and to update document ownership when transfers are confirmed.
