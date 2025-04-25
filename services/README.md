# Infrastructure Services for DocuCol

This directory contains Docker Compose configuration for running the core infrastructure services required by the DocuCol application. The setup includes PostgreSQL for data persistence and RabbitMQ for message queuing.

## Prerequisites

- Docker Engine (version 20.10.0+)
- Docker Compose (version 2.0.0+)
- Properly configured `.env` file (see Environment Configuration section)

## Architecture Context

These services represent the infrastructure layer in the DocuCol system architecture:

- **PostgreSQL**: Primary data store for application persistence
- **RabbitMQ**: Message broker for asynchronous communication between services

## Directory Structure

```
services/
├── docker-compose.yml   # Service definitions and configuration
├── .env                 # Environment variables (create from .env.example)
└── README.md            # This documentation file
```

## Environment Configuration

Create a `.env` file in this directory with the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/docucol` |
| `RABBITMQ_URL` | RabbitMQ connection URL | `amqp://guest:guest@localhost:5672/` |
| `RABBITMQ_QUEUE` | Default queue name | `docucol_events` |
| `PORT` | Application port | `3000` |

## Usage Instructions

### Starting Services

```bash
# From the services directory
docker-compose up -d
```

This command starts all services in detached mode. Use `docker-compose logs -f` to follow the logs.

### Stopping Services

```bash
docker-compose down
```

Add `-v` flag to remove volumes and delete persistent data.

## Service Access

| Service | Access URL | Default Credentials |
|---------|------------|---------------------|
| PostgreSQL | `localhost:5432` | Username: `postgres`<br>Password: From `.env` |
| RabbitMQ | `localhost:5672` (AMQP)<br>`localhost:15672` (Management UI) | Username: `guest`<br>Password: `guest` |

## Integration with DocuCol Components

Other DocuCol components connect to these services using the environment variables defined in their respective configuration files. See the main architecture documentation for component interaction details.

## Troubleshooting

If services fail to start properly, check:
1. Docker daemon is running
2. Required ports are not in use
3. Environment variables are properly configured
4. Docker has sufficient resources allocated

For detailed logs, run `docker-compose logs [service_name]`.
