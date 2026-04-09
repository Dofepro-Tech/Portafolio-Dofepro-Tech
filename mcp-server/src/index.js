const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { buildServer } = require('./build-server');
const config = require('./config');

const main = async () => {
  const server = buildServer();
  const transport = new StdioServerTransport();

  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await server.close();
    process.exit(0);
  });

  await server.connect(transport);
  console.error(`[${config.serverName}] listo. Proyecto por defecto: ${config.registry.defaultProjectKey}`);
};

main().catch((error) => {
  console.error('No se pudo iniciar el servidor MCP:', error);
  process.exit(1);
});
