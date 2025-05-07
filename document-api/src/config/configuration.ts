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
  minio: {
    host: process.env.MINIO_HOST || '127.0.0.1',
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    bucketName: process.env.MINIO_BUCKET_NAME || 'documents',
    publicUrl: process.env.MINIO_PUBLIC_URL || 'http://minio.docucol.local',
  },
  app: {
    port: parseInt(process.env.PORT || '3000', 10),
  }
});