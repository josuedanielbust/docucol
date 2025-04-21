# Interop API

This service is designed to provide an interoperation layer between DocuCol and external government systems. It provides authentication, user management, and connectivity to government document services.

## Features

- User authentication and management
- Integration with government document systems
- Document validation and retrieval
- Secure document history tracking

## Technologies Used

- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications.
- **Prisma**: A modern database toolkit that simplifies database access and management.
- **JWT**: JSON Web Tokens for secure authentication.

## Modules

### Auth Module
Handles user authentication, providing secure access to the API.

### Users Module
Manages user profiles and information.

### GovApi Module
Connects to external government APIs to validate users and retrieve official documents.

## Project Structure

```
interop-api
├── src
│   ├── app.module.ts
│   ├── main.ts
│   ├── config
│   │   └── configuration.ts
│   ├── auth
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   └── dto
│   │       ├── login.dto.ts
│   │       └── register.dto.ts
│   ├── users
│   │   ├── users.controller.ts
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   └── entities
│   │       └── user.entity.ts
│   ├── govapi
│   │   ├── govapi.controller.ts
│   │   ├── govapi.module.ts
│   │   ├── govapi.service.ts
│   │   └── entities
│   │       └── document.entity.ts
│   └── prisma
│       ├── prisma.module.ts
│       ├── prisma.service.ts
│       └── schema.prisma
├── test
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── .env
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd interop-api
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Configuration

Create a `.env` file in the root directory and add your database connection string and JWT secret.

## Running the Application

To start the application, run:
```
npm run start
```

## Testing

To run the end-to-end tests, use:
```
npm run test:e2e
```

## License

This project is licensed under the MIT License.