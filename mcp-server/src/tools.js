const path = require('node:path');
const z = require('zod');
const { auditWebProject } = require('./audits/web');
const { getGitOverview } = require('./services/git');
const { searchProjectText } = require('./services/search');
const { buildProjectSummary } = require('./summary');
const { clamp, exists, readUtf8File, resolveWithinRoot, splitLines } = require('./utils');

const projectKeySchema = z.string().min(1).optional().describe('Clave del proyecto registrado. Si se omite, se usa el proyecto por defecto.');

const renderSection = (title, lines) => {
  const filteredLines = lines.filter(Boolean);

  if (filteredLines.length === 0) {
    return `${title}: sin datos.`;
  }

  return `${title}:\n- ${filteredLines.join('\n- ')}`;
};

const registerTools = (server, config) => {
  server.registerTool(
    'list_projects',
    {
      title: 'List Projects',
      description: 'Lista todos los proyectos registrados en el hub y muestra el proyecto por defecto.',
      annotations: {
        readOnlyHint: true,
        idempotentHint: true
      }
    },
    async () => {
      const projects = config.registry.list();
      return {
        content: [
          {
            type: 'text',
            text: [
              `Proyecto por defecto: ${config.registry.defaultProjectKey}`,
              '',
              ...projects.map((project) => `${project.key} | ${project.name} | ${project.type} | ${project.root}`)
            ].join('\n')
          }
        ]
      };
    }
  );

  server.registerTool(
    'project_summary',
    {
      title: 'Project Summary',
      description: 'Resume estructura, metadatos y archivos top-level de un proyecto registrado.',
      inputSchema: z.object({
        projectKey: projectKeySchema
      }),
      annotations: {
        readOnlyHint: true,
        idempotentHint: true
      }
    },
    async ({ projectKey }, ctx) => {
      const project = config.registry.get(projectKey);
      await ctx.mcpReq.log('info', `Generando resumen del proyecto ${project.key}.`);
      const summary = await buildProjectSummary(project);

      const lines = [
        `Proyecto: ${summary.name} (${summary.key})`,
        `Tipo: ${summary.type}`,
        `Raiz: ${summary.root}`,
        summary.entryFile ? `Entrada principal: ${summary.entryFile}` : 'Entrada principal: no definida',
        summary.tags.length ? `Tags: ${summary.tags.join(', ')}` : 'Tags: sin tags',
        '',
        renderSection('Top level', summary.topLevelEntries.map((entry) => `${entry.kind} ${entry.name}`)),
        '',
        summary.packageInfo
          ? renderSection('Package', [
              `name: ${summary.packageInfo.name || 'sin name'}`,
              `version: ${summary.packageInfo.version || 'sin version'}`,
              `scripts: ${Object.keys(summary.packageInfo.scripts).join(', ') || 'sin scripts'}`
            ])
          : 'Package: no existe package.json.',
        '',
        summary.readmePreview ? `README preview:\n${summary.readmePreview}` : 'README preview: no existe README.md.'
      ];

      return {
        content: [
          {
            type: 'text',
            text: lines.join('\n')
          }
        ]
      };
    }
  );

  server.registerTool(
    'read_project_file',
    {
      title: 'Read Project File',
      description: 'Lee un archivo del proyecto por tramos de lineas, sin salir de la raiz permitida.',
      inputSchema: z.object({
        projectKey: projectKeySchema,
        relativePath: z.string().min(1).describe('Ruta relativa al proyecto.'),
        startLine: z.number().int().min(1).optional().default(1),
        endLine: z.number().int().min(1).optional().default(120)
      }),
      annotations: {
        readOnlyHint: true,
        idempotentHint: true
      }
    },
    async ({ projectKey, relativePath, startLine, endLine }, ctx) => {
      const project = config.registry.get(projectKey);
      const absolutePath = resolveWithinRoot(project.root, relativePath);

      if (!(await exists(absolutePath))) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `No existe el archivo ${relativePath} en el proyecto ${project.key}.`
            }
          ]
        };
      }

      await ctx.mcpReq.log('info', `Leyendo ${relativePath} en ${project.key}.`);

      const content = await readUtf8File(absolutePath);
      const lines = splitLines(content);
      const safeStart = clamp(startLine, 1, lines.length || 1);
      const safeEnd = clamp(endLine, safeStart, Math.max(lines.length, safeStart));
      const excerpt = lines.slice(safeStart - 1, safeEnd).map((line, index) => `${safeStart + index}: ${line}`);

      return {
        content: [
          {
            type: 'text',
            text: [`Archivo: ${normalizeForDisplay(relativePath)}`, `Lineas: ${safeStart}-${safeEnd}`, '', ...excerpt].join('\n')
          }
        ]
      };
    }
  );

  server.registerTool(
    'search_project_text',
    {
      title: 'Search Project Text',
      description: 'Busca texto dentro de un proyecto, usando ripgrep cuando esta disponible.',
      inputSchema: z.object({
        projectKey: projectKeySchema,
        query: z.string().min(1).describe('Texto a buscar.'),
        glob: z.string().min(1).optional().describe('Filtro opcional tipo glob, por ejemplo **/*.html.'),
        maxResults: z.number().int().min(1).max(80).optional().default(20)
      }),
      annotations: {
        readOnlyHint: true,
        idempotentHint: true
      }
    },
    async ({ projectKey, query, glob, maxResults }, ctx) => {
      const project = config.registry.get(projectKey);
      await ctx.mcpReq.log('info', `Buscando "${query}" en ${project.key}.`);
      const outcome = await searchProjectText(project, { query, glob, maxResults });

      if (outcome.results.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No hubo resultados para "${query}" en ${project.key}. Motor usado: ${outcome.engine}.`
            }
          ]
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: [
              `Motor usado: ${outcome.engine}`,
              `Resultados: ${outcome.results.length}`,
              '',
              ...outcome.results.map((result) => `${result.file}:${result.line} | ${result.text}`)
            ].join('\n')
          }
        ]
      };
    }
  );

  server.registerTool(
    'git_overview',
    {
      title: 'Git Overview',
      description: 'Resume branch, cambios locales y commits recientes de un proyecto.',
      inputSchema: z.object({
        projectKey: projectKeySchema
      }),
      annotations: {
        readOnlyHint: true,
        idempotentHint: true
      }
    },
    async ({ projectKey }, ctx) => {
      const project = config.registry.get(projectKey);
      await ctx.mcpReq.log('info', `Leyendo estado Git de ${project.key}.`);
      const overview = await getGitOverview(project);

      if (!overview.isRepository) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: overview.reason
            }
          ]
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: [
              `Proyecto: ${project.name}`,
              `Branch: ${overview.branch}`,
              `Git root: ${overview.gitRoot}`,
              '',
              renderSection('Status', overview.statusLines.length ? overview.statusLines : ['working tree limpio']),
              '',
              renderSection('Commits recientes', overview.recentCommits)
            ].join('\n')
          }
        ]
      };
    }
  );

  server.registerTool(
    'audit_web_project',
    {
      title: 'Audit Web Project',
      description: 'Revisa SEO base, archivos legales y señales de publicacion de un proyecto web.',
      inputSchema: z.object({
        projectKey: projectKeySchema,
        entryFile: z.string().min(1).optional().describe('Archivo HTML de entrada si quieres sobrescribir el configurado.')
      }),
      annotations: {
        readOnlyHint: true,
        idempotentHint: true
      }
    },
    async ({ projectKey, entryFile }, ctx) => {
      const project = config.registry.get(projectKey);
      await ctx.mcpReq.log('info', `Auditando base web de ${project.key}.`);
      const audit = await auditWebProject(project, entryFile);

      return {
        content: [
          {
            type: 'text',
            text: [
              `Proyecto: ${project.name}`,
              `Entrada auditada: ${audit.entryFile}`,
              `Score: ${audit.score}/100`,
              `Fallas requeridas: ${audit.totals.requiredFailures}`,
              `Fallas recomendadas: ${audit.totals.recommendedFailures}`,
              '',
              ...audit.checks.map((check) => `${check.passed ? 'OK' : 'FALTA'} | ${check.level} | ${check.key} | ${check.message}`)
            ].join('\n')
          }
        ]
      };
    }
  );
};

const normalizeForDisplay = (relativePath) => relativePath.split(path.sep).join('/');

module.exports = {
  registerTools
};
