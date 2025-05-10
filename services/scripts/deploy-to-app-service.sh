#!/bin/zsh

# Configuration
REGISTRY_NAME="docucolregistry"
RESOURCE_GROUP="DocuColResourceGroup"
LOCATION="eastus"
APP_SERVICE_PLAN="DocuColPlan"
APP_SERVICE_NAME="docucol-app-service"

# Ensure we're logged in to Azure
echo "Checking Azure login status..."
az account show >/dev/null || az login

# Create resource group if it doesn't exist
echo "Creating resource group if it doesn't exist..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create Azure Container Registry if it doesn't exist
echo "Creating Azure Container Registry if it doesn't exist..."
az acr create --resource-group $RESOURCE_GROUP --name $REGISTRY_NAME --sku Basic

# Log in to ACR
echo "Logging into ACR..."
az acr login --name $REGISTRY_NAME

# Build and push images to ACR
echo "Building and pushing images to ACR..."
cd ..

# Set the registry name for image tagging
export REGISTRY_NAME=$REGISTRY_NAME

# Build and tag images
docker build -t ${REGISTRY_NAME}.azurecr.io/docucol/frontend:latest ./frontend
docker push ${REGISTRY_NAME}.azurecr.io/docucol/frontend:latest

docker build -t ${REGISTRY_NAME}.azurecr.io/docucol/document-api:latest ./document-api
docker push ${REGISTRY_NAME}.azurecr.io/docucol/document-api:latest

docker build -t ${REGISTRY_NAME}.azurecr.io/docucol/users-api:latest ./users-api
docker push ${REGISTRY_NAME}.azurecr.io/docucol/users-api:latest

docker build -t ${REGISTRY_NAME}.azurecr.io/docucol/interop-api:latest ./interop-api
docker push ${REGISTRY_NAME}.azurecr.io/docucol/interop-api:latest

docker build -t ${REGISTRY_NAME}.azurecr.io/docucol/notifications-api:latest ./notifications-api
docker push ${REGISTRY_NAME}.azurecr.io/docucol/notifications-api:latest

# Create App Service Plan
echo "Creating App Service Plan..."
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --sku P1V2 \
  --is-linux

# Update the docker-compose file for App Service
sed 's/build:/image:/g' services/docker-compose.yml > services/docker-compose.appservice.yml

# Create Web App for Containers
echo "Creating Web App for Containers..."
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --name $APP_SERVICE_NAME \
  --multicontainer-config-type compose \
  --multicontainer-config-file services/docker-compose.appservice.yml

# Configure ACR credentials for Web App
echo "Configuring ACR credentials for Web App..."
az webapp config container set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_SERVICE_NAME \
  --docker-registry-server-url https://${REGISTRY_NAME}.azurecr.io \
  --docker-registry-server-user $(az acr credential show -n $REGISTRY_NAME --query username -o tsv) \
  --docker-registry-server-password $(az acr credential show -n $REGISTRY_NAME --query passwords[0].value -o tsv)

echo "Deployment to Azure App Service completed!"
echo "Your application is available at: https://${APP_SERVICE_NAME}.azurewebsites.net"
