# Variables
IMAGE_NAME := frontend
IMAGE_TAG := latest
DOCKER_REGISTRY := 
FULL_IMAGE_NAME := $(DOCKER_REGISTRY)$(IMAGE_NAME):$(IMAGE_TAG)
DOCKERFILE_PATH := Dockerfile

# Build the Docker image
.PHONY: docker-build
docker-build:
	docker build -t $(FULL_IMAGE_NAME) -f $(DOCKERFILE_PATH) .

# Run the Docker container
.PHONY: docker-run
docker-run:
	docker run -p 3000:3000 $(FULL_IMAGE_NAME)

# Push the image to registry
.PHONY: docker-push
docker-push:
	docker push $(FULL_IMAGE_NAME)

# Remove the image
.PHONY: docker-clean
docker-clean:
	docker rmi $(FULL_IMAGE_NAME)

# Build without cache
.PHONY: docker-rebuild
docker-rebuild:
	docker build --no-cache -t $(FULL_IMAGE_NAME) -f $(DOCKERFILE_PATH) .

# Help
.PHONY: help
help:
	@echo "Frontend Docker Makefile"
	@echo "  docker-build    - Build Docker image"
	@echo "  docker-run      - Run container on port 3000"
	@echo "  docker-push     - Push image to registry"
	@echo "  docker-clean    - Remove image"
	@echo "  docker-rebuild  - Build without cache"
