const fs = require('node:fs');
const path = require('node:path');

const normalizeProject = (projectDefinition, configDirectory) => {
  if (!projectDefinition || typeof projectDefinition !== 'object') {
    throw new Error('Cada proyecto debe ser un objeto valido.');
  }

  if (!projectDefinition.key || !projectDefinition.name || !projectDefinition.root) {
    throw new Error('Cada proyecto debe incluir key, name y root.');
  }

  const rootPath = path.resolve(configDirectory, projectDefinition.root);

  return {
    key: String(projectDefinition.key),
    name: String(projectDefinition.name),
    root: rootPath,
    type: projectDefinition.type || 'generic',
    entryFile: projectDefinition.entryFile || null,
    tags: Array.isArray(projectDefinition.tags) ? projectDefinition.tags.map(String) : [],
    metadata: projectDefinition.metadata && typeof projectDefinition.metadata === 'object' ? projectDefinition.metadata : {},
    gitRoot: projectDefinition.gitRoot ? path.resolve(configDirectory, projectDefinition.gitRoot) : rootPath
  };
};

const buildFallbackProject = (packageRoot) => ({
  key: 'current-project',
  name: 'Proyecto actual',
  root: path.resolve(packageRoot, '..'),
  type: 'generic',
  entryFile: null,
  tags: ['fallback'],
  metadata: {
    source: 'fallback'
  },
  gitRoot: path.resolve(packageRoot, '..')
});

const loadRegistry = ({ packageRoot, configFilePath }) => {
  let rawConfig = null;
  let configDirectory = packageRoot;

  if (configFilePath && fs.existsSync(configFilePath)) {
    rawConfig = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
    configDirectory = path.dirname(configFilePath);
  }

  const projects = rawConfig?.projects?.length
    ? rawConfig.projects.map((projectDefinition) => normalizeProject(projectDefinition, configDirectory))
    : [buildFallbackProject(packageRoot)];

  const defaultProjectKey = rawConfig?.defaultProjectKey && projects.some((project) => project.key === rawConfig.defaultProjectKey)
    ? rawConfig.defaultProjectKey
    : projects[0].key;

  return {
    configFilePath,
    defaultProjectKey,
    projects,
    get(projectKey) {
      const resolvedKey = projectKey || defaultProjectKey;
      const project = projects.find((candidate) => candidate.key === resolvedKey);

      if (!project) {
        throw new Error(`No existe un proyecto registrado con la clave ${resolvedKey}.`);
      }

      return project;
    },
    list() {
      return projects;
    },
    toJSON() {
      return {
        configFilePath,
        defaultProjectKey,
        projects
      };
    }
  };
};

module.exports = {
  loadRegistry
};
