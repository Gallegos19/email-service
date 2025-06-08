const axios = require('axios');
const IMicroserviceClient = require('../../domain/services/IMicroserviceClient');

class HttpMicroserviceClient extends IMicroserviceClient {
  constructor(config, logger) {
    super();
    this.config = config;
    this.logger = logger;
    
    this.httpClient = axios.create({
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'email-service/1.0.0'
      }
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    this.httpClient.interceptors.request.use(
      (config) => {
        this.logger.info(`Petición a microservicio: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('Error en petición', error);
        return Promise.reject(error);
      }
    );

    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.info(`Respuesta de microservicio: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        this.logger.error('Error en respuesta', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message
        });
        return Promise.reject(error);
      }
    );
  }

  async getUserById(userId) {
    try {
      const response = await this.httpClient.get(`${this.config.userServiceUrl}/api/users/${userId}`);
      return response.data.data;
    } catch (error) {
      this.logger.error(`Error obteniendo usuario ${userId}`, error.message);
      throw new Error(`No se pudo obtener usuario: ${error.message}`);
    }
  }

  async getUserByEmail(email) {
    try {
      const response = await this.httpClient.get(`${this.config.userServiceUrl}/api/users/email/${email}`);
      return response.data.data;
    } catch (error) {
      this.logger.error(`Error obteniendo usuario por email ${email}`, error.message);
      throw new Error(`No se pudo obtener usuario: ${error.message}`);
    }
  }

  async getOrderById(orderId) {
    try {
      const response = await this.httpClient.get(`${this.config.orderServiceUrl}/api/orders/${orderId}`);
      return response.data.data;
    } catch (error) {
      this.logger.error(`Error obteniendo orden ${orderId}`, error.message);
      throw new Error(`No se pudo obtener orden: ${error.message}`);
    }
  }

  async checkServiceHealth(serviceName) {
    try {
      const serviceUrl = this.config[`${serviceName}ServiceUrl`];
      if (!serviceUrl) {
        throw new Error(`Servicio ${serviceName} no configurado`);
      }

      const response = await this.httpClient.get(`${serviceUrl}/health`);
      
      return {
        service: serviceName,
        status: 'healthy',
        responseTime: response.headers['x-response-time'] || 'N/A',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        service: serviceName,
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async checkAllServicesHealth() {
    const services = ['user', 'product', 'cart', 'order'];
    const healthChecks = await Promise.allSettled(
      services.map(service => this.checkServiceHealth(service))
    );

    return healthChecks.map((result, index) => ({
      service: services[index],
      ...(result.status === 'fulfilled' ? result.value : { status: 'error', error: result.reason })
    }));
  }
}

module.exports = HttpMicroserviceClient;
