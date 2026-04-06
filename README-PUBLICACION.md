# Guia rapida de publicacion

## Antes de publicar
- Verifica el contenido de la seccion de proyectos.
- Revisa enlaces de GitHub, LinkedIn y correos.
- Si activaras backend, usa site-data.production.example.js como base para tu site-data.js final.
- Decide si tu API vivira en el mismo dominio o en una URL separada.

## Publicacion del frontend
Puedes publicar esta landing en:
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting

## Publicacion del backend
La carpeta backend puede desplegarse en:
- Render
- Railway
- Fly.io
- Firebase Functions

## Archivos preparados para producción
- site-data.production.example.js: configuración del frontend en modo API.
- site-data.netlify-render.example.js: configuración lista para Netlify más Render.
- backend/.env.production.example: variables base para backend en producción.
- netlify.toml: publicación estática con headers y caché recomendados.
- render.yaml: blueprint del backend para Render.

## Flujo recomendado
1. Duplica site-data.production.example.js como site-data.js final de deploy.
2. Si tu backend tendra dominio propio, ajusta apiBaseUrl con la URL real. Si ira en el mismo dominio o por proxy, dejalo vacio.
3. Duplica backend/.env.production.example como backend/.env en tu entorno de despliegue.
4. Completa RESEND_API_KEY y el dominio real del remitente.
5. Publica frontend y backend.
6. Prueba /api/health y luego el formulario completo.

## Dos formas validas de conectar la API
- Mismo dominio o proxy: deja apiBaseUrl vacio y usa /api/contact.
- Backend separado: usa una URL completa como https://api.tudominio.com.

## Despliegue concreto en Netlify + Render
1. Sube este proyecto a GitHub.
2. En Netlify, crea un sitio nuevo desde el repositorio y deja el directorio de publicación en la raíz del proyecto.
3. Netlify detectará netlify.toml y publicará la landing estática con headers listos.
4. En Render, crea un Blueprint o Web Service desde el mismo repositorio usando render.yaml.
5. En Render completa ALLOWED_ORIGINS con tu dominio de Netlify o tu dominio final.
6. En Render completa CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL y RESEND_API_KEY.
7. Copia site-data.netlify-render.example.js sobre site-data.js y reemplaza la URL de apiBaseUrl por la URL real de Render.
8. Vuelve a publicar Netlify o haz un nuevo deploy para que el frontend apunte a la API real.
9. Prueba primero https://tu-backend.onrender.com/api/health y luego el formulario desde el frontend publicado.

## Subir el proyecto a GitHub
Desde la raiz del proyecto puedes usar este flujo:

```powershell
git init
git add .
git commit -m "feat: initial portfolio release"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

Si ya tienes el repositorio creado en GitHub, solo reemplaza la URL remota y ejecuta el push.

## Actualizaciones futuras
Si. Más adelante puedes lanzar una actualización sin rehacer la base.

Flujo recomendado:
1. Actualiza archivos del frontend o backend en el repositorio.
2. Si cambias el dominio del frontend, ajusta ALLOWED_ORIGINS en Render.
3. Si cambias la URL del backend, actualiza site-data.js y vuelve a desplegar Netlify.
4. Publica primero el backend cuando haya cambios de API y luego el frontend.
5. Repite la prueba de /api/health y un envío real del formulario.

## Recomendaciones sociales
- Usa la imagen assets/og-cover.svg como base para compartir en redes.
- Mantén el nombre Dofepro-Tech y el lema consistentes en bio, web y portada.
- Comparte el enlace con una descripcion corta orientada a servicios y resultados.
