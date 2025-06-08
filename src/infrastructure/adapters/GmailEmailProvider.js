// ===================================
// 📁 src/infrastructure/adapters/GmailEmailProvider.js - CON DEBUG COMPLETO
// ===================================
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const IEmailProvider = require('../../domain/services/IEmailProvider');

class GmailEmailProvider extends IEmailProvider {
  constructor(config, logger) {
    super();
    this.config = config;
    this.logger = logger;
    this.oauth2Client = null;
    this.transporter = null;
    
    this.validateConfig();
    this.initializeOAuth2();
  }

  validateConfig() {
    const required = ['clientId', 'clientSecret', 'refreshToken', 'user'];
    const missing = required.filter(key => !this.config[key]);
    
    if (missing.length > 0) {
      throw new Error(`Configuración Gmail incompleta. Faltan: ${missing.join(', ')}`);
    }

    // Debug de configuración (sin mostrar valores completos por seguridad)
    this.logger.info('📧 Configuración Gmail recibida:', {
      clientId: this.config.clientId?.substring(0, 20) + '...',
      clientSecret: this.config.clientSecret?.substring(0, 15) + '...',
      refreshToken: this.config.refreshToken?.substring(0, 15) + '...',
      user: this.config.user
    });
  }

  initializeOAuth2() {
    try {
      const OAuth2 = google.auth.OAuth2;
      
      this.oauth2Client = new OAuth2(
        this.config.clientId,
        this.config.clientSecret,
        'https://developers.google.com/oauthplayground'
      );

      this.oauth2Client.setCredentials({
        refresh_token: this.config.refreshToken
      });

      this.logger.info('✅ OAuth2 inicializado correctamente');
    } catch (error) {
      this.logger.error('❌ Error inicializando OAuth2', error);
      throw new Error(`Error OAuth2: ${error.message}`);
    }
  }

  async getTransporter() {
    try {
      this.logger.info('🔄 Obteniendo access token...');
      
      // Obtener access token con más información de debug
      const tokenResponse = await this.oauth2Client.getAccessToken();
      
      this.logger.info('🔑 Token response recibido:', {
        hasToken: !!tokenResponse.token,
        tokenType: typeof tokenResponse.token,
        tokenStart: tokenResponse.token?.substring(0, 10) + '...'
      });

      if (!tokenResponse.token) {
        throw new Error('No se pudo obtener access token - token vacío');
      }

      this.logger.info('🔧 Creando transporter SMTP...');
      
      // Configuración SMTP más detallada
      const transportConfig = {
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: this.config.user,
          clientId: this.config.clientId,
          clientSecret: this.config.clientSecret,
          refreshToken: this.config.refreshToken,
          accessToken: tokenResponse.token
        },
        debug: process.env.NODE_ENV === 'development', // Debug SMTP en desarrollo
        logger: process.env.NODE_ENV === 'development' // Log SMTP en desarrollo
      };

      const transporter = nodemailer.createTransport(transportConfig);

      this.logger.info('✅ Transporter creado exitosamente');
      
      return transporter;

    } catch (error) {
      this.logger.error('❌ Error detallado en getTransporter:', {
        message: error.message,
        code: error.code,
        status: error.status,
        details: error.details || 'No details available'
      });
      
      // Mensajes de error más específicos
      if (error.message.includes('invalid_grant')) {
        throw new Error('Refresh Token inválido o expirado. Genera uno nuevo en OAuth Playground');
      }
      
      if (error.message.includes('unauthorized_client')) {
        throw new Error('Cliente OAuth no autorizado. Verifica Client ID y Client Secret');
      }
      
      if (error.message.includes('invalid_client')) {
        throw new Error('Cliente inválido. Verifica que las credenciales OAuth2 sean correctas');
      }
      
      throw new Error(`Error configurando Gmail: ${error.message}`);
    }
  }

  async sendEmail(email) {
    try {
      this.logger.info('📨 Iniciando envío de email...', {
        to: email.to,
        subject: email.subject
      });

      const transporter = await this.getTransporter();
      
      const mailOptions = {
        from: email.from || `"E-commerce App" <${this.config.user}>`,
        to: email.to,
        subject: email.subject,
        html: email.html,
        text: email.text,
        attachments: email.attachments || [],
        cc: email.cc || [],
        bcc: email.bcc || [],
        replyTo: email.replyTo
      };

      this.logger.info('📤 Enviando email via SMTP...', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      const result = await transporter.sendMail(mailOptions);
      
      this.logger.info('🎉 Email enviado exitosamente!', {
        messageId: result.messageId,
        response: result.response,
        to: email.to,
        subject: email.subject
      });

      return {
        messageId: result.messageId,
        provider: 'gmail',
        timestamp: new Date(),
        response: result.response
      };

    } catch (error) {
      this.logger.error('❌ Error enviando email:', {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        to: email.to,
        subject: email.subject
      });
      
      throw new Error(`Error enviando email: ${error.message}`);
    }
  }

  async verifyConnection() {
    try {
      this.logger.info('🔍 Verificando conexión con Gmail...', {
        user: this.config.user
      });
      
      const transporter = await this.getTransporter();
      
      this.logger.info('🔄 Ejecutando verify() en transporter...');
      
      await transporter.verify();
      
      this.logger.info('🎉 ¡Conexión con Gmail verificada exitosamente!');
      
      return { 
        status: 'connected', 
        provider: 'gmail',
        user: this.config.user,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('❌ Error verificando conexión Gmail:', {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        user: this.config.user
      });
      
      // Re-lanzar con mensaje más claro
      throw new Error(`Error verificando conexión: ${error.message}`);
    }
  }
}

module.exports = GmailEmailProvider;