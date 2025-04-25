# 9. Document Storage HTTP Service

Date: 2023-04-25
Updated: 2023-04-26

## Status

Accepted

## Context

The DocuCol system requires a mechanism to serve document files that have been uploaded through the Document API. While the Document API handles document metadata and upload processing, there's a need for an efficient way to serve these files to clients without routing large file downloads through the API service itself.

## Decision

We will implement a dedicated Nginx HTTP server that:

1. Mounts the `document_uploads` volume as read-only
2. Exposes a `/storage` endpoint through Traefik
3. Applies appropriate security headers and access controls
4. Is optimized for serving static files

This approach aligns with the separation of concerns principle in our microservices architecture by dedicating a specialized service for file serving.

## Implementation Challenges and Solutions

During implementation, we encountered challenges with file permissions between the Document API (which writes files) and the Nginx server (which reads files). These issues arise from the different user contexts under which the containers operate:

1. The Document API container writes files as its application user
2. The Nginx container attempts to read files as the nginx user

To address this, we've implemented several solutions:

1. **Permission Management**: 
   - Scripts to adjust file permissions to ensure readability by both services
   - Standard permission model (directories: 755, files: 644)

2. **Debug Capabilities**:
   - Enhanced logging in both Document API and Nginx
   - Health check endpoints to verify service functionality
   - Directory listing for troubleshooting (disabled in production)

3. **Service Dependencies**:
   - Added explicit dependency on Document API
   - Implemented health checks to ensure services start in the right order

## Consequences

### Positive

- Improved performance for file downloads by using Nginx's optimized static file serving
- Reduced load on the Document API service, which can focus on business logic
- Better resource utilization (Document API doesn't need to handle large file transfers)
- Clear separation between document metadata management and file serving
- Potential for further optimization through caching headers

### Negative

- Additional component to manage in the architecture
- Requires coordination between Document API and Storage service for security
- Documents become accessible through two different paths (API and Storage)
- Need to manage file permissions across container boundaries

## Implementation Details

The implementation follows these principles:

1. **Security First**: 
   - Read-only mount of the document volume
   - Restrictive access controls
   - Security headers to prevent common vulnerabilities

2. **Performance Optimization**:
   - Nginx configured for efficient static file serving
   - Cache headers for improved client-side performance
   - Direct file access bypassing application logic

3. **Integration with API Gateway**:
   - Routing through Traefik for consistent external access
   - Path-based routing with prefix stripping

4. **Operational Considerations**:
   - Health checks for monitoring
   - Permission management procedures
   - Debug capabilities for troubleshooting

## Additional Considerations

For production environments, consider:

1. Adding authentication to the storage service
2. Implementing signed URLs from the Document API for time-limited access
3. Configuring more advanced caching strategies
4. Setting up monitoring for file access patterns
5. Implementing a unified user context across containers for consistent file permissions