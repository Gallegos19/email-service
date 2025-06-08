const EmailTemplate = require('../../domain/models/EmailTemplate');

class SendTemplatedEmailUseCase {
  constructor(sendEmailUseCase, templateRenderer, logger) {
    this.sendEmailUseCase = sendEmailUseCase;
    this.templateRenderer = templateRenderer;
    this.logger = logger;
  }

  async execute(templateType, templateData, recipientEmail) {
    try {
      // 1. Crear template
      const template = new EmailTemplate(templateType, templateData);

      // 2. Validar template
      const validation = template.validate();
      if (!validation.isValid) {
        throw new Error(`Template inválido: ${validation.errors.join(', ')}`);
      }

      // 3. Renderizar template
      const renderedTemplate = this.templateRenderer.render(template);

      // 4. Preparar email
      const emailData = {
        to: recipientEmail,
        subject: renderedTemplate.subject,
        html: renderedTemplate.html,
        text: renderedTemplate.text
      };

      // 5. Enviar usando caso de uso base
      return await this.sendEmailUseCase.execute(emailData);

    } catch (error) {
      this.logger.error('Error enviando email templated', {
        templateType,
        recipientEmail,
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = SendTemplatedEmailUseCase;