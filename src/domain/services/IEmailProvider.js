class IEmailProvider {
  
  async sendEmail(email) {
    throw new Error('sendEmail method must be implemented');
  }

  async verifyConnection() {
    throw new Error('verifyConnection method must be implemented');
  }
}

module.exports = IEmailProvider;