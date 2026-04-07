const allowedRoles = new Set(['user', 'assistant']);

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const validateAssistantPayload = (body) => {
  const message = normalizeText(body.message);
  const rawHistory = Array.isArray(body.history) ? body.history.slice(-6) : [];
  const history = rawHistory
    .map((entry) => ({
      role: normalizeText(entry?.role),
      content: normalizeText(entry?.content)
    }))
    .filter((entry) => allowedRoles.has(entry.role) && entry.content.length >= 1 && entry.content.length <= 500);

  const errors = [];

  if (message.length < 2 || message.length > 400) {
    errors.push('La consulta del asistente debe tener entre 2 y 400 caracteres.');
  }

  return {
    ok: errors.length === 0,
    errors,
    data: {
      message,
      history
    }
  };
};

module.exports = {
  validateAssistantPayload
};