#!/bin/zsh

# Configuration
REGISTRY_NAME="docucolregistry"
RESOURCE_GROUP="DocuColResourceGroup"
LOCATION="eastus"
ACI_GROUP="docucol-container-group"

# Ensure we're logged in to Azure
echo "Checking Azure login status..."
az account show >/dev/null || az login

# Make sure we're logged into ACR
echo "Logging into Azure Container Registry..."
az acr login --name $REGISTRY_NAME

# Export registry name for docker-compose
export REGISTRY_NAME=$REGISTRY_NAME

# Build and push images
echo "Building and pushing container images to ACR..."
cd ..
docker compose -f services/docker-compose.azure.yml build
docker compose -f services/docker-compose.azure.yml push

# Create context for ACI
echo "Creating Docker context for ACI..."
docker context create aci docucolaci

# Switch to ACI context
echo "Switching to ACI context..."
docker context use docucolaci

# Deploy to ACI
echo "Deploying to Azure Container Instances..."
docker compose -f services/docker-compose.azure.yml up

echo "Deployment completed!"
echo "To check your deployment status: az container list -g $RESOURCE_GROUP"

# Return to default context when done
docker context use default
