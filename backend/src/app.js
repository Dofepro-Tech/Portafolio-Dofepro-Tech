const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const contactRouter = require('./routes/contact');
const { createRateLimit } = require('./lib/rate-limit');

const app = express();

const corsOptions = {
  origin(origin, callback) {
    if (config.allowedOrigins === '*') {
      callback(null, true);
      return;
    }

    if (!origin || config.allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origen no permitido por CORS.'));
  }
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'portfolio-contact-backend',
    mode: config.email.deliveryMode
  });
});

app.use('/api/contact', createRateLimit(config.rateLimit), contactRouter);

app.use((_req, res) => {
  res.status(404).json({
    ok: false,
    message: 'Ruta no encontrada.'
  });
});

app.use((error, _req, res, _next) => {
  console.error('Unhandled backend error:', error);
  res.status(500).json({
    ok: false,
    message: 'Ocurrio un error interno en la API.'
  });
});

module.exports = app;
