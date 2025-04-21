export default () => ({
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'user',
    password: process.env.DATABASE_PASSWORD || 'password',
    name: process.env.DATABASE_NAME || 'mydb',
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL,
    host: process.env.RABBITMQ_HOST || 'localhost',
    port: parseInt(process.env.RABBITMQ_PORT || '5672', 10),
    username: process.env.RABBITMQ_USER || 'user',
    password: process.env.RABBITMQ_PASSWORD || 'password',
    queue: process.env.RABBITMQ_QUEUE || 'document_uploads',
  },
  app: {
    port: parseInt(process.env.PORT || '3000', 10),
  }
});