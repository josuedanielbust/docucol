# DocuCol Kubernetes Configuration

This directory contains Kubernetes manifests for deploying the DocuCol application infrastructure. These configurations were converted from the original Docker Compose setup.

## Architecture

The DocuCol application is deployed as a set of microservices:

- **API Gateway**: Traefik for routing and load balancing
- **Core Services**:
  - Document API: Document management service with PostgreSQL database
  - Users API: User management service with PostgreSQL database
  - Interop API: Integration service
  - Notifications API: Notification management service
- **Infrastructure Services**:
  - RabbitMQ: Message broker for asynchronous communication
  - Redis: Cache and session management
  - MinIO: Object storage for document files
  - MailHog: Email testing service

## Deployment Instructions

1. Create the namespace and apply configuration resources:
   ```bash
   kubectl apply -k .
   ```

2. Verify all pods are running:
   ```bash
   kubectl get pods -n docucol
   ```

3. Access services via Ingress:
   - Main application: http://docucol.local
   - Traefik dashboard: http://traefik.docucol.local
   - MinIO console: http://minio-console.docucol.local
   - MailHog: http://mail.docucol.local

## Troubleshooting

### Connection Refused Errors

If you encounter errors like:
```
error: error validating ".": error validating data: failed to download openapi: Get "https://127.0.0.1:50322/openapi/v2?timeout=32s": dial tcp 127.0.0.1:50322: connect: connection refused
```

Try the following steps:

1. **Verify Kubernetes Cluster Status**:
   ```bash
   kubectl cluster-info
   ```
   If the cluster is not running, start it with your cluster manager (Minikube, Kind, Docker Desktop, etc.)

2. **Skip Validation** (temporary workaround):
   ```bash
   kubectl apply -k . --validate=false
   ```

3. **Reset Kubernetes Context**:
   ```bash
   kubectl config use-context <your-context-name>
   ```
   
4. **Restart Kubernetes** (if using Docker Desktop or Minikube):
   ```bash
   # For Minikube
   minikube stop
   minikube start
   
   # For Docker Desktop
   # Restart from the Docker Desktop application
   ```

5. **Check for Conflicting Ports**:
   Ensure no other services are using the same ports as Kubernetes API server.

## Configuration

Environment-specific configuration is managed through:
- ConfigMaps: Non-sensitive configuration
- Secrets: Sensitive data like passwords and keys

For local development, ensure your `/etc/hosts` file includes:
```
127.0.0.1 docucol.local
127.0.0.1 traefik.docucol.local
127.0.0.1 mail.docucol.local
127.0.0.1 minio.docucol.local
127.0.0.1 minio-console.docucol.local
127.0.0.1 storage.docucol.local
```

## Resource Requirements

The current configuration is optimized for development environments. For production deployments, adjust:
- Resource limits and requests
- Replicas for high availability
- Proper secrets management
- Storage class for persistent volumes

## Migration Notes

This configuration was converted from Docker Compose. Notable changes:
- Traefik configuration adapted to Kubernetes Ingress resources
- Service discovery via Kubernetes DNS instead of Docker network
- Persistent storage handled through PersistentVolumeClaims
- Health checks adapted to Kubernetes probes
