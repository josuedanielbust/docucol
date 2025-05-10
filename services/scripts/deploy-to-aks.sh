#!/bin/zsh

# Configuration
REGISTRY_NAME="docucolregistry"
RESOURCE_GROUP="DocuColResourceGroup"
LOCATION="eastus"
AKS_CLUSTER_NAME="docucolaks"
ACR_ID=""

# Ensure we're logged in to Azure
echo "Checking Azure login status..."
az account show >/dev/null || az login

# Create resource group if it doesn't exist
echo "Creating resource group if it doesn't exist..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create AKS cluster if it doesn't exist
echo "Creating AKS cluster if it doesn't exist..."
az aks create \
  --resource-group $RESOURCE_GROUP \
  --name $AKS_CLUSTER_NAME \
  --node-count 2 \
  --enable-addons monitoring \
  --generate-ssh-keys

# Create ACR if it doesn't exist
echo "Creating Azure Container Registry if it doesn't exist..."
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $REGISTRY_NAME \
  --sku Standard

# Get the ACR ID for later
ACR_ID=$(az acr show --name $REGISTRY_NAME --query id --output tsv)

# Attach ACR to AKS
echo "Attaching ACR to AKS cluster..."
az aks update \
  --name $AKS_CLUSTER_NAME \
  --resource-group $RESOURCE_GROUP \
  --attach-acr $REGISTRY_NAME

# Get AKS credentials
echo "Getting AKS credentials..."
az aks get-credentials \
  --resource-group $RESOURCE_GROUP \
  --name $AKS_CLUSTER_NAME \
  --overwrite-existing

# Login to ACR
echo "Logging into ACR..."
az acr login --name $REGISTRY_NAME

# Build and push Docker images
echo "Building and pushing images to ACR..."
# Set the registry name for image tagging
export REGISTRY_NAME=$REGISTRY_NAME
cd ..

# Build and tag frontend
echo "Building frontend image..."
docker build -t ${REGISTRY_NAME}.azurecr.io/docucol/frontend:latest ./frontend
docker push ${REGISTRY_NAME}.azurecr.io/docucol/frontend:latest

# Build and tag document-api
echo "Building document-api image..."
docker build -t ${REGISTRY_NAME}.azurecr.io/docucol/document-api:latest ./document-api
docker push ${REGISTRY_NAME}.azurecr.io/docucol/document-api:latest

# Build and tag users-api
echo "Building users-api image..."
docker build -t ${REGISTRY_NAME}.azurecr.io/docucol/users-api:latest ./users-api
docker push ${REGISTRY_NAME}.azurecr.io/docucol/users-api:latest

# Build and tag interop-api
echo "Building interop-api image..."
docker build -t ${REGISTRY_NAME}.azurecr.io/docucol/interop-api:latest ./interop-api
docker push ${REGISTRY_NAME}.azurecr.io/docucol/interop-api:latest

# Build and tag notifications-api
echo "Building notifications-api image..."
docker build -t ${REGISTRY_NAME}.azurecr.io/docucol/notifications-api:latest ./notifications-api
docker push ${REGISTRY_NAME}.azurecr.io/docucol/notifications-api:latest

# Update Kubernetes manifests with ACR image references
echo "Updating Kubernetes manifests with ACR image references..."
cd services/kubernetes

# Create a secret for ACR if it doesn't exist
kubectl create namespace docucol --dry-run=client -o yaml | kubectl apply -f -
kubectl create secret docker-registry acr-secret \
  --namespace docucol \
  --docker-server=${REGISTRY_NAME}.azurecr.io \
  --docker-username=$(az acr credential show -n $REGISTRY_NAME --query username -o tsv) \
  --docker-password=$(az acr credential show -n $REGISTRY_NAME --query passwords[0].value -o tsv) \
  --dry-run=client -o yaml | kubectl apply -f -

# Apply Kubernetes manifests
echo "Applying Kubernetes manifests..."
kubectl apply -k .

echo "Deployment to AKS completed!"
echo "To get services and external IPs, run: kubectl get services -n docucol"
