class Email {
  constructor({
    to,
    subject,
    html,
    text,
    attachments = [],
    from = null,
    replyTo = null,
    cc = [],
    bcc = []
  }) {
    this.to = to;
    this.subject = subject;
    this.html = html;
    this.text = text;
    this.attachments = attachments;
    this.from = from;
    this.replyTo = replyTo;
    this.cc = cc;
    this.bcc = bcc;
    this.createdAt = new Date();
  }

  // Validaciones de dominio
  validate() {
    const errors = [];

    if (!this.to || !this.isValidEmail(this.to)) {
      errors.push('Email de destino inválido');
    }

    if (!this.subject || this.subject.trim().length === 0) {
      errors.push('El asunto es requerido');
    }

    if (!this.html && !this.text) {
      errors.push('El email debe tener contenido HTML o texto');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Método para obtener un resumen del email
  getSummary() {
    return {
      to: this.to,
      subject: this.subject,
      hasHtml: !!this.html,
      hasText: !!this.text,
      attachmentCount: this.attachments.length,
      createdAt: this.createdAt
    };
  }
}

module.exports = Email;
