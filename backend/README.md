# Backend de contacto

API Node.js + Express lista para conectar el formulario del portafolio a un envio real.

## Que resuelve
- Endpoint POST /api/contact para recibir formularios.
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

## Payload esperado
{
  "name": "Domingo Feliz",
  "email": "elsonidistaadnj@gmail.com",
  "email": "domingofelizpro@gmail.com",
  "company": "Dofepro-Tech",
  "service": "landing",
  "message": "Necesito una landing para captar clientes.",
  "privacyAccepted": true,
  "website": "",
  "source": "portfolio-landing"
}
