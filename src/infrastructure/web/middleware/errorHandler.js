class ErrorHandler {
  constructor(logger) {
    this.logger = logger;
  }

  handle(error, req, res, next) {
    this.logger.error('Error no manejado:', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      body: req.body
    });

    // Error de validación de Joi
    if (error.isJoi) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Error de configuración de Gmail
    if (error.message.includes('Gmail') || error.message.includes('OAuth')) {
      return res.status(503).json({
        success: false,
        message: 'Servicio de email temporalmente no disponible',
        error: 'Error de configuración del proveedor de email'
      });
    }

    // Error de comunicación con microservicios
    if (error.message.includes('microservicio') || error.message.includes('timeout')) {
      return res.status(502).json({
        success: false,
        message: 'Error de comunicación con servicios externos',
        error: 'Servicio temporalmente no disponible'
      });
    }

    // Error genérico
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
}

module.exports = ErrorHandler;