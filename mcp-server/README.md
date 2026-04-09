# Dofepro MCP Hub

Servidor MCP modular pensado para usarlo en varios proyectos, no solo en este portafolio.

## Que resuelve

- Un solo servidor MCP para varios repositorios o carpetas de trabajo.
- Herramientas reales para leer archivos, buscar texto, revisar Git y auditar proyectos web.
- Registro de proyectos configurable por archivo JSON.
- Recursos y prompts reutilizables para que el asistente tenga contexto estable.
- Base extensible para sumar herramientas de CRM, despliegue, formularios, scraping o analitica.

## Lo que incluye

- `list_projects`: lista proyectos registrados y su tipo.
- `project_summary`: resume estructura, package.json, README y archivos top-level.
- `read_project_file`: lee fragmentos de archivo con control de lineas.
- `search_project_text`: busca texto en archivos usando ripgrep si existe y fallback interno si no.
- `git_overview`: muestra branch, cambios locales y commits recientes.
- `audit_web_project`: revisa SEO/legal/base tecnica de proyectos web.
- Recurso `projects://registry` con el registro completo.
- Recurso `project://{projectKey}/summary` con resumen JSON por proyecto.
- Prompt `project-audit-playbook` para guiar auditorias o exploraciones complejas.

## Arquitectura

El servidor no depende del backend del portafolio. Vive en su propia carpeta y puede copiarse o moverse a otro repositorio. La logica importante queda separada en:

- `src/config.js`: carga configuracion y registro de proyectos.
- `src/project-registry.js`: normaliza y resuelve proyectos.
- `src/tools.js`: registra herramientas MCP.
- `src/resources.js`: registra recursos MCP.
- `src/prompts.js`: registra prompts MCP.
- `src/audits/web.js`: auditoria web reutilizable.
- `src/services/*.js`: servicios de Git y busqueda.

## Configuracion multi proyecto

Por defecto el servidor lee uno de estos archivos, en este orden:

1. `MCP_PROJECTS_FILE`
2. `projects.local.json`
3. `projects.example.json`

Duplica `projects.example.json` como `projects.local.json` y agrega tantos proyectos como quieras.

Ejemplo:

```json
{
  "defaultProjectKey": "portfolio",
  "projects": [
    {
      "key": "portfolio",
      "name": "Dofepro Portfolio",
      "root": "C:/Users/Dofepro-Tech/laboratorio-2-landing-portafolio",
      "type": "web-static",
      "entryFile": "index.html",
      "tags": ["landing", "seo"]
    },
    {
      "key": "scraper-demo",
      "name": "Scraper Catalogo Demo",
      "root": "P:/Proyectos 2026/Proyectos terminados/Scraper",
      "type": "web-static",
      "entryFile": "index.html",
      "tags": ["python", "scraping", "catalogo"]
    }
  ]
}
```

Tipos soportados ahora mismo:

- `web-static`
- `node-api`
- `generic`

## Uso local

```bash
cd mcp-server
npm install
npm run check
npm start
```

`npm start` levanta el servidor MCP sobre `stdio`, que es lo normal para integrarlo con editores y clientes locales.

## Ya se puede usar

Si. Este hub ya se puede usar ahora mismo porque:

- las dependencias ya fueron instaladas con `npm install`
- el paquete pasa `npm run check`
- el servidor se construye correctamente con dos proyectos registrados: `portfolio` y `scraper-demo`

Lo unico que falta para usarlo en tu editor o cliente MCP es apuntar ese cliente a `src/index.js` con Node.

## Integracion con clientes MCP

Ejemplo generico de configuracion:

```json
{
  "servers": {
    "dofepro-hub": {
      "command": "node",
      "args": [
        "C:/ruta/a/tu/mcp-server/src/index.js"
      ],
      "env": {
        "MCP_PROJECTS_FILE": "C:/ruta/a/tu/mcp-server/projects.local.json"
      }
    }
  }
}
```

## Como crecerlo sin rehacerlo

Este servidor ya esta preparado para que luego agregues modulos como:

- lectura de leads o formularios
- auditoria de despliegues
- chequeo de Search Console o sitemap
- CRM liviano
- scraping operativo
- generacion de propuestas y respuestas comerciales

La idea correcta es que este sea tu hub operativo MCP, no un servidor desechable por proyecto.
