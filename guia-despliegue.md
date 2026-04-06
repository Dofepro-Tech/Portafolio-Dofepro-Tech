# Guia de despliegue y activacion del backend

## Estado actual
- El frontend funciona de inmediato en modo demo.
- El backend esta preparado pero no depende de credenciales para desarrollo, porque puede correr en modo log.
- Cuando tengas hosting o credito, solo faltara desplegar la API y cambiar la configuracion del frontend.
- El proyecto ya incluye netlify.toml y render.yaml para una ruta directa de despliegue.

## Flujo recomendado
1. Publica el frontend en un hosting estatico.
2. Despliega la carpeta backend en Render, Railway, Fly.io o similar.
3. Configura las variables de entorno del backend.
4. Deja en site-data.js el formulario en api.
5. Revisa CORS y prueba el endpoint /api/health.
6. Ejecuta una prueba real desde el formulario.

## Variables a completar en el backend
- PORT
- ALLOWED_ORIGINS
- EMAIL_DELIVERY_MODE
- CONTACT_TO_EMAIL
- CONTACT_FROM_EMAIL
- RESEND_API_KEY

## Configuracion del frontend cuando llegue el momento
Ejemplo de configuracion final en site-data.js:

window.PORTFOLIO_CONFIG = {
  brandName: 'Tu Nombre / Tu Marca',
  responseTime: '24 horas',
  social: {
    email: 'tucorreo@ejemplo.com',
    linkedin: 'https://www.linkedin.com/in/tu-perfil',
    github: 'https://github.com/tu-usuario'
  },
  contact: {
    formMode: 'api',
    apiBaseUrl: '',
    endpointPath: '/api/contact',
    allowLocalFallback: false
  }
};

Si publicas el backend en otro dominio, entonces cambia apiBaseUrl por una URL completa, por ejemplo https://tu-backend.onrender.com.

## Recomendaciones antes de publicar
- Reemplazar los textos de ejemplo por tus datos reales.
- Actualizar sitemap.xml con tu dominio final.
- Ajustar enlaces sociales y correo.
- Ejecutar una auditoria Lighthouse con la web publicada.
- Validar que el proveedor de correo acepte el dominio remitente.

## Actualizar despues del lanzamiento
Si mas adelante publicas una nueva version, el flujo recomendado es:
1. Aplicar cambios en el proyecto.
2. Desplegar primero el backend si hubo cambios en la API o CORS.
3. Desplegar despues el frontend en Netlify.
4. Verificar /api/health, formulario, enlaces y vista movil.
