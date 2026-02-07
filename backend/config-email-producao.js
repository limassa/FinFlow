// Configuração de Email para Produção - FinFlow
// Desenvolvido por: Liz Softwares

module.exports = {
  // Configurações do Servidor SMTP
  smtp: {
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true para 465, false para outras portas
    auth: {
      user: process.env.EMAIL_USER || 'contatoLizSoftware@gmail.com',
      pass: process.env.EMAIL_PASS || 'xdas ngdw yeao sgou'
    },
    // Configurações para resolver problemas de timeout em produção
    connectionTimeout: 60000, // 60 segundos para conectar
    greetingTimeout: 30000,   // 30 segundos para greeting
    socketTimeout: 60000,     // 60 segundos para operações socket
    // Configurações de pool para melhor performance
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    // Configurações de retry
    retryDelay: 1000,
    maxRetries: 3,
    // Configurações de TLS
    tls: {
      rejectUnauthorized: false
    }
  },

  // Configurações de Email
  email: {
    from: process.env.EMAIL_FROM || 'noreply@finflow.com',
    replyTo: process.env.EMAIL_REPLY_TO || 'contatoLizSoftware@gmail.com',
    frontendUrl: process.env.FRONTEND_URL || 'https://claricash.com.br'
  },

  // Configurações de Rate Limiting
  rateLimit: {
    maxEmailsPerHour: 100,
    maxEmailsPerDay: 500,
    delayBetweenEmails: 1000 // 1 segundo entre emails
  },

  // Configurações de Log
  logging: {
    enabled: true,
    level: 'info', // debug, info, warn, error
    logFailedEmails: true,
    logSuccessfulEmails: true
  },

  // Configurações de Fallback
  fallback: {
    enabled: true,
    maxRetries: 3,
    retryDelay: 5000, // 5 segundos
    alternativeService: 'outlook' // Serviço alternativo se Gmail falhar
  }
};
