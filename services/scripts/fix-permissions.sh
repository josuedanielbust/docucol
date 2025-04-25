#!/bin/sh
# filepath: /Users/josuedanielbust/universidad/arch-soft/DocuCol/services/scripts/fix-permissions.sh

# This script fixes permissions on the document uploads volume
# It should be run when file access issues are detected

# Get the container IDs
DOC_API_CONTAINER=$(docker compose ps -q document-api)
STORAGE_CONTAINER=$(docker compose ps -q document-storage)

if [ -z "$DOC_API_CONTAINER" ] || [ -z "$STORAGE_CONTAINER" ]; then
  echo "Error: Cannot find containers. Make sure the services are running."
  exit 1
fi

# Get the user IDs
DOC_API_UID=$(docker exec $DOC_API_CONTAINER id -u)
NGINX_UID=$(docker exec $STORAGE_CONTAINER id -u nginx)

echo "Document API user ID: $DOC_API_UID"
echo "Nginx user ID: $NGINX_UID"

# Create a temporary container to fix permissions
echo "Fixing permissions on document_uploads volume..."
docker run --rm -v document_uploads:/data alpine /bin/sh -c "
  # Make the directory accessible to both users
  find /data -type d -exec chmod 755 {} \;
  # Make files readable by both users
  find /data -type f -exec chmod 644 {} \;
  # Create a test file for verification
  echo 'Test file for permission verification' > /data/test-permissions.txt
  chmod 644 /data/test-permissions.txt
"

echo "Permissions fixed. Testing access..."

# Test Nginx access
NGINX_TEST=$(docker exec $STORAGE_CONTAINER ls -la /usr/share/nginx/html/ | grep test-permissions.txt || echo "Not found")
echo "Nginx can see the test file: $NGINX_TEST"

echo "Done. Please check if the document storage service is now functioning correctly."
