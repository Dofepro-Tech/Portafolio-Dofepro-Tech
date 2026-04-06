const express = require('express');
const { sendContactEmail } = require('../lib/email-service');
const { validateContactPayload } = require('../lib/validate-contact');

const router = express.Router();

router.post('/', async (req, res) => {
  const validation = validateContactPayload(req.body || {});

  if (validation.isSpam) {
    return res.status(202).json({
      ok: true,
      message: 'Solicitud recibida.'
    });
  }

  if (!validation.ok) {
    return res.status(400).json({
      ok: false,
      message: 'Hay errores en los datos enviados.',
      errors: validation.errors
    });
  }

  try {
    const delivery = await sendContactEmail(validation.data);
    return res.status(202).json({
      ok: true,
      message: 'Mensaje enviado correctamente. Te respondere lo antes posible.',
      deliveryMode: delivery.deliveryMode
    });
  } catch (error) {
    console.error('Error al enviar el contacto:', error);
    return res.status(502).json({
      ok: false,
      message: 'El backend esta listo, pero la entrega real aun no pudo completarse. Revisa las credenciales del proveedor de correo.'
    });
  }
});

module.exports = router;
