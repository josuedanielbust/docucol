#!/bin/sh

# This script helps resolve access issues with MinIO storage in DocuCol
# It can be run when there are problems with file access or permissions

# Get the container IDs
MINIO_CONTAINER=$(docker compose ps -q minio)

if [ -z "$MINIO_CONTAINER" ]; then
  echo "Error: Cannot find MinIO container. Make sure MinIO service is running."
  exit 1
fi

echo "==== DocuCol MinIO Storage Diagnostic Tool ===="

# Check if MinIO is healthy
MINIO_HEALTH=$(docker exec $MINIO_CONTAINER curl -s -o /dev/null -w "%{http_code}" http://localhost:9000/minio/health/live || echo "Failed")
echo "MinIO Health Check: $MINIO_HEALTH"

# Check for MinIO configuration
echo "Checking MinIO Configuration..."
docker exec $MINIO_CONTAINER mc config host add local http://localhost:9000 minioadmin minioadmin 2>/dev/null

# Check if the bucket exists
BUCKET_NAME=${MINIO_BUCKET:-docucol}
BUCKET_EXISTS=$(docker exec $MINIO_CONTAINER mc ls local/ | grep -c $BUCKET_NAME || echo "0")
echo "Bucket '$BUCKET_NAME' exists: $([ "$BUCKET_EXISTS" -gt 0 ] && echo 'Yes' || echo 'No')"

# Create bucket if it doesn't exist
if [ "$BUCKET_EXISTS" -eq 0 ]; then
  echo "Creating bucket '$BUCKET_NAME'..."
  docker exec $MINIO_CONTAINER mc mb local/$BUCKET_NAME
fi

# Set public policy for the bucket
echo "Setting download policy for bucket..."
docker exec $MINIO_CONTAINER mc policy set download local/$BUCKET_NAME

# Configure CORS for direct access
echo "Configuring CORS for the bucket..."
docker exec $MINIO_CONTAINER mc admin api corsrule add local/$BUCKET_NAME <<EOF
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

# Create a test file
echo "Creating test file..."
echo "This is a test file for DocuCol MinIO storage." > /tmp/minio-test.txt
docker cp /tmp/minio-test.txt $MINIO_CONTAINER:/tmp/minio-test.txt
docker exec $MINIO_CONTAINER mc cp /tmp/minio-test.txt local/$BUCKET_NAME/test-file.txt
rm /tmp/minio-test.txt

echo "==== Test file created in MinIO ====="
echo "You can verify access using:"
echo "  Browser: http://minio-console.docucol.local (credentials: minioadmin/minioadmin)"
echo "  Direct MinIO access: http://minio.docucol.local/$BUCKET_NAME/test-file.txt"
echo "  Via /storage path: http://localhost/storage/test-file.txt"
echo "====================================="
echo "Done."
