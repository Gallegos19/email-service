class IEmailRepository {
  
  async saveEmailLog(emailData) {
    throw new Error('saveEmailLog method must be implemented');
  }

  async getEmailHistory(filters) {
    throw new Error('getEmailHistory method must be implemented');
  }

  async getEmailStats() {
    throw new Error('getEmailStats method must be implemented');
  }
}

module.exports = IEmailRepository;
