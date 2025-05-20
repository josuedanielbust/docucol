# ⚠️ ARCHIVED REPOSITORY

> **Notice:** This repository is archived and is no longer actively maintained. No further updates or support will be provided.

---

# DocuCol Mono-Repository – Fast Preview

Welcome to the **DocuCol** mono-repository! This repository contains all core systems and services for the DocuCol platform, supporting document management, interoperation, notifications, and user management.

## Repository Structure

- **document-api/**: Main API for document management, storage, and transfer. Built with NestJS. Handles document CRUD, storage integration, and messaging.
- **interop-api/**: Service for interoperability with external government APIs and operators. Manages data exchange, transfer, and messaging.
- **notifications-api/**: Handles notifications, including email delivery and templating. Integrates with messaging and transfer components.
- **users-api/**: Manages user authentication, authorization, and user data. Provides user-related APIs and messaging integration.
- **frontend/**: React-based web application for end-users. Interfaces with backend APIs for document and user management.
- **services/**: Contains infrastructure configuration (e.g., docker-compose) and utility scripts for local development and deployment.
- **docs/**: Comprehensive architectural documentation following the C4 model, including ADRs, NFRs, and system/component diagrams.

## Key Features

- **Microservice Architecture**: Each API is a standalone NestJS service, communicating via event-driven messaging.
- **Event-Driven Communication**: Services interact using messaging patterns for scalability and decoupling.
- **Centralized Documentation**: All architecture, design decisions, and diagrams are in `docs/`.
- **Containerized Deployment**: Docker and docker-compose support for local and production environments.

## Quick Start

1. Clone the repository
2. Review the `services/docker-compose.yml` for local setup
3. Start services with Docker Compose:
   ```bash
   cd services
   docker-compose up -d
   ```
4. Access the frontend and APIs as described in their respective `README.md` files

## Documentation

- See `docs/architecture/` for C4 diagrams, ADRs, and NFRs
- Each service has its own `README.md` for details

---

For more information, refer to the documentation in the `docs/` folder or contact the original maintainers.
