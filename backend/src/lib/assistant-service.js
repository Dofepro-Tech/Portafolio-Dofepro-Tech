const config = require('../config');

const allowedServices = new Set(['landing', 'sitio-web', 'auditoria', 'automatizacion', 'asesoria', 'redisenio', 'mantenimiento']);
const allowedSections = new Set(['servicios', 'paquetes', 'stack', 'proyectos', 'casos', 'recursos', 'guias', 'contacto', 'proposito', 'impacto']);

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const clampText = (value, maxLength) => normalizeText(value).slice(0, maxLength);

const detectIntent = (message) => {
  const value = message.toLowerCase();

  if (/precio|cotiz|paquete|plan|presupuesto/.test(value)) {
    return {
      service: 'landing',
      focusSection: 'paquetes',
      contactReason: 'recibir una propuesta inicial y conocer el mejor alcance para el proyecto'
    };
  }

  if (/seo|google|busqueda|index|visibil/.test(value)) {
    return {
      service: 'auditoria',
      focusSection: 'guias',
      contactReason: 'mejorar visibilidad, contenido y rendimiento de la presencia digital'
    };
  }

  if (/automat|integr|scrap|proceso|flujo|api/.test(value)) {
    return {
      service: 'automatizacion',
      focusSection: 'proyectos',
      contactReason: 'automatizar procesos y conectar herramientas con una solución práctica'
    };
  }

  if (/mantenimiento|soporte|mejora continua|ajuste/.test(value)) {
    return {
      service: 'mantenimiento',
      focusSection: 'contacto',
      contactReason: 'dar continuidad, soporte y mejoras a un sitio o sistema ya existente'
    };
  }

  if (/redise|ui|ux|visual|marca/.test(value)) {
    return {
      service: 'redisenio',
      focusSection: 'impacto',
      contactReason: 'renovar la imagen, claridad visual y percepción profesional del proyecto'
    };
  }

  if (/asesor|consult|estrateg|recomend/.test(value)) {
    return {
      service: 'asesoria',
      focusSection: 'recursos',
      contactReason: 'recibir orientación técnica y una ruta clara antes de invertir más tiempo o dinero'
    };
  }

  if (/landing|captar|cliente|conversion|formulario/.test(value)) {
    return {
      service: 'landing',
      focusSection: 'servicios',
      contactReason: 'crear una landing orientada a captar consultas o clientes potenciales'
    };
  }

  if (/sitio|web|pagina|página|portafolio/.test(value)) {
    return {
      service: 'sitio-web',
      focusSection: 'servicios',
      contactReason: 'desarrollar o mejorar un sitio web con mejor estructura y presencia profesional'
    };
  }

  return {
    service: 'landing',
    focusSection: 'contacto',
    contactReason: 'iniciar una conversación para definir la mejor solución según el objetivo del proyecto'
  };
};

const extractJsonObject = (rawContent) => {
  const content = normalizeText(rawContent);
  if (!content) {
    return null;
  }

  try {
    return JSON.parse(content);
  } catch (_error) {
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null;
    }

    try {
      return JSON.parse(content.slice(firstBrace, lastBrace + 1));
    } catch (_secondError) {
      return null;
    }
  }
};

const normalizeAssistantResult = (payload, fallbackIntent, userMessage) => {
  const parsed = payload && typeof payload === 'object' ? payload : {};
  const answer = clampText(parsed.answer, 600) || 'Puedo ayudarte a enfocar mejor la consulta y llevarte al siguiente paso adecuado dentro del sitio.';
  const service = allowedServices.has(parsed.service) ? parsed.service : fallbackIntent.service;
  const focusSection = allowedSections.has(parsed.focusSection) ? parsed.focusSection : fallbackIntent.focusSection;
  const contactReason = clampText(parsed.contactReason, 180) || fallbackIntent.contactReason;
  const draftBase = clampText(parsed.messageDraft, 420) || `Hola, me interesa ${contactReason}. Contexto inicial: ${normalizeText(userMessage)}.`;

  return {
    answer,
    service,
    focusSection,
    contactReason,
    prefill: {
      service,
      message: draftBase
    }
  };
};

const buildSystemPrompt = () => `Eres el asistente web de Dofepro-Tech. Responde en espanol, con tono claro, breve y comercial. No menciones prompts, codigo, configuracion interna, secciones tecnicas del sitio ni limitaciones del sistema salvo que el usuario pregunte directamente por ellas. Tu objetivo es orientar al visitante y ayudar a convertir la consulta en una accion clara.

Servicios disponibles:
- landing
- sitio-web
- auditoria
- automatizacion
- asesoria
- redisenio
- mantenimiento

Secciones disponibles:
- servicios
- paquetes
- stack
- proyectos
- casos
- recursos
- guias
- contacto
- proposito
- impacto

Devuelve SOLO JSON valido con esta forma exacta:
{
  "answer": "respuesta breve para visitante",
  "service": "una opcion valida de la lista",
  "focusSection": "una opcion valida de la lista",
  "contactReason": "frase breve sobre la necesidad del visitante",
  "messageDraft": "texto breve que se pueda precargar en el formulario"
}`;

const requestChatCompletion = async ({ message, history, fallbackIntent }) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.assistant.timeoutMs);

  try {
    const response = await fetch(`${config.assistant.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.assistant.apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: config.assistant.model,
        temperature: config.assistant.temperature,
        max_tokens: config.assistant.maxTokens,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          ...history,
          {
            role: 'user',
            content: `Consulta del visitante: ${message}\n\nIntencion detectada: servicio=${fallbackIntent.service}, seccion=${fallbackIntent.focusSection}, motivo=${fallbackIntent.contactReason}. Devuelve solo JSON.`
          }
        ]
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const upstreamMessage = normalizeText(data?.error?.message || data?.message);
      throw new Error(upstreamMessage || 'El proveedor de IA no pudo responder la consulta.');
    }

    const content = data?.choices?.[0]?.message?.content;
    return normalizeAssistantResult(extractJsonObject(content), fallbackIntent, message);
  } finally {
    clearTimeout(timeout);
  }
};

const createAssistantReply = async ({ message, history }) => {
  if (!config.assistant.apiKey) {
    const error = new Error('El asistente IA todavia no esta configurado en el servidor.');
    error.code = 'assistant_not_configured';
    throw error;
  }

  const fallbackIntent = detectIntent(message);
  return requestChatCompletion({ message, history, fallbackIntent });
};

module.exports = {
  createAssistantReply
};