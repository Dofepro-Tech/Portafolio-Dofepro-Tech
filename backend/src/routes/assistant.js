const express = require('express');
const { validateAssistantPayload } = require('../lib/validate-assistant');
const { createAssistantReply } = require('../lib/assistant-service');

const router = express.Router();

router.post('/', async (req, res) => {
  const validation = validateAssistantPayload(req.body || {});

  if (!validation.ok) {
    return res.status(400).json({
      ok: false,
      message: 'La consulta del asistente no es valida.',
      errors: validation.errors
    });
  }

  try {
    const reply = await createAssistantReply(validation.data);
    return res.status(200).json({
      ok: true,
      ...reply
    });
  } catch (error) {
    console.error('Error del asistente IA:', error);
    const statusCode = error.code === 'assistant_not_configured' ? 503 : 502;
    return res.status(statusCode).json({
      ok: false,
      message: error.message || 'No fue posible responder con el asistente IA.'
    });
  }
});

module.exports = router;