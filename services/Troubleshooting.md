# Document Storage Troubleshooting Guide

This guide provides steps to diagnose and resolve issues with the document storage service in the DocuCol system.

## Common Issues

### Files Not Being Served

If files are not being served by the document-storage service, follow these steps to diagnose and resolve the issue:

1. **Check File Existence**

   Verify that files exist in the volume:
   ```bash
   docker exec -it $(docker compose ps -q document-api) ls -la /app/uploads
   ```

2. **Check File Permissions**

   Verify file permissions in the volume:
   ```bash
   docker exec -it $(docker compose ps -q document-api) stat -c "%a %n" /app/uploads/index.html
   ```

3. **Check Nginx Logs**

   Examine Nginx logs for error messages:
   ```bash
   docker logs $(docker compose ps -q document-storage)
   ```

4. **Fix Permissions**

   Run the permission fix script:
   ```bash
   docker exec -it $(docker compose ps -q document-api) chmod -R 755 /app/uploads
   ```

5. **Test Direct Access**

   Test direct access to files within the Nginx container:
   ```bash
   docker exec -it $(docker compose ps -q document-storage) curl http://localhost/index.html
   ```

6. **Verify Routing**

   Test the Traefik routing:
   ```bash
   curl -H "Host: storage.docucol.local" http://localhost/storage/index.html
   ```

### Permission Denied Errors
If you see permission denied errors in the Nginx logs:

1. **Check User Contexts**

   Check the user contexts of both containers:
   ```bash
   docker exec -it $(docker compose ps -q document-api) id
   docker exec -it $(docker compose ps -q document-storage) id
   ```

2. **Apply Consistent Permissions**

   Ensure all directories have 755 permissions and all files have 644 permissions:
   ```bash
   docker exec -it $(docker compose ps -q document-api) find /app/uploads -type d -exec chmod 755 {} \;
   docker exec -it $(docker compose ps -q document-api) find /app/uploads -type f -exec chmod 644 {} \;
   ```
