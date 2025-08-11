// Configurações de Produção - FinFlow
// Desenvolvido por: Liz Softwares

module.exports = {
  // Configurações do Servidor
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || '0.0.0.0',
    environment: 'production'
  },

  // Configurações do Banco de Dados
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'finflow_producao',
    user: process.env.DB_USER || 'finflow_user',
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20, // Máximo de conexões
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  },

  // Configurações de Email
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || 'noreply@finflow.com',
    frontendUrl: process.env.FRONTEND_URL || 'https://finflow.lizsoftware.com.br'
  },

  // Configurações de Segurança
  security: {
    cors: {
      origin: process.env.FRONTEND_URL || 'https://finflow.lizsoftware.com.br',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // Máximo 100 requests por IP
      message: 'Muitas requisições deste IP, tente novamente mais tarde.'
    },
    bcrypt: {
      saltRounds: 12 // Mais seguro para produção
    }
  },

  // Configurações de Log
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'combined',
    file: process.env.LOG_FILE || './logs/app.log',
    maxSize: '10m',
    maxFiles: '5'
  },

  // Configurações de Cache
  cache: {
    ttl: 300, // 5 minutos
    maxSize: 100
  },

  // Configurações de Lembretes
  reminders: {
    enabled: true,
    checkInterval: 60 * 60 * 1000, // 1 hora
    maxEmailsPerHour: 100
  },

  // Configurações de Monitoramento
  monitoring: {
    enabled: true,
    metrics: {
      responseTime: true,
      errorRate: true,
      throughput: true
    }
  },

  // Configurações de Backup
  backup: {
    enabled: true,
    schedule: '0 2 * * *', // 2h da manhã
    retention: 30, // 30 dias
    path: './backups/'
  },

  // Configurações de Performance
  performance: {
    compression: true,
    gzip: true,
    cacheControl: {
      static: 'public, max-age=31536000', // 1 ano
      api: 'no-cache'
    }
  }
}; 