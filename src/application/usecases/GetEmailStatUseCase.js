class GetEmailStatsUseCase {
  constructor(emailRepository, microserviceClient, logger) {
    this.emailRepository = emailRepository;
    this.microserviceClient = microserviceClient;
    this.logger = logger;
  }

  async execute() {
    try {
      // Obtener estadísticas de emails
      const emailStats = await this.emailRepository.getEmailStats();

      // Verificar salud de microservicios
      const servicesHealth = await this.microserviceClient.checkAllServicesHealth();

      return {
        emailStats,
        servicesHealth,
        serviceStatus: 'healthy',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error('Error obteniendo estadísticas', error);
      throw error;
    }
  }
}

module.exports = GetEmailStatsUseCase;
