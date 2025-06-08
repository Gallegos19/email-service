const Email = require('../../domain/models/Email');

class SendEmailUseCase {
  constructor(emailProvider, emailRepository, logger) {
    this.emailProvider = emailProvider;
    this.emailRepository = emailRepository;
    this.logger = logger;
  }

  async execute(emailData) {
    try {
      // 1. Crear objeto de dominio
      const email = new Email(emailData);

      // 2. Validar email
      const validation = email.validate();
      if (!validation.isValid) {
        throw new Error(`Email inválido: ${validation.errors.join(', ')}`);
      }

      // 3. Intentar envío
      this.logger.info('Enviando email', email.getSummary());
      
      const result = await this.emailProvider.sendEmail(email);

      // 4. Registrar éxito
      await this.emailRepository.saveEmailLog({
        ...email.getSummary(),
        status: 'sent',
        messageId: result.messageId,
        sentAt: new Date()
      });

      this.logger.info('Email enviado exitosamente', {
        to: email.to,
        messageId: result.messageId
      });

      return {
        success: true,
        message: 'Email de bienvenida enviado',
        data: result
      };
      

    } catch (error) {
      this.logger.error('Error enviando email de bienvenida', error);
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
      this.logger.error('Error enviando confirmación de pedido', error);
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
      this.logger.error('Error enviando email de reset', error);
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
      this.logger.error('Error enviando notificación de envío', error);
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
      
      const results = [];
      
      for (const email of emails) {
        try {
          const result = await this.sendTemplatedEmailUseCase.execute(
            'promotion',
            { promoTitle, promoDescription, discountCode, validUntil },
            email
          );
          results.push({ email, success: true, messageId: result.messageId });
        } catch (error) {
          results.push({ email, success: false, error: error.message });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      res.status(200).json({
        success: true,
        message: `Emails promocionales enviados: ${successCount} exitosos, ${failureCount} fallidos`,
        data: {
          results,
          summary: {
            total: results.length,
            successful: successCount,
            failed: failureCount
          }
        }
      });

    } catch (error) {
      this.logger.error('Error enviando emails promocionales', error);
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
      const result = await this.handleWebhookUseCase.handleUserRegistered(req.body);
      
      res.status(200).json({
        success: true,
        message: 'Webhook de usuario registrado procesado',
        data: result
      });

    } catch (error) {
      this.logger.error('Error procesando webhook de usuario registrado', error);
      res.status(500).json({
        success: false,
        message: 'Error procesando webhook',
        error: error.message
      });
    }
  }

  async handleOrderCreatedWebhook(req, res) {
    try {
      const result = await this.handleWebhookUseCase.handleOrderCreated(req.body);
      
      res.status(200).json({
        success: true,
        message: 'Webhook de orden creada procesado',
        data: result
      });

    } catch (error) {
      this.logger.error('Error procesando webhook de orden creada', error);
      res.status(500).json({
        success: false,
        message: 'Error procesando webhook',
        error: error.message
      });
    }
  }

  async handleOrderShippedWebhook(req, res) {
    try {
      const result = await this.handleWebhookUseCase.handleOrderShipped(req.body);
      
      res.status(200).json({
        success: true,
        message: 'Webhook de orden enviada procesado',
        data: result
      });

    } catch (error) {
      this.logger.error('Error procesando webhook de orden enviada', error);
      res.status(500).json({
        success: false,
        message: 'Error procesando webhook',
        error: error.message
      });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await this.getEmailStatsUseCase.execute();
      
      res.status(200).json({
        success: true,
        message: 'Estadísticas del servicio de email',
        data: stats
      });

    } catch (error) {
      this.logger.error('Error obteniendo estadísticas', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas',
        error: error.message
      });
    }
  }

  getRouter() {
    return this.router;
  }
}

module.exports = SendEmailUseCase;