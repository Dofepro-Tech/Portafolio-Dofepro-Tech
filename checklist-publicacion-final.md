# Checklist final de publicación

## Frontend
- Verificar que site-data.js tenga marca, correos y enlaces correctos.
- Confirmar que contact.formMode este en api para producción.
- Definir si apiBaseUrl quedara vacio por mismo dominio o con URL real externa.
- Revisar que el logo y favicon carguen correctamente.
- Validar que el menú, el tema y el botón de ir arriba funcionen.
- Confirmar que el formulario se vea bien en escritorio y móvil.
- Probar Open Graph con assets/og-cover.svg.

## Backend
- Copiar backend/.env.production.example a backend/.env del entorno real.
- Configurar ALLOWED_ORIGINS con el dominio final.
- Definir EMAIL_DELIVERY_MODE=resend.
- Completar CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL y RESEND_API_KEY.
- Desplegar el backend y probar GET /api/health.
- Probar POST /api/contact desde frontend publicado.

## Dominio y publicación
- Publicar frontend en hosting estático.
- Publicar backend en proveedor compatible.
- Si usas Netlify + Render, verificar que netlify.toml y render.yaml esten siendo tomados por la plataforma.
- Conectar dominio o subdominio si aplica.
- Validar HTTPS y CORS.

## Revisión final
- Probar formulario completo.
- Revisar enlaces a GitHub y LinkedIn.
- Verificar que los correos abran correctamente.
- Hacer revisión visual rápida en móvil y desktop.
- Compartir la landing con los textos de copys-redes.md.

## Checklist para futuras actualizaciones
- Actualizar backend primero si hubo cambios de API, CORS o correo.
- Actualizar frontend despues si cambiaste textos, proyectos, estilos o apiBaseUrl.
- Repetir prueba de /api/health y envío real.
