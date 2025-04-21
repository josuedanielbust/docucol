# Docker Compose Setup for PostgreSQL and RabbitMQ

This project provides a Docker Compose setup for running PostgreSQL and RabbitMQ services. Below are the instructions for setting up and running the containers.

## Prerequisites

- Docker installed on your machine
- Docker Compose installed

## Project Structure

```
docker-compose-setup
├── docker-compose.yml
├── .env
└── README.md
```

## Environment Variables

The project uses a `.env` file to manage environment variables. Ensure that the following variables are set correctly in the `.env` file:

- `DATABASE_URL`: Connection string for PostgreSQL
- `RABBITMQ_URL`: Connection string for RabbitMQ
- `RABBITMQ_QUEUE`: Name of the RabbitMQ queue
- `PORT`: Port on which the application will run

## Running the Services

1. Clone the repository or download the project files.
2. Navigate to the project directory:

   ```bash
   cd docker-compose-setup
   ```

3. Start the services using Docker Compose:

   ```bash
   docker-compose up -d
   ```

   This command will start the PostgreSQL and RabbitMQ services in detached mode.

4. To stop the services, run:

   ```bash
   docker-compose down
   ```

## Accessing the Services

- PostgreSQL will be accessible on `localhost:5432`.
- RabbitMQ will be accessible on `localhost:5672`.

You can use a PostgreSQL client or RabbitMQ management tools to interact with the services.

## Additional Information

For more details on how to configure and use PostgreSQL and RabbitMQ, refer to their official documentation.