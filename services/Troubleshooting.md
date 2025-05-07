# Document Storage Troubleshooting Guide

This guide provides steps to diagnose and resolve issues with the document storage service in the DocuCol system.

## Common Issues

### Files Not Being Served

If files are not being served by MinIO, follow these steps to diagnose and resolve the issue:

1. **Check MinIO Server Health**

   Verify that MinIO server is running:
   ```bash
   docker exec -it $(docker compose ps -q minio) curl -f http://localhost:9000/minio/health/live
   ```

2. **Check Bucket Existence**

   Ensure the bucket exists:
   ```bash
   docker exec -it $(docker compose ps -q minio) mc config host add local http://localhost:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}
   docker exec -it $(docker compose ps -q minio) mc ls local/
   ```

3. **List Objects in Bucket**

   List files in the bucket:
   ```bash
   docker exec -it $(docker compose ps -q minio) mc ls local/${MINIO_BUCKET}/
   ```

4. **Check MinIO Logs**

   Examine MinIO logs for error messages:
   ```bash
   docker logs $(docker compose ps -q minio)
   ```

5. **Test Direct Access to MinIO**

   Test direct access to files through MinIO API:
   ```bash
   curl -v http://minio.docucol.local/${MINIO_BUCKET}/path/to/file
   ```

6. **Test Traefik Routing**

   Test the Traefik routing for the storage path:
   ```bash
   curl -v http://localhost/storage/path/to/file
   ```

### Permission or Access Denied Errors

If you see permission or access denied errors in the logs:

1. **Check MinIO Credentials**

   Verify the MinIO credentials are correct:
   ```bash
   docker exec -it $(docker compose ps -q minio) mc config host add local http://localhost:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}
   docker exec -it $(docker compose ps -q minio) mc admin info local
   ```

2. **Check Bucket Policy**

   Verify the bucket policy:
   ```bash
   docker exec -it $(docker compose ps -q minio) mc policy get local/${MINIO_BUCKET}
   ```

3. **Set Public Read Policy (if needed)**

   If files should be publicly readable:
   ```bash
   docker exec -it $(docker compose ps -q minio) mc policy set download local/${MINIO_BUCKET}
   ```

4. **Configure CORS**

   If browser requests are failing due to CORS issues:
   ```bash
   docker exec -it $(docker compose ps -q minio) mc admin api corsrule add local/${MINIO_BUCKET} <<EOF
   {
     "corsRules": [
       {
         "allowedOrigins": ["*"],
         "allowedMethods": ["GET", "HEAD"],
         "allowedHeaders": ["*"],
         "exposeHeaders": ["ETag", "Content-Length", "Content-Type"]
       }
     ]
   }
   EOF
   ```

### Issues Uploading Files

If there are issues uploading files to MinIO:

1. **Check API Service Logs**

   Check document-api logs for errors:
   ```bash
   docker logs $(docker compose ps -q document-api)
   ```

2. **Verify API Environment Variables**

   Ensure MinIO environment variables are correctly set:
   ```bash
   docker exec -it $(docker compose ps -q document-api) env | grep MINIO
   ```

3. **Test MinIO Connection**

   Test connection from document-api to MinIO:
   ```bash
   docker exec -it $(docker compose ps -q document-api) curl -f http://minio:9000/minio/health/live
   ```

4. **Run the Fix Permissions Script**

   Execute the fix permissions script to reset bucket configuration:
   ```bash
   ./scripts/fix-permissions.sh
   ```
