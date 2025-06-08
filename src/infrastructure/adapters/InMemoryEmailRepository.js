const IEmailRepository = require('../../domain/repositories/IEmailRepository');

class InMemoryEmailRepository extends IEmailRepository {
  constructor(logger) {
    super();
    this.logger = logger;
    this.emailLogs = [];
  }

  async saveEmailLog(emailData) {
    try {
      const log = {
        id: this.generateId(),
        ...emailData,
        timestamp: new Date()
      };

      this.emailLogs.push(log);
      
      this.logger.info('Email log guardado', { id: log.id, to: emailData.to });
      
      return log;
    } catch (error) {
      this.logger.error('Error guardando email log', error);
      throw error;
    }
  }

  async getEmailHistory(filters = {}) {
    try {
      let filteredLogs = [...this.emailLogs];

      // Filtrar por estado
      if (filters.status) {
        filteredLogs = filteredLogs.filter(log => log.status === filters.status);
      }

      // Filtrar por fecha
      if (filters.from) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= new Date(filters.from));
      }

      if (filters.to) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= new Date(filters.to));
      }

      // Ordenar por fecha descendente
      filteredLogs.sort((a, b) => b.timestamp - a.timestamp);

      // Paginación
      const page = filters.page || 1;
      const limit = filters.limit || 50;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      return {
        logs: filteredLogs.slice(startIndex, endIndex),
        total: filteredLogs.length,
        page,
        limit
      };

    } catch (error) {
      this.logger.error('Error obteniendo historial de emails', error);
      throw error;
    }
  }

  async getEmailStats() {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const sentEmails = this.emailLogs.filter(log => log.status === 'sent');
      const failedEmails = this.emailLogs.filter(log => log.status === 'failed');

      return {
        emailsSent: {
          today: sentEmails.filter(log => log.timestamp >= today).length,
          thisWeek: sentEmails.filter(log => log.timestamp >= thisWeek).length,
          thisMonth: sentEmails.filter(log => log.timestamp >= thisMonth).length,
          total: sentEmails.length
        },
        emailsFailed: {
          today: failedEmails.filter(log => log.timestamp >= today).length,
          thisWeek: failedEmails.filter(log => log.timestamp >= thisWeek).length,
          thisMonth: failedEmails.filter(log => log.timestamp >= thisMonth).length,
          total: failedEmails.length
        },
        successRate: sentEmails.length > 0 ? 
          ((sentEmails.length / this.emailLogs.length) * 100).toFixed(2) : 0,
        totalEmails: this.emailLogs.length
      };

    } catch (error) {
      this.logger.error('Error obteniendo estadísticas', error);
      throw error;
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

module.exports = InMemoryEmailRepository;