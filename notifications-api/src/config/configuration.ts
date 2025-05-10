export default () => ({
  rabbitmq: {
    url: process.env.RABBITMQ_URL,
    host: process.env.RABBITMQ_HOST || 'localhost',
    port: parseInt(process.env.RABBITMQ_PORT || '5672', 10),
    username: process.env.RABBITMQ_USER || 'user',
    password: process.env.RABBITMQ_PASSWORD || 'password',
    queue: process.env.RABBITMQ_QUEUE || 'docucol_events',
  },
  app: {
    port: parseInt(process.env.PORT || '3000', 10),
    name: process.env.OPERATOR_NAME || 'DocuCol',
    domain: process.env.APP_DOMAIN,
  },
  email: {
    templatedir: process.env.EMAIL_TEMPLATE_DIR || './src/templates/emails'
  },
  smtp: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025', 10),
    auth: {
      username: process.env.SMTP_USER || '1025',
      password: process.env.SMTP_PASSWORD || '1025',
    },
    options: {
      secure: Boolean(process.env.SMTP_SECURE) || false,
      defaultFrom: process.env.SMTP_DEFAULT_FROM || 'DocuCol Notifications <notifications@docucol.com>',
      tls: {
        rejectUnauthorized: Boolean(process.env.SMTP_REJECT_UNAUTHORIZED) || true,
      }
    }
  }
});