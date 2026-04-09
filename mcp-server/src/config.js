const path = require('node:path');
const packageJson = require('../package.json');
const { loadRegistry } = require('./project-registry');

const packageRoot = path.resolve(__dirname, '..');

const resolveConfigFilePath = () => {
  const candidates = [
    process.env.MCP_PROJECTS_FILE,
    path.join(packageRoot, 'projects.local.json'),
    path.join(packageRoot, 'projects.example.json')
  ].filter(Boolean);

  return candidates.find((candidatePath) => require('node:fs').existsSync(candidatePath)) || candidates[0];
};

const configFilePath = resolveConfigFilePath();

const registry = loadRegistry({
  packageRoot,
  configFilePath
});

module.exports = {
  packageRoot,
  configFilePath,
  registry,
  serverName: 'dofepro-mcp-hub',
  serverVersion: packageJson.version,
  instructions: [
    'Trabaja por proyecto usando la clave projectKey cuando exista mas de uno.',
    'Para auditorias web, llama primero a list_projects y luego a audit_web_project.',
    'Para explorar codigo, combina project_summary, search_project_text y read_project_file.',
    'Git overview solo resume estado y commits; no modifica el repositorio.',
    'Este servidor es de lectura y analisis. No debe usarse para acciones destructivas.'
  ].join(' ')
};
