const EmailTemplate = require('../../domain/models/EmailTemplate');

class EmailTemplateRenderer {
  constructor() {
    this.templates = new Map();
    this.initializeTemplates();
  }

  initializeTemplates() {
    // Template de Bienvenida
    this.templates.set(EmailTemplate.TYPES.WELCOME, {
      subject: (data) => `¡Bienvenido ${data.name}! 🎉`,
      html: (data) => this.getWelcomeHtml(data),
      text: (data) => this.getWelcomeText(data)
    });

    // Template de Confirmación de Pedido
    this.templates.set(EmailTemplate.TYPES.ORDER_CONFIRMATION, {
      subject: (data) => `Confirmación de pedido #${data.orderId}`,
      html: (data) => this.getOrderConfirmationHtml(data),
      text: (data) => this.getOrderConfirmationText(data)
    });

    // Template de Reset de Contraseña
    this.templates.set(EmailTemplate.TYPES.PASSWORD_RESET, {
      subject: (data) => 'Restablecer contraseña 🔐',
      html: (data) => this.getPasswordResetHtml(data),
      text: (data) => this.getPasswordResetText(data)
    });

    // Template de Notificación de Envío
    this.templates.set(EmailTemplate.TYPES.SHIPPING_NOTIFICATION, {
      subject: (data) => `Tu pedido #${data.orderId} está en camino 📦`,
      html: (data) => this.getShippingNotificationHtml(data),
      text: (data) => this.getShippingNotificationText(data)
    });

    // Template Promocional
    this.templates.set(EmailTemplate.TYPES.PROMOTION, {
      subject: (data) => `🔥 ${data.promoTitle} - ¡Oferta especial!`,
      html: (data) => this.getPromotionHtml(data),
      text: (data) => this.getPromotionText(data)
    });
  }

  render(emailTemplate) {
    const template = this.templates.get(emailTemplate.type);
    
    if (!template) {
      throw new Error(`Template no encontrado: ${emailTemplate.type}`);
    }

    return {
      subject: template.subject(emailTemplate.data),
      html: template.html(emailTemplate.data),
      text: template.text(emailTemplate.data)
    };
  }

  // ===================================
  // TEMPLATES HTML
  // ===================================
  
  getWelcomeHtml({ name, email }) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff;
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            text-align: center; 
            padding: 30px 20px;
            word-wrap: break-word;
          }
          .header h1 { 
            margin: 0; 
            font-size: 24px; 
            font-weight: 300;
            word-wrap: break-word;
            max-width: 100%;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
          }
          .content { 
            padding: 30px 20px; 
            background: #f8f9fa; 
          }
          .welcome-box { 
            background: white; 
            padding: 25px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            word-wrap: break-word;
          }
          .welcome-box h2 {
            margin-top: 0;
            color: #333;
            font-size: 22px;
          }
          .welcome-box p {
            margin: 15px 0;
            word-wrap: break-word;
          }
          .button { 
            display: inline-block; 
            background: #667eea; 
            color: white !important; 
            padding: 12px 25px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0; 
            font-weight: 500;
            text-align: center;
          }
          .features { 
            display: block;
            margin: 25px 0; 
          }
          .feature { 
            background: #f1f3f4; 
            padding: 15px; 
            border-radius: 6px; 
            margin-bottom: 10px;
            word-wrap: break-word;
          }
          .feature h4 {
            margin: 0 0 8px 0;
            color: #333;
            font-size: 16px;
          }
          .feature p {
            margin: 0;
            font-size: 14px;
            color: #666;
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            color: #666; 
            font-size: 12px;
            background: #fff;
            word-wrap: break-word;
          }
          .footer p {
            margin: 5px 0;
          }
          
          /* Responsive para móviles */
          @media only screen and (max-width: 600px) {
            .container {
              width: 100% !important;
              max-width: 100% !important;
            }
            .content {
              padding: 20px 15px !important;
            }
            .welcome-box {
              padding: 20px !important;
            }
            .header {
              padding: 25px 15px !important;
            }
            .header h1 {
              font-size: 20px !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Bienvenido ${name}! 🎉</h1>
            <p>Gracias por unirte a nuestra comunidad</p>
          </div>
          <div class="content">
            <div class="welcome-box">
              <h2>¡Tu cuenta está lista!</h2>
              <p>Hola <strong>${name}</strong>,</p>
              <p>¡Qué emoción tenerte con nosotros! Tu cuenta ha sido creada exitosamente y ya puedes comenzar a explorar todos nuestros productos.</p>
              
              <div class="features">
                <div class="feature">
                  <h4>🛍️ Explorar</h4>
                  <p>Descubre nuestro catálogo completo</p>
                </div>
                <div class="feature">
                  <h4>💝 Lista de deseos</h4>
                  <p>Guarda tus productos favoritos</p>
                </div>
                <div class="feature">
                  <h4>🚚 Envío rápido</h4>
                  <p>Entrega en 24-48 horas</p>
                </div>
              </div>
              
              <div style="text-align: center;">
                <a href="http://localhost:3000/products" class="button">Explorar Productos</a>
              </div>
              
              <p>Si tienes alguna pregunta, no dudes en contactarnos. ¡Estamos aquí para ayudarte!</p>
            </div>
          </div>
          <div class="footer">
            <p>© 2024 E-commerce App. Todos los derechos reservados.</p>
            <p>Email registrado: ${email}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getWelcomeText({ name, email }) {
    return `
      ¡Bienvenido ${name}!
      
      Gracias por unirte a nuestra comunidad. Tu cuenta ha sido creada exitosamente.
      
      Ya puedes:
      - 🛍️ Explorar nuestro catálogo de productos
      - 💝 Agregar productos a tu lista de deseos
      - 🚚 Realizar tu primera compra con envío rápido
      
      Visita: http://localhost:3000/products
      
      Email registrado: ${email}
      
      ¡Gracias por elegirnos!
    `;
  }

  getOrderConfirmationHtml({ orderId, items, total, shippingAddress }) {
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee; word-wrap: break-word;">${item.name}</td>
        <td style="padding: 12px; text-align: center; border-bottom: 1px solid #eee;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">$${item.price}</td>
        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee; font-weight: bold;">$${(item.quantity * item.price).toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff;
            overflow: hidden;
          }
          .header { 
            background: #28a745; 
            color: white; 
            text-align: center; 
            padding: 30px 20px;
            word-wrap: break-word;
          }
          .header h1 { 
            margin: 0; 
            font-size: 24px; 
            font-weight: 300;
          }
          .content { 
            padding: 30px 20px; 
            background: #f8f9fa; 
          }
          .order-box { 
            background: white; 
            padding: 25px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            word-wrap: break-word;
          }
          .order-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
            background: white;
            overflow-x: auto;
          }
          .order-table th { 
            background-color: #f8f9fa; 
            padding: 12px 8px; 
            text-align: left; 
            font-weight: 600; 
            color: #495057;
            font-size: 14px;
          }
          .order-table td {
            padding: 12px 8px;
            font-size: 14px;
            word-wrap: break-word;
            max-width: 200px;
          }
          .total-row { 
            background-color: #e8f5e8; 
            font-weight: bold; 
            font-size: 16px; 
          }
          .address-box { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 6px; 
            margin: 15px 0; 
            border-left: 4px solid #28a745;
            word-wrap: break-word;
          }
          .status-badge { 
            background: #28a745; 
            color: white; 
            padding: 5px 15px; 
            border-radius: 20px; 
            font-size: 12px; 
            font-weight: bold; 
          }
          .footer {
            text-align: center; 
            padding: 20px; 
            color: #666; 
            font-size: 12px;
            background: #fff;
          }
          
          @media only screen and (max-width: 600px) {
            .container {
              width: 100% !important;
              max-width: 100% !important;
            }
            .content {
              padding: 20px 15px !important;
            }
            .order-box {
              padding: 20px !important;
            }
            .header {
              padding: 25px 15px !important;
            }
            .order-table th,
            .order-table td {
              padding: 8px 4px !important;
              font-size: 12px !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Pedido Confirmado! ✅</h1>
            <p>Pedido #${orderId}</p>
            <span class="status-badge">CONFIRMADO</span>
          </div>
          <div class="content">
            <div class="order-box">
              <h2 style="margin-top: 0;">Gracias por tu compra</h2>
              <p>Tu pedido ha sido confirmado y está siendo procesado por nuestro equipo.</p>
              
              <h3>Detalles del pedido:</h3>
              <div style="overflow-x: auto;">
                <table class="order-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th style="text-align: center;">Cant.</th>
                      <th style="text-align: right;">Precio</th>
                      <th style="text-align: right;">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                    <tr class="total-row">
                      <td colspan="3" style="text-align: right; padding: 15px 8px;">TOTAL:</td>
                      <td style="text-align: right; color: #28a745; padding: 15px 8px;">$${total}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <h3>Dirección de envío:</h3>
              <div class="address-box">
                <strong>${shippingAddress.name}</strong><br>
                ${shippingAddress.street}<br>
                ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}<br>
                ${shippingAddress.country}
              </div>
              
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <strong>📦 Información de entrega:</strong><br>
                • Tiempo estimado: 3-5 días hábiles<br>
                • Te notificaremos cuando tu pedido sea enviado<br>
                • Recibirás un número de seguimiento
              </div>
            </div>
          </div>
          <div class="footer">
            <p>© 2024 E-commerce App. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getOrderConfirmationText({ orderId, items, total, shippingAddress }) {
    return `
      ¡Pedido Confirmado! ✅
      
      Pedido #${orderId}
      
      Detalles del pedido:
      ${items.map(item => `- ${item.name} x${item.quantity} - $${(item.quantity * item.price).toFixed(2)}`).join('\n')}
      
      TOTAL: $${total}
      
      Dirección de envío:
      ${shippingAddress.name}
      ${shippingAddress.street}
      ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}
      ${shippingAddress.country}
      
      📦 Información de entrega:
      • Tiempo estimado: 3-5 días hábiles
      • Te notificaremos cuando sea enviado
      • Recibirás número de seguimiento
      
      ¡Gracias por tu compra!
    `;
  }

  getPasswordResetHtml({ name, resetToken, resetUrl }) {
    const finalResetUrl = resetUrl || `http://localhost:3000/reset-password?token=${resetToken}`;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff;
            overflow: hidden;
          }
          .header { 
            background: #dc3545; 
            color: white; 
            text-align: center; 
            padding: 30px 20px;
            word-wrap: break-word;
          }
          .header h1 { 
            margin: 0; 
            font-size: 24px; 
            font-weight: 300;
          }
          .content { 
            padding: 30px 20px; 
            background: #f8f9fa; 
          }
          .reset-box { 
            background: white; 
            padding: 25px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            word-wrap: break-word;
          }
          .button { 
            display: inline-block; 
            background: #dc3545; 
            color: white !important; 
            padding: 15px 25px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0; 
            font-weight: 500; 
            font-size: 16px;
            text-align: center;
          }
          .warning { 
            background: #fff3cd; 
            border: 1px solid #ffeaa7; 
            padding: 15px; 
            border-radius: 6px; 
            margin: 15px 0; 
            border-left: 4px solid #ffc107;
            word-wrap: break-word;
          }
          .security-info { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 6px; 
            margin: 15px 0;
            word-wrap: break-word;
          }
          .footer {
            text-align: center; 
            padding: 20px; 
            color: #666; 
            font-size: 12px;
            background: #fff;
          }
          .url-box {
            word-break: break-all; 
            color: #666; 
            background: white; 
            padding: 10px; 
            border-radius: 4px; 
            font-family: monospace;
            font-size: 12px;
            border: 1px solid #ddd;
          }
          
          @media only screen and (max-width: 600px) {
            .container {
              width: 100% !important;
              max-width: 100% !important;
            }
            .content {
              padding: 20px 15px !important;
            }
            .reset-box {
              padding: 20px !important;
            }
            .header {
              padding: 25px 15px !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Restablecer Contraseña</h1>
            <p>Solicitud de cambio de contraseña</p>
          </div>
          <div class="content">
            <div class="reset-box">
              <h2 style="margin-top: 0;">Hola ${name}</h2>
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
              
              <p>Para crear una nueva contraseña, haz clic en el siguiente botón:</p>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="${finalResetUrl}" class="button">Restablecer Contraseña</a>
              </div>
              
              <div class="warning">
                <strong>⚠️ Información importante:</strong>
                <ul style="margin: 10px 0;">
                  <li>Este enlace expira en <strong>1 hora</strong></li>
                  <li>Solo puede ser usado <strong>una vez</strong></li>
                  <li>Si no solicitaste este cambio, <strong>ignora este email</strong></li>
                </ul>
              </div>
              
              <div class="security-info">
                <h4 style="margin-top: 0;">🛡️ Por tu seguridad:</h4>
                <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                <div class="url-box">${finalResetUrl}</div>
              </div>
              
              <p><small>Si tienes problemas, contacta a nuestro equipo de soporte.</small></p>
            </div>
          </div>
          <div class="footer">
            <p>© 2024 E-commerce App. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetText({ name, resetToken, resetUrl }) {
    const finalResetUrl = resetUrl || `http://localhost:3000/reset-password?token=${resetToken}`;
    
    return `
      🔐 Restablecer Contraseña
      
      Hola ${name},
      
      Recibimos una solicitud para restablecer la contraseña de tu cuenta.
      
      Usa este enlace para crear una nueva contraseña:
      ${finalResetUrl}
      
      ⚠️ IMPORTANTE:
      - El enlace expira en 1 hora
      - Solo puede ser usado una vez
      - Si no solicitaste este cambio, ignora este email
      
      Por tu seguridad, no compartas este enlace con nadie.
      
      Si tienes problemas, contacta a soporte.
    `;
  }

  getShippingNotificationHtml({ orderId, trackingNumber, carrier, estimatedDelivery }) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff;
            overflow: hidden;
          }
          .header { 
            background: #17a2b8; 
            color: white; 
            text-align: center; 
            padding: 30px 20px;
            word-wrap: break-word;
          }
          .header h1 { 
            margin: 0; 
            font-size: 24px; 
            font-weight: 300;
          }
          .content { 
            padding: 30px 20px; 
            background: #f8f9fa; 
          }
          .shipping-box { 
            background: white; 
            padding: 25px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            word-wrap: break-word;
          }
          .tracking-box { 
            background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); 
            color: white; 
            padding: 20px; 
            border-radius: 8px; 
            text-align: center; 
            margin: 20px 0;
            word-wrap: break-word;
          }
          .tracking-number { 
            font-size: 20px; 
            font-weight: bold; 
            letter-spacing: 1px; 
            background: rgba(255,255,255,0.2); 
            padding: 12px; 
            border-radius: 6px; 
            margin: 15px 0; 
            font-family: monospace;
            word-break: break-all;
          }
          .delivery-info { 
            background: #e8f5e8; 
            padding: 15px; 
            border-radius: 6px; 
            margin: 15px 0; 
            border-left: 4px solid #28a745;
            word-wrap: break-word;
          }
          .status-timeline { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 6px; 
            margin: 15px 0;
            word-wrap: break-word;
          }
          .footer {
            text-align: center; 
            padding: 20px; 
            color: #666; 
            font-size: 12px;
            background: #fff;
          }
          
          @media only screen and (max-width: 600px) {
            .container {
              width: 100% !important;
              max-width: 100% !important;
            }
            .content {
              padding: 20px 15px !important;
            }
            .shipping-box {
              padding: 20px !important;
            }
            .header {
              padding: 25px 15px !important;
            }
            .tracking-number {
              font-size: 16px !important;
              padding: 10px !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 ¡Tu pedido está en camino!</h1>
            <p>Pedido #${orderId} enviado</p>
          </div>
          <div class="content">
            <div class="shipping-box">
              <h2 style="margin-top: 0;">¡Excelentes noticias!</h2>
              <p>Tu pedido ha sido enviado y está en camino hacia ti. Puedes rastrearlo en tiempo real.</p>
              
              <div class="tracking-box">
                <h3 style="margin-top: 0;">📍 Número de seguimiento</h3>
                <div class="tracking-number">${trackingNumber}</div>
                <p style="margin-bottom: 0;"><strong>Transportista:</strong> ${carrier}</p>
              </div>
              
              <div class="delivery-info">
                <h3 style="margin-top: 0;">🚚 Información de entrega</h3>
                <ul style="margin: 10px 0;">
                  <li><strong>Fecha estimada:</strong> ${estimatedDelivery}</li>
                  <li><strong>Horario:</strong> 9:00 AM - 6:00 PM</li>
                  <li><strong>Estado actual:</strong> En tránsito</li>
                </ul>
              </div>
              
              <div class="status-timeline">
                <h4 style="margin-top: 0;">📋 Estado del envío:</h4>
                <p style="margin-bottom: 0;">✅ Pedido confirmado<br>
                ✅ Preparando envío<br>
                ✅ <strong>En tránsito</strong><br>
                ⏳ En reparto<br>
                ⏳ Entregado</p>
              </div>
              
              <p><strong>¿Necesitas reprogramar la entrega?</strong> Contacta directamente con ${carrier} usando tu número de seguimiento.</p>
              
              <p style="text-align: center; margin-top: 25px;">
                <strong>¡Gracias por tu compra! 🎉</strong>
              </p>
            </div>
          </div>
          <div class="footer">
            <p>© 2024 E-commerce App. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getShippingNotificationText({ orderId, trackingNumber, carrier, estimatedDelivery }) {
    return `
      📦 ¡Tu pedido está en camino!
      
      Pedido #${orderId}
      
      📍 Información de seguimiento:
      Número: ${trackingNumber}
      Transportista: ${carrier}
      
      🚚 Entrega estimada: ${estimatedDelivery}
      Horario: 9:00 AM - 6:00 PM
      
      📋 Estado actual: En tránsito
      ✅ Pedido confirmado
      ✅ Preparando envío  
      ✅ En tránsito
      ⏳ En reparto
      ⏳ Entregado
      
      Puedes rastrear tu paquete en tiempo real usando el número de seguimiento.
      
      Para reprogramar entrega, contacta con ${carrier}.
      
      ¡Gracias por tu compra! 🎉
    `;
  }

  getPromotionHtml({ promoTitle, promoDescription, discountCode, validUntil }) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff;
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); 
            color: white; 
            text-align: center; 
            padding: 30px 20px;
            word-wrap: break-word;
          }
          .header h1 { 
            margin: 0; 
            font-size: 26px; 
            font-weight: bold; 
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
          }
          .content { 
            padding: 30px 20px; 
            background: #f8f9fa; 
          }
          .promo-box { 
            background: white; 
            padding: 25px; 
            border-radius: 8px; 
            box-shadow: 0 2px 15px rgba(0,0,0,0.1);
            word-wrap: break-word;
          }
          .discount-box { 
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); 
            color: white; 
            padding: 25px; 
            border-radius: 10px; 
            text-align: center; 
            margin: 20px 0;
            word-wrap: break-word;
          }
          .discount-code { 
            font-size: 24px; 
            font-weight: bold; 
            letter-spacing: 2px; 
            background: rgba(255,255,255,0.2); 
            padding: 15px; 
            border-radius: 6px; 
            margin: 15px 0; 
            font-family: monospace; 
            border: 2px dashed rgba(255,255,255,0.5);
            word-break: break-all;
          }
          .button { 
            display: inline-block; 
            background: #fff; 
            color: #ee5a24 !important; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0; 
            font-weight: bold; 
            font-size: 16px; 
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            text-align: center;
          }
          .urgency { 
            background: #fff3cd; 
            border-left: 4px solid #ffc107; 
            padding: 15px; 
            margin: 15px 0; 
            border-radius: 4px;
            word-wrap: break-word;
          }
          .benefits { 
            display: block;
            margin: 20px 0; 
          }
          .benefit { 
            background: #f1f3f4; 
            padding: 15px; 
            border-radius: 6px; 
            text-align: center;
            margin-bottom: 10px;
            word-wrap: break-word;
          }
          .benefit h4 {
            margin: 0 0 8px 0;
            color: #333;
            font-size: 16px;
          }
          .benefit p {
            margin: 0;
            font-size: 14px;
            color: #666;
          }
          .terms-box {
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 6px; 
            margin: 15px 0;
            word-wrap: break-word;
          }
          .footer {
            text-align: center; 
            padding: 20px; 
            color: #666; 
            font-size: 12px;
            background: #fff;
          }
          
          @media only screen and (max-width: 600px) {
            .container {
              width: 100% !important;
              max-width: 100% !important;
            }
            .content {
              padding: 20px 15px !important;
            }
            .promo-box {
              padding: 20px !important;
            }
            .header {
              padding: 25px 15px !important;
            }
            .header h1 {
              font-size: 22px !important;
            }
            .discount-code {
              font-size: 18px !important;
              padding: 12px !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔥 ${promoTitle}</h1>
            <p>¡Oferta por tiempo limitado!</p>
          </div>
          <div class="content">
            <div class="promo-box">
              <h2 style="margin-top: 0;">¡No te pierdas esta increíble oferta!</h2>
              <p style="font-size: 16px;">${promoDescription}</p>
              
              <div class="discount-box">
                <h3 style="margin-top: 0;">🎫 Tu código de descuento exclusivo</h3>
                <div class="discount-code">${discountCode}</div>
                <p style="margin-bottom: 0;">¡Copia este código y úsalo en tu próxima compra!</p>
              </div>
              
              <div class="urgency">
                <strong>⏰ ¡Date prisa!</strong><br>
                Esta oferta especial es válida hasta: <strong>${validUntil}</strong><br>
                ¡No dejes pasar esta oportunidad única!
              </div>
              
              <div class="benefits">
                <div class="benefit">
                  <h4>🚚 Envío gratis</h4>
                  <p>En compras superiores a $50</p>
                </div>
                <div class="benefit">
                  <h4>💳 Pago seguro</h4>
                  <p>Múltiples métodos disponibles</p>
                </div>
                <div class="benefit">
                  <h4>↩️ Devoluciones</h4>
                  <p>30 días sin preguntas</p>
                </div>
              </div>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="http://localhost:3000/products" class="button">¡Comprar Ahora!</a>
              </div>
              
              <div class="terms-box">
                <h4 style="margin-top: 0;">📋 Términos y condiciones:</h4>
                <ul style="margin: 10px 0; color: #666; font-size: 14px;">
                  <li>Válido hasta ${validUntil}</li>
                  <li>No acumulable con otras promociones</li>
                  <li>Aplicable a productos seleccionados</li>
                  <li>Un uso por cliente</li>
                  <li>Sujeto a disponibilidad de stock</li>
                </ul>
              </div>
            </div>
          </div>
          <div class="footer">
            <p>© 2024 E-commerce App. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPromotionText({ promoTitle, promoDescription, discountCode, validUntil }) {
    return `
      🔥 ${promoTitle}
      
      ¡Oferta por tiempo limitado!
      
      ${promoDescription}
      
      🎫 Tu código de descuento exclusivo:
      ${discountCode}
      
      ⏰ Válido hasta: ${validUntil}
      
      ¡Compra ahora en: http://localhost:3000/products
      
      Beneficios incluidos:
      🚚 Envío gratis en compras +$50
      💳 Pago 100% seguro
      ↩️ Devoluciones en 30 días
      
      📋 Términos:
      - No acumulable con otras promociones
      - Un uso por cliente
      - Aplicable a productos seleccionados
      - Sujeto a disponibilidad
      
      ¡No dejes pasar esta oportunidad única! 🎯
    `;
  }
}

module.exports = EmailTemplateRenderer;