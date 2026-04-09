const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const config = require('./config');
const { registerPrompts } = require('./prompts');
const { registerResources } = require('./resources');
const { registerTools } = require('./tools');

const buildServer = () => {
  const server = new McpServer(
    {
      name: config.serverName,
      version: config.serverVersion
    },
    {
      capabilities: {
        logging: {}
      },
      instructions: config.instructions
    }
  );

  registerTools(server, config);
  registerResources(server, config);
  registerPrompts(server, config);

  return server;
};

module.exports = {
  buildServer
};
