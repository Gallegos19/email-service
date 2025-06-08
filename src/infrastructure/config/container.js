const winston = require('winston');

// Domain
const Email = require('../../domain/models/Email');
const EmailTemplate = require('../../domain/models/EmailTemplate');

// Use Cases
const SendEmailUseCase = require('../../application/usecases/SendEmailUseCase');
const SendTemplatedEmailUseCase = require('../../application/usecases/SendTemplatedEmailUserCase');
const HandleWebhookUseCase = require('../../application/usecases/HandleWebHookUseCase');
const GetEmailStatsUseCase = require('../../application/usecases/GetEmailStatUseCase');

// Adapters
const GmailEmailProvider = require('../adapters/GmailEmailProvider');
const HttpMicroserviceClient = require('../adapters/HttpMicroserviceClient');
const InMemoryEmailRepository = require('../adapters/InMemoryEmailRepository');
const EmailTemplateRenderer = require('../templates/EmailTemplateRenderer');

// Web
const EmailRoutes = require('../web/routes/emailRoutes');
const ErrorHandler = require('../web/middleware/errorHandler');

class Container {
  constructor() {
    this.services = new Map();
    this.setupServices();
  }

  setupServices() {
    // Logger
    this.register('logger', () => {
      return winston.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
          })
        ),
        transports: [
          new winston.transports.Console(),
          new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error' 
          }),
          new winston.transports.File({ 
            filename: 'logs/combined.log' 
          })
        ]
      });
    });

    // Email Provider
    this.register('emailProvider', () => {
      const config = {
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        user: process.env.GMAIL_USER
      };
      
      return new GmailEmailProvider(config, this.get('logger'));
    });

    // Microservice Client
    this.register('microserviceClient', () => {
      const config = {
        userServiceUrl: process.env.USER_SERVICE_URL,
        productServiceUrl: process.env.PRODUCT_SERVICE_URL,
        cartServiceUrl: process.env.CART_SERVICE_URL,
        orderServiceUrl: process.env.ORDER_SERVICE_URL
      };
      
      return new HttpMicroserviceClient(config, this.get('logger'));
    });

    // Email Repository
    this.register('emailRepository', () => {
      return new InMemoryEmailRepository(this.get('logger'));
    });

    // Template Renderer
    this.register('templateRenderer', () => {
      return new EmailTemplateRenderer();
    });

    // Use Cases
    this.register('sendEmailUseCase', () => {
      return new SendEmailUseCase(
        this.get('emailProvider'),
        this.get('emailRepository'),
        this.get('logger')
      );
    });

    this.register('sendTemplatedEmailUseCase', () => {
      return new SendTemplatedEmailUseCase(
        this.get('sendEmailUseCase'),
        this.get('templateRenderer'),
        this.get('logger')
      );
    });

    this.register('handleWebhookUseCase', () => {
      return new HandleWebhookUseCase(
        this.get('sendTemplatedEmailUseCase'),
        this.get('microserviceClient'),
        this.get('logger')
      );
    });

    this.register('getEmailStatsUseCase', () => {
      return new GetEmailStatsUseCase(
        this.get('emailRepository'),
        this.get('microserviceClient'),
        this.get('logger')
      );
    });

    // Web Layer
    this.register('emailRoutes', () => {
      return new EmailRoutes(
        this.get('sendEmailUseCase'),
        this.get('sendTemplatedEmailUseCase'),
        this.get('handleWebhookUseCase'),
        this.get('getEmailStatsUseCase'),
        this.get('logger')
      );
    });

    this.register('errorHandler', () => {
      return new ErrorHandler(this.get('logger'));
    });
  }

  register(name, factory) {
    this.services.set(name, { factory, instance: null });
  }

  get(name) {
    const service = this.services.get(name);
    
    if (!service) {
      throw new Error(`Servicio ${name} no registrado`);
    }

    if (!service.instance) {
      service.instance = service.factory();
    }

    return service.instance;
  }
}

module.exports = Container;
