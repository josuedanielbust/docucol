# Variables
IMAGE_NAME := interop-api
IMAGE_TAG := latest
DOCKER_REGISTRY := 
FULL_IMAGE_NAME := $(DOCKER_REGISTRY)$(IMAGE_NAME):$(IMAGE_TAG)

# Default target
.PHONY: all
all: docker-build

# Build the Docker image
.PHONY: docker-build
docker-build:
	docker build -t $(FULL_IMAGE_NAME) .

# Run the Docker container
.PHONY: docker-run
docker-run:
	docker run -p 8080:8080 $(FULL_IMAGE_NAME)

# Push the image to registry
.PHONY: docker-push
docker-push:
	docker push $(FULL_IMAGE_NAME)

# Pull the image from registry
.PHONY: docker-pull
docker-pull:
	docker pull $(FULL_IMAGE_NAME)

# Clean up
.PHONY: docker-clean
docker-clean:
	docker rmi $(FULL_IMAGE_NAME)

# Build with no cache
.PHONY: docker-rebuild
docker-rebuild:
	docker build --no-cache -t $(FULL_IMAGE_NAME) .

# Prisma commands
.PHONY: prisma-generate
prisma-generate:
	npx prisma generate

.PHONY: prisma-migrate
prisma-migrate:
	npx prisma migrate dev

.PHONY: prisma-studio
prisma-studio:
	npx prisma studio

.PHONY: prisma-deploy
prisma-deploy:
	npx prisma migrate deploy

# Update help
.PHONY: help
help:
	@echo "Available targets:"
	@echo "  docker-build    - Build Docker image"
	@echo "  docker-run      - Run Docker container"
	@echo "  docker-push     - Push image to registry"
	@echo "  docker-pull     - Pull image from registry"
	@echo "  docker-clean    - Remove Docker image"
	@echo "  docker-rebuild  - Build with no cache"
	@echo "  prisma-generate - Generate Prisma client"
	@echo "  prisma-migrate  - Run Prisma migrations in development"
	@echo "  prisma-studio   - Open Prisma Studio"
	@echo "  prisma-deploy   - Deploy Prisma migrations in production"
