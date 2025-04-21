export default () => ({
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'user',
    password: process.env.DATABASE_PASSWORD || 'password',
    name: process.env.DATABASE_NAME || 'mydb',
  },
  app: {
    port: parseInt(process.env.PORT || '3000', 10),
  },
  govCarpeta: {
    baseUrl: process.env.GOV_CARPETA_BASE_URL || 'https://govcarpeta-apis-4905ff3c005b.herokuapp.com'
  }
});