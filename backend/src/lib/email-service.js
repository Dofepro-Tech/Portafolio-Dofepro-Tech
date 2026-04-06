const config = require('../config');

const buildHtmlMessage = (payload) => `
  <h1>Nuevo mensaje desde el portafolio</h1>
  <p><strong>Nombre:</strong> ${payload.name}</p>
  <p><strong>Correo:</strong> ${payload.email}</p>
  <p><strong>Empresa o marca:</strong> ${payload.company || 'No indicada'}</p>
  <p><strong>Servicio:</strong> ${payload.service}</p>
  <p><strong>Mensaje:</strong></p>
  <p>${payload.message.replace(/\n/g, '<br />')}</p>
  <p><strong>Origen:</strong> ${payload.source}</p>
`;

const sendWithResend = async (payload) => {
  if (!config.email.resendApiKey || !config.email.to || !config.email.from) {
    throw new Error('Faltan variables de entorno para usar Resend.');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.email.resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: config.email.from,
      to: [config.email.to],
      reply_to: payload.email,
      subject: `Nuevo contacto desde landing: ${payload.name}`,
      html: buildHtmlMessage(payload)
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend devolvio un error: ${errorText}`);
  }

  return {
    deliveryMode: 'resend'
  };
};

const sendContactEmail = async (payload) => {
  if (config.email.deliveryMode === 'log') {
    console.log('Nuevo contacto recibido:', payload);
    return {
      deliveryMode: 'log'
    };
  }

  if (config.email.deliveryMode === 'resend') {
    return sendWithResend(payload);
  }

  throw new Error('EMAIL_DELIVERY_MODE no es valido. Usa log o resend.');
};

module.exports = {
  sendContactEmail
};
