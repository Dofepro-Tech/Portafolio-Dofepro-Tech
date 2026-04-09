const { buildServer } = require('../src/build-server');
const config = require('../src/config');

const server = buildServer();

console.log(`Servidor MCP construido: ${config.serverName} v${config.serverVersion}`);
console.log(`Proyecto por defecto: ${config.registry.defaultProjectKey}`);
console.log(`Proyectos registrados: ${config.registry.projects.length}`);

void server.close();
