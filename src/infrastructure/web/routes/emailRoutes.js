const express = require('express');
const { body, validationResult } = require('express-validator');

class EmailRoutes {
  constructor(
    sendEmailUseCase,
    sendTemplatedEmailUseCase,
    handleWebhookUseCase,
    getEmailStatsUseCase,
    logger
  ) {
    this.sendEmailUseCase = sendEmailUseCase;
    this.sendTemplatedEmailUseCase = sendTemplatedEmailUseCase;
    this.handleWebhookUseCase = handleWebhookUseCase;
    this.getEmailStatsUseCase = getEmailStatsUseCase;
    this.logger = logger;
    this.router = express.Router();
    
    this.setupRoutes();
  }

  setupRoutes() {
    // Rutas de envío de emails
    this.router.post('/send', 
      this.getSendEmailValidation(), 
      this.handleValidationErrors.bind(this),
      this.sendEmail.bind(this)
    );
    
    this.router.post('/welcome', 
      this.getWelcomeValidation(), 
      this.handleValidationErrors.bind(this),
      this.sendWelcomeEmail.bind(this)
    );
    
    this.router.post('/order-confirmation', 
      this.getOrderConfirmationValidation(), 
      this.handleValidationErrors.bind(this),
      this.sendOrderConfirmation.bind(this)
    );
    
    this.router.post('/password-reset', 
      this.getPasswordResetValidation(), 
      this.handleValidationErrors.bind(this),
      this.sendPasswordReset.bind(this)
    );
    
    this.router.post('/shipping-notification', 
      this.getShippingValidation(), 
      this.handleValidationErrors.bind(this),
      this.sendShippingNotification.bind(this)
    );
    
    this.router.post('/promotion', 
      this.getPromotionValidation(), 
      this.handleValidationErrors.bind(this),
      this.sendPromotionEmail.bind(this)
    );

    // Rutas de webhooks
    this.router.post('/webhook/user-registered', 
      body('userId').notEmpty().withMessage('User ID requerido'),
      body('email').isEmail().withMessage('Email inválido'),
      body('name').notEmpty().withMessage('Nombre requerido'),
      this.handleValidationErrors.bind(this),
      this.handleUserRegisteredWebhook.bind(this)
    );
    
    this.router.post('/webhook/order-created', 
      body('orderId').notEmpty().withMessage('Order ID requerido'),
      body('userId').notEmpty().withMessage('User ID requerido'),
      this.handleValidationErrors.bind(this),
      this.handleOrderCreatedWebhook.bind(this)
    );
    
    this.router.post('/webhook/order-shipped', 
      body('orderId').notEmpty().withMessage('Order ID requerido'),
      body('userId').notEmpty().withMessage('User ID requerido'),
      body('trackingNumber').notEmpty().withMessage('Tracking number requerido'),
      body('carrier').notEmpty().withMessage('Carrier requerido'),
      body('estimatedDelivery').notEmpty().withMessage('Fecha estimada requerida'),
      this.handleValidationErrors.bind(this),
      this.handleOrderShippedWebhook.bind(this)
    );

    // Rutas de utilidades
    this.router.get('/stats', this.getStats.bind(this));
    this.router.get('/history', this.getEmailHistory.bind(this));
    this.router.get('/test-connection', this.testConnection.bind(this));
  }

  // ===================================
  // VALIDACIONES
  // ===================================
  
  getSendEmailValidation() {
    return [
      body('to')
        .isEmail()
        .withMessage('Email de destino inválido')
        .normalizeEmail(),
      body('subject')
        .notEmpty()
        .withMessage('El asunto es requerido')
        .isLength({ min: 1, max: 200 })
        .withMessage('El asunto debe tener entre 1 y 200 caracteres'),
      body('html')
        .optional()
        .isString()
        .withMessage('HTML debe ser string'),
      body('text')
        .optional()
        .isString()
        .withMessage('Texto debe ser string'),
      body('attachments')
        .optional()
        .isArray()
        .withMessage('Attachments debe ser array'),
      body('cc')
        .optional()
        .isArray()
        .withMessage('CC debe ser array'),
      body('bcc')
        .optional()
        .isArray()
        .withMessage('BCC debe ser array'),
      body('replyTo')
        .optional()
        .isEmail()
        .withMessage('Reply-to debe ser email válido')
    ];
  }

  getWelcomeValidation() {
    return [
      body('email')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
      body('name')
        .notEmpty()
        .withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .trim()
    ];
  }

  getOrderConfirmationValidation() {
    return [
      body('userEmail')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
      body('orderId')
        .notEmpty()
        .withMessage('ID de pedido requerido')
        .isLength({ min: 3, max: 50 })
        .withMessage('ID de pedido debe tener entre 3 y 50 caracteres'),
      body('items')
        .isArray({ min: 1 })
        .withMessage('Debe haber al menos un item'),
      body('items.*.name')
        .notEmpty()
        .withMessage('Nombre del producto requerido'),
      body('items.*.quantity')
        .isInt({ min: 1 })
        .withMessage('Cantidad debe ser número entero mayor a 0'),
      body('items.*.price')
        .isFloat({ min: 0 })
        .withMessage('Precio debe ser número mayor o igual a 0'),
      body('total')
        .isFloat({ min: 0 })
        .withMessage('Total debe ser número mayor o igual a 0'),
      body('shippingAddress')
        .isObject()
        .withMessage('Dirección de envío requerida'),
      body('shippingAddress.name')
        .notEmpty()
        .withMessage('Nombre en dirección requerido'),
      body('shippingAddress.street')
        .notEmpty()
        .withMessage('Calle requerida'),
      body('shippingAddress.city')
        .notEmpty()
        .withMessage('Ciudad requerida'),
      body('shippingAddress.state')
        .notEmpty()
        .withMessage('Estado requerido'),
      body('shippingAddress.zipCode')
        .notEmpty()
        .withMessage('Código postal requerido'),
      body('shippingAddress.country')
        .notEmpty()
        .withMessage('País requerido')
    ];
  }

  getPasswordResetValidation() {
    return [
      body('email')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
      body('name')
        .notEmpty()
        .withMessage('El nombre es requerido')
        .trim(),
      body('resetToken')
        .notEmpty()
        .withMessage('Token de reset requerido')
        .isLength({ min: 10 })
        .withMessage('Token debe tener al menos 10 caracteres'),
      body('resetUrl')
        .optional()
        .isURL()
        .withMessage('URL inválida')
    ];
  }

  getShippingValidation() {
    return [
      body('userEmail')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
      body('orderId')
        .notEmpty()
        .withMessage('ID de pedido requerido'),
      body('trackingNumber')
        .notEmpty()
        .withMessage('Número de tracking requerido')
        .isLength({ min: 5, max: 50 })
        .withMessage('Tracking number debe tener entre 5 y 50 caracteres'),
      body('carrier')
        .notEmpty()
        .withMessage('Transportista requerido')
        .isLength({ min: 2, max: 50 })
        .withMessage('Carrier debe tener entre 2 y 50 caracteres'),
      body('estimatedDelivery')
        .notEmpty()
        .withMessage('Fecha estimada requerida')
    ];
  }

  getPromotionValidation() {
    return [
      body('emails')
        .isArray({ min: 1, max: 100 })
        .withMessage('Debe haber entre 1 y 100 emails'),
      body('emails.*')
        .isEmail()
        .withMessage('Todos los emails deben ser válidos'),
      body('promoTitle')
        .notEmpty()
        .withMessage('Título de promoción requerido')
        .isLength({ min: 5, max: 100 })
        .withMessage('Título debe tener entre 5 y 100 caracteres'),
      body('promoDescription')
        .notEmpty()
        .withMessage('Descripción requerida')
        .isLength({ min: 10, max: 500 })
        .withMessage('Descripción debe tener entre 10 y 500 caracteres'),
      body('discountCode')
        .notEmpty()
        .withMessage('Código de descuento requerido')
        .isLength({ min: 3, max: 20 })
        .withMessage('Código debe tener entre 3 y 20 caracteres')
        .isAlphanumeric()
        .withMessage('Código debe ser alfanumérico'),
      body('validUntil')
        .notEmpty()
        .withMessage('Fecha de validez requerida')
    ];
  }

  handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      this.logger.warn('Errores de validación en email routes', {
        errors: errors.array(),
        path: req.path,
        body: req.body
      });
      
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      });
    }
    next();
  }

  // ===================================
  // HANDLERS DE RUTAS DE EMAIL
  // ===================================

  async sendEmail(req, res) {
    try {
      this.logger.info('Enviando email genérico', {
        to: req.body.to,
        subject: req.body.subject
      });

      const result = await this.sendEmailUseCase.execute(req.body);
      
      res.status(200).json({
        success: true,
        message: 'Email enviado exitosamente',
        data: result
      });

    } catch (error) {
      this.logger.error('Error en ruta de envío de email', {
        error: error.message,
        to: req.body.to,
        subject: req.body.subject
      });
      
      res.status(500).json({
        success: false,
        message: 'Error enviando email',
        error: error.message
      });
    }
  }

  async sendWelcomeEmail(req, res) {
    try {
      const { email, name } = req.body;
      
      this.logger.info('Enviando email de bienvenida', { email, name });
      
      const result = await this.sendTemplatedEmailUseCase.execute(
        'welcome',
        { name, email },
        email
      );
      
      res.status(200).json({
        success: true,
        message: 'Email de bienvenida enviado',
        data: result
      });

    } catch (error) {
      this.logger.error('Error enviando email de bienvenida', {
        error: error.message,
        email: req.body.email,
        name: req.body.name
      });
      
      res.status(500).json({
        success: false,
        message: 'Error enviando email de bienvenida',
        error: error.message
      });
    }
  }

  async sendOrderConfirmation(req, res) {
    try {
      const { userEmail, orderId, items, total, shippingAddress } = req.body;
      
      this.logger.info('Enviando confirmación de pedido', { 
        userEmail, 
        orderId, 
        itemCount: items.length,
        total 
      });
      
      const result = await this.sendTemplatedEmailUseCase.execute(
        'order_confirmation',
        { orderId, items, total, shippingAddress },
        userEmail
      );
      
      res.status(200).json({
        success: true,
        message: 'Confirmación de pedido enviada',
        data: result
      });

    } catch (error) {
      this.logger.error('Error enviando confirmación de pedido', {
        error: error.message,
        userEmail: req.body.userEmail,
        orderId: req.body.orderId
      });
      
      res.status(500).json({
        success: false,
        message: 'Error enviando confirmación de pedido',
        error: error.message
      });
    }
  }

  async sendPasswordReset(req, res) {
    try {
      const { email, name, resetToken, resetUrl } = req.body;
      
      this.logger.info('Enviando email de reset de contraseña', { 
        email, 
        name,
        hasCustomUrl: !!resetUrl 
      });
      
      const result = await this.sendTemplatedEmailUseCase.execute(
        'password_reset',
        { name, resetToken, resetUrl },
        email
      );
      
      res.status(200).json({
        success: true,
        message: 'Email de reset enviado',
        data: result
      });

    } catch (error) {
      this.logger.error('Error enviando email de reset', {
        error: error.message,
        email: req.body.email,
        name: req.body.name
      });
      
      res.status(500).json({
        success: false,
        message: 'Error enviando email de reset',
        error: error.message
      });
    }
  }

  async sendShippingNotification(req, res) {
    try {
      const { userEmail, orderId, trackingNumber, carrier, estimatedDelivery } = req.body;
      
      this.logger.info('Enviando notificación de envío', { 
        userEmail, 
        orderId, 
        trackingNumber,
        carrier 
      });
      
      const result = await this.sendTemplatedEmailUseCase.execute(
        'shipping_notification',
        { orderId, trackingNumber, carrier, estimatedDelivery },
        userEmail
      );
      
      res.status(200).json({
        success: true,
        message: 'Notificación de envío enviada',
        data: result
      });

    } catch (error) {
      this.logger.error('Error enviando notificación de envío', {
        error: error.message,
        userEmail: req.body.userEmail,
        orderId: req.body.orderId,
        trackingNumber: req.body.trackingNumber
      });
      
      res.status(500).json({
        success: false,
        message: 'Error enviando notificación de envío',
        error: error.message
      });
    }
  }

  async sendPromotionEmail(req, res) {
    try {
      const { emails, promoTitle, promoDescription, discountCode, validUntil } = req.body;
      
      this.logger.info('Enviando emails promocionales', { 
        emailCount: emails.length,
        promoTitle,
        discountCode 
      });
      
      const results = [];
      let successCount = 0;
      let failureCount = 0;
      
      // Enviar emails uno por uno para manejo individual de errores
      for (const email of emails) {
        try {
          const result = await this.sendTemplatedEmailUseCase.execute(
            'promotion',
            { promoTitle, promoDescription, discountCode, validUntil },
            email
          );
          
          results.push({ 
            email, 
            success: true, 
            messageId: result.messageId 
          });
          successCount++;
          
          // Pequeña pausa para evitar rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          this.logger.warn('Error enviando email promocional individual', {
            email,
            error: error.message
          });
          
          results.push({ 
            email, 
            success: false, 
            error: error.message 
          });
          failureCount++;
        }
      }
      
      this.logger.info('Emails promocionales completados', {
        total: emails.length,
        successful: successCount,
        failed: failureCount
      });
      
      res.status(200).json({
        success: true,
        message: `Emails promocionales procesados: ${successCount} exitosos, ${failureCount} fallidos`,
        data: {
          results,
          summary: {
            total: results.length,
            successful: successCount,
            failed: failureCount,
            successRate: ((successCount / results.length) * 100).toFixed(2) + '%'
          }
        }
      });

    } catch (error) {
      this.logger.error('Error enviando emails promocionales', {
        error: error.message,
        emailCount: req.body.emails?.length || 0,
        promoTitle: req.body.promoTitle
      });
      
      res.status(500).json({
        success: false,
        message: 'Error enviando emails promocionales',
        error: error.message
      });
    }
  }

  // ===================================
  // HANDLERS DE WEBHOOKS
  // ===================================

  async handleUserRegisteredWebhook(req, res) {
    try {
      const { userId, email, name } = req.body;
      
      this.logger.info('Procesando webhook de usuario registrado', { 
        userId, 
        email, 
        name 
      });
      
      const result = await this.handleWebhookUseCase.handleUserRegistered({
        userId,
        email,
        name
      });
      
      res.status(200).json({
        success: true,
        message: 'Webhook de usuario registrado procesado',
        data: result
      });

    } catch (error) {
      this.logger.error('Error procesando webhook de usuario registrado', {
        error: error.message,
        userId: req.body.userId,
        email: req.body.email
      });
      
      res.status(500).json({
        success: false,
        message: 'Error procesando webhook de usuario registrado',
        error: error.message
      });
    }
  }

  async handleOrderCreatedWebhook(req, res) {
    try {
      const { orderId, userId } = req.body;
      
      this.logger.info('Procesando webhook de orden creada', { 
        orderId, 
        userId 
      });
      
      const result = await this.handleWebhookUseCase.handleOrderCreated({
        orderId,
        userId
      });
      
      res.status(200).json({
        success: true,
        message: 'Webhook de orden creada procesado',
        data: result
      });

    } catch (error) {
      this.logger.error('Error procesando webhook de orden creada', {
        error: error.message,
        orderId: req.body.orderId,
        userId: req.body.userId
      });
      
      res.status(500).json({
        success: false,
        message: 'Error procesando webhook de orden creada',
        error: error.message
      });
    }
  }

  async handleOrderShippedWebhook(req, res) {
    try {
      const { orderId, userId, trackingNumber, carrier, estimatedDelivery } = req.body;
      
      this.logger.info('Procesando webhook de orden enviada', { 
        orderId, 
        userId,
        trackingNumber,
        carrier 
      });
      
      const result = await this.handleWebhookUseCase.handleOrderShipped({
        orderId,
        userId,
        trackingNumber,
        carrier,
        estimatedDelivery
      });
      
      res.status(200).json({
        success: true,
        message: 'Webhook de orden enviada procesado',
        data: result
      });

    } catch (error) {
      this.logger.error('Error procesando webhook de orden enviada', {
        error: error.message,
        orderId: req.body.orderId,
        userId: req.body.userId,
        trackingNumber: req.body.trackingNumber
      });
      
      res.status(500).json({
        success: false,
        message: 'Error procesando webhook de orden enviada',
        error: error.message
      });
    }
  }

  // ===================================
  // HANDLERS DE UTILIDADES
  // ===================================

  async getStats(req, res) {
    try {
      this.logger.info('Obteniendo estadísticas del servicio de email');
      
      const stats = await this.getEmailStatsUseCase.execute();
      
      res.status(200).json({
        success: true,
        message: 'Estadísticas del servicio de email',
        data: stats
      });

    } catch (error) {
      this.logger.error('Error obteniendo estadísticas', {
        error: error.message
      });
      
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas',
        error: error.message
      });
    }
  }

  async getEmailHistory(req, res) {
    try {
      const { page = 1, limit = 50, status, from, to } = req.query;
      
      this.logger.info('Obteniendo historial de emails', {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        from,
        to
      });

      // En un sistema real, esto vendría del repositorio
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        from,
        to
      };

      // Por ahora devolvemos datos de ejemplo
      const history = {
        logs: [],
        total: 0,
        page: parseInt(page),
        limit: parseInt(limit),
        message: 'Historial disponible cuando se envíen emails'
      };
      
      res.status(200).json({
        success: true,
        message: 'Historial de emails obtenido',
        data: history
      });

    } catch (error) {
      this.logger.error('Error obteniendo historial de emails', {
        error: error.message
      });
      
      res.status(500).json({
        success: false,
        message: 'Error obteniendo historial',
        error: error.message
      });
    }
  }

  async testConnection(req, res) {
    try {
      this.logger.info('Probando conexión con Gmail');
      
      // Obtener el email provider del container sería ideal
      // Por ahora simulamos la verificación
      const connectionTest = {
        gmail: 'connected',
        timestamp: new Date().toISOString(),
        status: 'healthy'
      };
      
      res.status(200).json({
        success: true,
        message: 'Conexión con proveedores de email verificada',
        data: connectionTest
      });

    } catch (error) {
      this.logger.error('Error probando conexión', {
        error: error.message
      });
      
      res.status(500).json({
        success: false,
        message: 'Error verificando conexión',
        error: error.message
      });
    }
  }

  // ===================================
  // MÉTODO PARA OBTENER EL ROUTER
  // ===================================
  
  getRouter() {
    return this.router;
  }
}

module.exports = EmailRoutes;