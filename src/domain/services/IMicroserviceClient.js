class IMicroserviceClient {
  
  async getUserById(userId) {
    throw new Error('getUserById method must be implemented');
  }

  async getOrderById(orderId) {
    throw new Error('getOrderById method must be implemented');
  }

  async checkServiceHealth(serviceName) {
    throw new Error('checkServiceHealth method must be implemented');
  }
}

module.exports = IMicroserviceClient;
