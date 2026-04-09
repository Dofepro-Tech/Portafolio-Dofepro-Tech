# Snippet SEO / Open Graph

Usa este bloque en la sección `head` cuando publiques una landing, una página comercial o una demo que quieras compartir bien por WhatsApp, LinkedIn, X o Facebook.

```html
<title>{{MARCA}} | {{TITULO_COMERCIAL}}</title>
<meta name="description" content="{{DESCRIPCION_CORTA_Y_CLARA}}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<link rel="canonical" href="{{URL_CANONICA}}" />

<meta property="og:title" content="{{MARCA}} | {{TITULO_COMERCIAL}}" />
<meta property="og:description" content="{{DESCRIPCION_PARA_COMPARTIR}}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="{{URL_CANONICA}}" />
<meta property="og:site_name" content="{{MARCA}}" />
<meta property="og:locale" content="es_ES" />
<meta property="og:image" content="{{URL_ABSOLUTA_DE_IMAGEN_1200x630}}" />
<meta property="og:image:secure_url" content="{{URL_ABSOLUTA_DE_IMAGEN_1200x630}}" />
<meta property="og:image:alt" content="{{ALT_DESCRIPTIVO_DE_LA_PORTADA}}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{{MARCA}} | {{TITULO_COMERCIAL}}" />
<meta name="twitter:description" content="{{DESCRIPCION_PARA_COMPARTIR}}" />
<meta name="twitter:url" content="{{URL_CANONICA}}" />
<meta name="twitter:image" content="{{URL_ABSOLUTA_DE_IMAGEN_1200x630}}" />
<meta name="twitter:image:alt" content="{{ALT_DESCRIPTIVO_DE_LA_PORTADA}}" />
```

## Reglas practicas

- Usa URLs absolutas para `og:image`, `og:url` y `canonical`.
- La imagen ideal es 1200x630 y ligera.
- El título no debe sonar genérico; debe decir qué resuelve la página.
- La descripción debe prometer resultado o utilidad, no solo listar tecnologías.
- Si es una página legal o técnica, simplifica el copy y evita títulos comerciales exagerados.
