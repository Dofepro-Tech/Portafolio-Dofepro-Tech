const { ResourceTemplate } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { buildProjectSummary } = require('./summary');

const registerResources = (server, config) => {
  server.registerResource(
    'project-registry',
    'projects://registry',
    {
      title: 'Project Registry',
      description: 'Registro completo de proyectos configurados en el hub.',
      mimeType: 'application/json'
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(config.registry.toJSON(), null, 2)
        }
      ]
    })
  );

  server.registerResource(
    'project-summary',
    new ResourceTemplate('project://{projectKey}/summary', {
      list: async () => ({
        resources: config.registry.list().map((project) => ({
          uri: `project://${project.key}/summary`,
          name: project.name
        }))
      }),
      complete: {
        projectKey: async (value) => config.registry
          .list()
          .map((project) => project.key)
          .filter((projectKey) => projectKey.startsWith(value))
      }
    }),
    {
      title: 'Project Summary',
      description: 'Resumen JSON de un proyecto registrado.',
      mimeType: 'application/json'
    },
    async (uri, { projectKey }) => {
      const project = config.registry.get(projectKey);
      const summary = await buildProjectSummary(project);

      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(summary, null, 2)
          }
        ]
      };
    }
  );
};

module.exports = {
  registerResources
};
