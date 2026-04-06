# Dofepro-Tech Landing Portfolio

Landing profesional de Dofepro-Tech diseñada para presentar servicios, proyectos reales y un canal de contacto preparado para evolucionar de demo local a integración con backend en producción.

## Objetivo
Este proyecto funciona como sitio de presentación de marca y portafolio digital. Su propósito es comunicar una identidad tecnológica sólida, mostrar proyectos reales desarrollados por Dofepro-Tech y facilitar el primer contacto con potenciales clientes, colaboradores o reclutadores.

## Características principales
- HTML5 semántico con enfoque accesible.
- Diseño responsive con tema claro y oscuro.
- Menú plegable tipo hamburguesa.
- Barra de progreso de scroll y botón de volver arriba.
- Secciones de servicios, stack, proceso, logros, proyectos y contacto.
- Animaciones de entrada sutiles al hacer scroll.
- Proyectos reales integrados desde la carpeta de trabajo del autor.
- Formulario con validación nativa y lógica progresiva en JavaScript.
- Soporte para modo demo local o conexión con backend real.
- Metadatos Open Graph y Twitter para compartir en redes sociales.

## Tecnologías
- HTML5
- CSS3
- JavaScript vanilla
- Node.js + Express para el backend opcional de contacto

## Estructura del proyecto
- index.html: estructura principal del sitio.
- styles.css: sistema visual, layout, responsive y animaciones.
- script.js: interacciones UI, tema, menú, scroll y formulario.
- site-data.js: configuración rápida de marca, correos, enlaces y modo de contacto.
- assets/: logos, favicon y recursos gráficos para la marca.
- backend/: API de contacto preparada para producción.
- guia-despliegue.md: notas de activación del backend.
- README-PUBLICACION.md: guía breve para publicación y difusión.

## Proyectos destacados incluidos
- Palabra Viva - juego móvil/web con Expo + React Native.
- Calculadora Financiera PRO - software de escritorio en Python.
- Sistema de scraping y catálogo automático - automatización de datos con Python.
- Dofepro-Tech Ecosistema Cloud - experiencia web con Firebase y UI avanzada.
- Encriptador de Texto - herramienta web frontend.
- PyCaesar CLI - utilidad de cifrado interactiva en Python.

## Uso local
Abre index.html en tu navegador para ver el frontend.

Si deseas usar el backend local de contacto:
1. Entra a la carpeta backend.
2. Ejecuta npm install.
3. Copia .env.example a .env.
4. Usa EMAIL_DELIVERY_MODE=log para desarrollo.
5. Ejecuta npm run dev.

## Publicación
El frontend puede publicarse en hosting estático como GitHub Pages, Netlify, Vercel o Firebase Hosting.

El backend puede desplegarse en Render, Railway, Fly.io o Firebase Functions.

Si publicas frontend y backend bajo el mismo dominio o detrás de proxy, puedes dejar apiBaseUrl vacío y usar directamente /api/contact.

Consulta README-PUBLICACION.md para una guía rápida y copys-redes.md para compartir la landing en redes sociales.

## Licencia
Este proyecto se publica bajo un esquema propietario con todos los derechos reservados. Revisa el archivo LICENSE para detalles de uso y contacto.

## Contacto
- Correo principal: domingofelizpro@gmail.com
- Correo alternativo: elsonidistaadnj@gmail.com
- LinkedIn: https://www.linkedin.com/in/domingo-feliz-743b43357
- GitHub: https://github.com/Dofepro-Tech
