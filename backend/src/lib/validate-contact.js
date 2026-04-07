const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedServices = new Set(['landing', 'sitio-web', 'auditoria', 'automatizacion', 'asesoria', 'redisenio', 'mantenimiento']);

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const getBoolean = (value) => value === true || value === 'true' || value === 'on';

const validateContactPayload = (body) => {
  const payload = {
    name: normalizeText(body.name),
    email: normalizeText(body.email).toLowerCase(),
    company: normalizeText(body.company),
    service: normalizeText(body.service),
    message: normalizeText(body.message),
    privacyAccepted: getBoolean(body.privacyAccepted),
    website: normalizeText(body.website),
    source: normalizeText(body.source) || 'portfolio-landing'
  };

  if (payload.website) {
    return {
      ok: true,
      isSpam: true,
      data: payload,
      errors: []
    };
  }

  const errors = [];

  if (payload.name.length < 3 || payload.name.length > 80) {
    errors.push('El nombre debe tener entre 3 y 80 caracteres.');
  }

  if (!emailPattern.test(payload.email)) {
    errors.push('Debes ingresar un correo electronico valido.');
  }

  if (!allowedServices.has(payload.service)) {
    errors.push('Debes seleccionar un servicio valido.');
  }

  if (payload.message.length < 10 || payload.message.length > 1000) {
    errors.push('El mensaje debe tener entre 10 y 1000 caracteres.');
  }

  if (!payload.privacyAccepted) {
    errors.push('Debes aceptar el tratamiento de datos para continuar.');
  }

  return {
    ok: errors.length === 0,
    isSpam: false,
    data: payload,
    errors
  };
};

module.exports = {
  allowedServices,
  validateContactPayload
};
