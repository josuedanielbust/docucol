# ADR-012: Migrate Document Storage to MinIO

## Status
Accepted

## Date
2023-05-15

## Context
The current document storage implementation uses the local filesystem, which presents several limitations:

1. **Scalability**: Local filesystem storage doesn't scale horizontally across multiple instances
2. **Resilience**: Files stored on local filesystem are lost if the container is destroyed
3. **Management**: Backup and retention policies are difficult to implement consistently
4. **Access Control**: Limited access control mechanisms for direct file access

As DocuCol usage grows, we need a more robust storage solution that addresses these limitations.

## Decision
We will migrate document storage from local filesystem to MinIO, an S3-compatible object storage system. This migration includes:

1. Replacing direct filesystem operations with MinIO client API calls
2. Updating configuration to include MinIO connection parameters
3. Modifying how file paths are stored and referenced
4. Ensuring all storage operations are properly secured and logged

## Rationales
1. **API Compatibility**: MinIO provides an S3-compatible API, which is an industry standard
2. **Scalability**: MinIO can scale horizontally as our storage needs grow
3. **Operational Simplicity**: MinIO is already part of our infrastructure and used for other components
4. **Resilience**: Object storage provides better data durability guarantees
5. **Security**: Improved access control and encryption capabilities

## Implementation
The implementation includes:

1. Updating the Document API service to use MinIO client instead of filesystem
2. Modifying document path storage to use MinIO object URLs
3. Configuring proper bucket policies and access controls
4. Ensuring proper error handling for storage operations

## Consequences

### Positive
- Improved scalability and resilience for document storage
- Better security with fine-grained access controls
- Consistent interface with other storage operations in the system
- Simplified backup and retention management
- Easier implementation of features like versioning and lifecycle policies

### Negative
- Additional dependency on MinIO infrastructure
- Slightly more complex configuration
- Need for migration process for existing documents
- Different error handling patterns for storage operations

## Security Considerations
- Configure proper access policies on MinIO buckets
- Implement secure credential management for MinIO access
- Ensure proper content validation before storage
- Apply appropriate object lifecycle policies

## Migration Strategy
1. Deploy updated code that can write to both filesystem and MinIO
2. Migrate existing documents to MinIO through a batch process
3. Once migration is complete, remove filesystem storage code
4. Update documentation and operational procedures

## References
- [ADR-008: Document Storage Strategy](./ADR-008-Document-Storage-Strategy.md)
- [ADR-009: Document Storage HTTP Service](./ADR-009-Document-Storage-HTTP-Service.md)
- [MinIO Documentation](https://min.io/docs/minio/linux/index.html)
