# Backend de contacto

API Node.js + Express lista para conectar el formulario del portafolio a un envio real.

## Que resuelve

- Endpoint POST /api/contact para recibir formularios.
- Endpoint POST /api/assistant para responder consultas con IA.
- Validacion de datos en servidor.
- Honeypot antispam.
- Rate limit basico por IP.
- Modo log para pruebas locales.
- Modo resend para envio real cuando agregues credenciales.

## Configuracion

1. Copia .env.example a .env.
2. Define PORT y ALLOWED_ORIGINS.
3. Mientras no tengas credenciales, deja EMAIL_DELIVERY_MODE=log.
4. Cuando vayas a produccion, cambia a EMAIL_DELIVERY_MODE=resend y completa RESEND_API_KEY, CONTACT_TO_EMAIL y CONTACT_FROM_EMAIL.
5. Para Resend, usa un remitente bajo un dominio verificado por ti. No conviene usar Gmail como CONTACT_FROM_EMAIL en produccion.
6. Para el asistente IA, define AI_API_KEY y, si usas otro proveedor compatible, tambien AI_BASE_URL y AI_MODEL.

ALLOWED_ORIGINS acepta una lista separada por comas. Aunque la config de Render no incluya Live Server, el backend ya admite por defecto estos orígenes locales comunes:

- `http://127.0.0.1:5500`
- `http://localhost:5500`
- `http://127.0.0.1:3000`
- `http://localhost:3000`
- `http://127.0.0.1:4173`
- `http://localhost:4173`
- `http://127.0.0.1:5173`
- `http://localhost:5173`

## Comandos

- npm install
- npm run check
- npm run dev

## Integracion con el frontend

En site-data.js cambia:

- formMode a api
- apiBaseUrl a la URL donde publiques este backend, o dejalo vacio si el frontend y la API comparten dominio o proxy

Ejemplo:
{
  contact: {
    formMode: 'api',
    apiBaseUrl: '',
    endpointPath: '/api/contact'
  }
}

Si el backend queda en otro dominio, entonces usa la URL real de tu servicio publicado en Render o en el proveedor que elijas.

## Endpoints

- GET /api/health
- POST /api/contact
- POST /api/assistant

## Payload esperado

{
  "name": "Domingo Feliz",
  "email": "<domingofelizpro@gmail.com>",
  "company": "Dofepro-Tech",
  "service": "landing",
  "message": "Necesito una landing para captar clientes.",
  "privacyAccepted": true,
  "website": "",
  "source": "portfolio-landing"
}

## Payload del asistente

{
  "message": "Necesito una landing para captar clientes.",
  "history": [
    {
      "role": "user",
      "content": "Quiero mejorar mi sitio"
    }
  ]
}

## Variables IA compatibles

- AI_API_KEY
- AI_BASE_URL (opcional, por defecto OpenAI)
- AI_MODEL (opcional, por defecto gpt-4.1-mini)
- AI_MAX_TOKENS (opcional)
- AI_TEMPERATURE (opcional)
- AI_TIMEOUT_MS (opcional)
