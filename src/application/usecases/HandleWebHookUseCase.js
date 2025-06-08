const EmailTemplate = require('../../domain/models/EmailTemplate');

class HandleWebhookUseCase {
  constructor(sendTemplatedEmailUseCase, microserviceClient, logger) {
    this.sendTemplatedEmailUseCase = sendTemplatedEmailUseCase;
    this.microserviceClient = microserviceClient;
    this.logger = logger;
  }

  async handleUserRegistered(webhookData) {
    try {
      const { userId, email, name } = webhookData;

      this.logger.info('Procesando webhook de usuario registrado', { userId, email });

      // Enviar email de bienvenida
      await this.sendTemplatedEmailUseCase.execute(
        EmailTemplate.TYPES.WELCOME,
        { name, email },
        email
      );

      return { success: true, action: 'welcome_email_sent' };

    } catch (error) {
      this.logger.error('Error procesando webhook de usuario registrado', error);
      throw error;
    }
  }

  async handleOrderCreated(webhookData) {
    try {
      const { orderId, userId } = webhookData;

      this.logger.info('Procesando webhook de orden creada', { orderId, userId });

      // Obtener detalles de la orden
      const orderDetails = await this.microserviceClient.getOrderById(orderId);
      
      // Obtener datos del usuario
      const userData = await this.microserviceClient.getUserById(userId);

      // Enviar confirmación de pedido
      await this.sendTemplatedEmailUseCase.execute(
        EmailTemplate.TYPES.ORDER_CONFIRMATION,
        {
          orderId: orderDetails.id,
          items: orderDetails.items,
          total: orderDetails.total,
          shippingAddress: orderDetails.shippingAddress
        },
        userData.email
      );

      return { success: true, action: 'order_confirmation_sent' };

    } catch (error) {
      this.logger.error('Error procesando webhook de orden creada', error);
      throw error;
    }
  }

  async handleOrderShipped(webhookData) {
    try {
      const { orderId, userId, trackingNumber, carrier, estimatedDelivery } = webhookData;

      this.logger.info('Procesando webhook de orden enviada', { orderId, trackingNumber });

      // Obtener datos del usuario
      const userData = await this.microserviceClient.getUserById(userId);

      // Enviar notificación de envío
      await this.sendTemplatedEmailUseCase.execute(
        EmailTemplate.TYPES.SHIPPING_NOTIFICATION,
        {
          orderId,
          trackingNumber,
          carrier,
          estimatedDelivery
        },
        userData.email
      );

      return { success: true, action: 'shipping_notification_sent' };

    } catch (error) {
      this.logger.error('Error procesando webhook de orden enviada', error);
      throw error;
    }
  }
}

module.exports = HandleWebhookUseCase;
