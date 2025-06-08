const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const Container = require('./infrastructure/config/container');

class EmailServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3005;
    this.container = new Container();
    this.gmailConfigured = false;
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Seguridad y CORS
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));

    // Rate Limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10,
      message: {
        success: false,
        error: 'Demasiadas solicitudes de envío de email. Intenta más tarde.'
      }
    });

    this.app.use('/api/email', limiter);

    // Logging middleware
    this.app.use((req, res, next) => {
      const logger = this.container.get('logger');
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      next();
    });
  }

  setupRoutes() {
    // Health Check Mejorado
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        service: 'email-service',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        gmail: {
          configured: this.gmailConfigured,
          status: this.gmailConfigured ? 'connected' : 'not configured'
        }
      });
    });

    // Configuración Gmail Status
    this.app.get('/gmail-status', (req, res) => {
      res.status(200).json({
        configured: this.gmailConfigured,
        clientId: process.env.GMAIL_CLIENT_ID ? 'configurado' : 'no configurado',
        clientSecret: process.env.GMAIL_CLIENT_SECRET ? 'configurado' : 'no configurado',
        refreshToken: process.env.GMAIL_REFRESH_TOKEN ? 'configurado' : 'no configurado',
        user: process.env.GMAIL_USER || 'no configurado'
      });
    });

    // API Routes
    const emailRoutes = this.container.get('emailRoutes');
    this.app.use('/api/email', emailRoutes.getRouter());

    // 404 Handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Endpoint no encontrado',
        path: req.originalUrl
      });
    });
  }

  setupErrorHandling() {
    const errorHandler = this.container.get('errorHandler');
    this.app.use(errorHandler.handle.bind(errorHandler));
  }

  async start() {
    const logger = this.container.get('logger');
    
    try {
      // Verificar configuración de Gmail (sin fallar)
      await this.checkGmailConfiguration(logger);

      // Iniciar servidor
      this.app.listen(this.port, () => {
        logger.info(`🔥 Email-Service ejecutándose en puerto ${this.port}`);
        logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
        
        if (this.gmailConfigured) {
          logger.info(`📧 Gmail configurado: ${process.env.GMAIL_USER}`);
          logger.info(`✅ Servicio listo para enviar emails`);
        } else {
          logger.warn(`⚠️  Gmail NO configurado - Servicio en modo TESTING`);
          logger.info(`🔧 Para configurar Gmail, sigue la guía en README.md`);
        }
        
        logger.info(`📚 Documentación: http://localhost:${this.port}/health`);
      });

    } catch (error) {
      logger.error('❌ Error iniciando servidor:', error);
      process.exit(1);
    }
  }

  async checkGmailConfiguration(logger) {
    try {
      // Verificar que las variables de entorno estén configuradas
      const requiredVars = ['GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'GMAIL_REFRESH_TOKEN', 'GMAIL_USER'];
      const missingVars = requiredVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        logger.warn(`⚠️  Variables de Gmail faltantes: ${missingVars.join(', ')}`);
        logger.info(`🔧 Configura estas variables en .env para habilitar Gmail`);
        this.gmailConfigured = false;
        return;
      }

      // Intentar verificar conexión con Gmail
      const emailProvider = this.container.get('emailProvider');
      await emailProvider.verifyConnection();
      
      logger.info('✅ Conexión con Gmail verificada exitosamente');
      this.gmailConfigured = true;

    } catch (error) {
      logger.warn('⚠️  No se pudo conectar con Gmail:', error.message);
      logger.info('🔧 Revisa la configuración OAuth2 en .env');
      logger.info('📚 Guía completa en README.md');
      
      // No fallar, solo marcar como no configurado
      this.gmailConfigured = false;
    }
  }
}

// Iniciar servidor
if (require.main === module) {
  const server = new EmailServer();
  server.start();
}

module.exports = EmailServer;