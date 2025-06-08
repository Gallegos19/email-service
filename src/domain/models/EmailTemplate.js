class EmailTemplate {
  constructor(type, data) {
    this.type = type;
    this.data = data;
    this.createdAt = new Date();
  }

  static TYPES = {
    WELCOME: 'welcome',
    ORDER_CONFIRMATION: 'order_confirmation',
    PASSWORD_RESET: 'password_reset',
    SHIPPING_NOTIFICATION: 'shipping_notification',
    PROMOTION: 'promotion'
  };

  validate() {
    const errors = [];

    if (!Object.values(EmailTemplate.TYPES).includes(this.type)) {
      errors.push('Tipo de template inválido');
    }

    // Validaciones específicas por tipo
    switch (this.type) {
      case EmailTemplate.TYPES.WELCOME:
        if (!this.data.name || !this.data.email) {
          errors.push('Template de bienvenida requiere name y email');
        }
        break;

      case EmailTemplate.TYPES.ORDER_CONFIRMATION:
        if (!this.data.orderId || !this.data.items || !this.data.total) {
          errors.push('Template de confirmación requiere orderId, items y total');
        }
        break;

      case EmailTemplate.TYPES.PASSWORD_RESET:
        if (!this.data.name || !this.data.resetToken) {
          errors.push('Template de reset requiere name y resetToken');
        }
        break;

      case EmailTemplate.TYPES.SHIPPING_NOTIFICATION:
        if (!this.data.orderId || !this.data.trackingNumber) {
          errors.push('Template de envío requiere orderId y trackingNumber');
        }
        break;

      case EmailTemplate.TYPES.PROMOTION:
        if (!this.data.promoTitle || !this.data.discountCode) {
          errors.push('Template promocional requiere promoTitle y discountCode');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = EmailTemplate;
