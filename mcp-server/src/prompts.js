const z = require('zod');

const registerPrompts = (server) => {
  server.registerPrompt(
    'project-audit-playbook',
    {
      title: 'Project Audit Playbook',
      description: 'Guia operativa para auditar un proyecto usando las herramientas del hub.',
      argsSchema: {
        projectKey: z.string().optional().describe('Clave del proyecto a auditar.'),
        goal: z.string().optional().describe('Objetivo puntual de la auditoria o exploracion.')
      }
    },
    ({ projectKey, goal }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: [
              'Audita este proyecto usando un flujo disciplinado.',
              projectKey ? `Proyecto objetivo: ${projectKey}.` : 'Usa el proyecto por defecto si no se especifica otro.',
              goal ? `Objetivo principal: ${goal}.` : 'Objetivo principal: detectar estructura, riesgos, faltantes y oportunidades concretas.',
              'Secuencia recomendada: list_projects -> project_summary -> search_project_text -> read_project_file -> git_overview.',
              'Si el proyecto es web, añade audit_web_project antes de emitir conclusiones.',
              'Entrega hallazgos accionables, no solo observaciones generales.'
            ].join(' ')
          }
        }
      ]
    })
  );
};

module.exports = {
  registerPrompts
};
