# Checklist de calidad del laboratorio

## Accesibilidad basica
- Documento con idioma definido en espanol.
- Enlace de salto al contenido principal.
- Estructura HTML5 semantica: header, nav, main, section, aside y footer.
- Jerarquia de encabezados con un solo h1 principal.
- Enlaces y botones con texto claro.
- Imagen del hero con texto alternativo descriptivo.
- Formulario con labels asociados y ayudas descriptivas mediante aria-describedby.
- Estados de foco visibles en enlaces, botones y campos.
- Menu movil operable con boton accesible.

## SEO on-page
- Title descriptivo.
- Meta description.
- Meta keywords basica.
- Metadatos Open Graph iniciales.
- Datos estructurados tipo ProfessionalService.
- robots.txt, sitemap.xml y site.webmanifest base.
- Contenido organizado por secciones semanticas.
- CTA claro y visible desde la parte superior.

## Responsive
- Adaptacion a escritorio con secciones de 2 y 3 columnas.
- Adaptacion a movil en una sola columna.
- Boton principal y formulario ajustados a pantallas pequenas.
- Navegacion colapsable en pantallas pequenas.

## Formulario funcional
- Validacion nativa del navegador.
- Mejora con JavaScript: contador de caracteres, marcado de campos invalidos, borrador local y mensaje final.
- Modo demo local con persistencia en localStorage.
- Integracion preparada para API externa configurable.

## Backend preparado
- Endpoint GET /api/health.
- Endpoint POST /api/contact.
- Validacion de datos en servidor.
- Honeypot antispam.
- Rate limit basico.
- Modo log para pruebas y modo resend para produccion.

## Pendiente para publicacion final
- Reemplazar dominio placeholder del sitemap.xml por el real.
- Publicar frontend y backend.
- Configurar variables de entorno y proveedor de correo.
- Ejecutar auditoria Lighthouse o PageSpeed ya publicado para documentar puntajes reales de accesibilidad, SEO y rendimiento.
