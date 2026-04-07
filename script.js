const defaultConfig = {
  brandName: 'Dofepro-Tech',
  brand: {
    logoSrc: 'assets/logo-dofepro-tech.svg',
    logoAlt: 'Logo de Dofepro-Tech',
    tagline: 'Innovacion Tecnologica Moderna'
  },
  responseTime: '24 horas',
  social: {
    email: 'domingofelizpro@gmail.com',
    secondaryEmail: 'elsonidistaadnj@gmail.com',
    linkedin: 'https://www.linkedin.com/in/domingo-feliz-743b43357',
    github: 'https://github.com/Dofepro-Tech'
  },
  ui: {
    defaultTheme: 'light'
  },
  contact: {
    formMode: 'demo',
    apiBaseUrl: '',
    endpointPath: '/api/contact',
    allowLocalFallback: true
  }
};

const appConfig = window.PORTFOLIO_CONFIG
  ? {
      ...defaultConfig,
      ...window.PORTFOLIO_CONFIG,
      brand: {
        ...defaultConfig.brand,
        ...window.PORTFOLIO_CONFIG.brand
      },
      social: {
        ...defaultConfig.social,
        ...window.PORTFOLIO_CONFIG.social
      },
      ui: {
        ...defaultConfig.ui,
        ...window.PORTFOLIO_CONFIG.ui
      },
      contact: {
        ...defaultConfig.contact,
        ...window.PORTFOLIO_CONFIG.contact
      }
    }
  : defaultConfig;

const form = document.querySelector('#contactForm');
const statusMessage = document.querySelector('#formStatus');
const messageField = document.querySelector('#mensaje');
const charCount = document.querySelector('#charCount');
const submitButton = document.querySelector('#submitButton');
const submitLabel = document.querySelector('[data-submit-label]');
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const currentYear = document.querySelector('#currentYear');
const themeToggle = document.querySelector('#themeToggle');
const themeToggleLabel = document.querySelector('.theme-toggle-label');
const scrollTopButton = document.querySelector('#scrollTopButton');
const scrollProgressBar = document.querySelector('#scrollProgressBar');
const assistantShell = document.querySelector('#assistantShell');
const assistantPanel = document.querySelector('#assistantPanel');
const assistantToggle = document.querySelector('#assistantToggle');
const assistantClose = document.querySelector('#assistantClose');
const assistantForm = document.querySelector('#assistantForm');
const assistantInput = document.querySelector('#assistantInput');
const assistantMessages = document.querySelector('#assistantMessages');
const assistantChips = Array.from(document.querySelectorAll('[data-assistant-prompt]'));
const brandLogo = document.querySelector('[data-brand-logo]');
const brandMark = document.querySelector('.brand-mark');
const brandTagline = document.querySelector('[data-brand-tagline]');
const revealElements = Array.from(document.querySelectorAll('[data-reveal]'));
const fields = form ? Array.from(form.querySelectorAll('input, select, textarea')) : [];
const draftStorageKey = 'portfolio-contact-draft';
const submissionStorageKey = 'portfolio-contact-last-submission';
const themeStorageKey = 'portfolio-theme';

const setTextContent = (selector, value) => {
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = value;
  });
};

const setLinkValue = (selector, value, prefix = '') => {
  document.querySelectorAll(selector).forEach((element) => {
    element.setAttribute('href', `${prefix}${value}`);
    if (!element.textContent.trim() || element.dataset.replaceText === 'true') {
      element.textContent = value;
    }
  });
};

const isAbsoluteUrl = (value) => /^https?:\/\//i.test(value);

const getApiBaseUrl = () => String(appConfig.contact.apiBaseUrl || '').trim();

const getEndpointPath = () => {
  const endpointPath = String(appConfig.contact.endpointPath || '/api/contact').trim();
  return endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;
};

const updateApiStatus = () => {
  const status = document.querySelector('[data-api-status]');
  if (!status) {
    return;
  }

  if (appConfig.contact.formMode !== 'api') {
    status.textContent = 'Correo directo disponible';
    return;
  }

  status.textContent = 'Formulario y correo activos';
};

const assistantReplies = [
  {
    test: /servicio|landing|sitio|web|automat/i,
    text: 'Dofepro-Tech trabaja landing pages, sitios informativos, automatización, rediseño visual y mejoras técnicas para proyectos ya publicados.',
    links: [
      { label: 'Ver servicios', href: '#servicios' },
      { label: 'Ver paquetes', href: '#paquetes' }
    ]
  },
  {
    test: /precio|costo|cotiza|paquete|plan/i,
    text: 'La mejor forma de cotizar es según objetivo, alcance y tiempos. Ya hay paquetes base visibles para que tengas una referencia rápida.',
    links: [
      { label: 'Ver paquetes', href: '#paquetes' },
      { label: 'Solicitar propuesta', href: '#contacto' }
    ]
  },
  {
    test: /tiempo|plazo|demora|cuando|cu[aá]nto/i,
    text: 'Los tiempos cambian según la complejidad, pero el sitio ya indica una respuesta inicial estimada dentro de 24 horas para organizar el siguiente paso.',
    links: [
      { label: 'Ir al contacto', href: '#contacto' },
      { label: 'Ver proceso', href: '#proceso' }
    ]
  },
  {
    test: /proyecto|portafolio|caso|github|repo/i,
    text: 'Ya hay proyectos públicos enlazados dentro del portafolio para revisar enfoque técnico, estructura y tipo de solución desarrollada.',
    links: [
      { label: 'Ver proyectos', href: '#proyectos' },
      { label: 'Ver casos', href: '#casos' }
    ]
  },
  {
    test: /seo|google|busqueda|buscar|index/i,
    text: 'Además de construir la parte visual, el sitio incorpora base SEO, recursos y contenidos pensados para ganar más visibilidad en búsquedas.',
    links: [
      { label: 'Ver recursos', href: '#recursos' },
      { label: 'Leer guía', href: 'guia-landing-negocio.html' }
    ]
  },
  {
    test: /contacto|correo|hablar|escribir/i,
    text: 'Puedes escribir directamente desde el formulario o usar el correo principal. Si explicas tu objetivo con contexto, la respuesta puede ser más concreta desde el primer mensaje.',
    links: [
      { label: 'Contactar ahora', href: '#contacto' }
    ]
  },
  {
    test: /ia|asistente|bot/i,
    text: 'Este asistente es la primera versión integrada en la landing: responde dudas frecuentes, guía a secciones clave y acelera el contacto inicial.',
    links: [
      { label: 'Ver servicios', href: '#servicios' },
      { label: 'Ir al contacto', href: '#contacto' }
    ]
  }
];

const appendAssistantMessage = (role, text, links = []) => {
  if (!assistantMessages) {
    return;
  }

  const article = document.createElement('article');
  article.className = `assistant-message ${role === 'user' ? 'assistant-message-user' : 'assistant-message-bot'}`;

  const paragraph = document.createElement('p');
  paragraph.textContent = text;
  article.appendChild(paragraph);

  if (links.length) {
    const actions = document.createElement('div');
    actions.className = 'assistant-message-links';

    links.forEach((link) => {
      const anchor = document.createElement('a');
      anchor.href = link.href;
      anchor.textContent = link.label;
      if (/^https?:\/\//i.test(link.href)) {
        anchor.target = '_blank';
        anchor.rel = 'noreferrer noopener';
      } else {
        anchor.addEventListener('click', () => {
          closeAssistant();
          closeNav();
        });
      }
      actions.appendChild(anchor);
    });

    article.appendChild(actions);
  }

  assistantMessages.appendChild(article);
  assistantMessages.scrollTop = assistantMessages.scrollHeight;
};

const getAssistantReply = (input) => {
  const normalizedInput = input.trim();
  if (!normalizedInput) {
    return {
      text: 'Puedes preguntarme por servicios, proyectos, tiempos, SEO o contacto.',
      links: [{ label: 'Ver servicios', href: '#servicios' }]
    };
  }

  const matchingReply = assistantReplies.find((entry) => entry.test.test(normalizedInput));
  if (matchingReply) {
    return matchingReply;
  }

  return {
    text: 'Puedo orientarte rápidamente sobre servicios, proyectos visibles, tiempos de trabajo, recursos y la mejor forma de iniciar una conversación.',
    links: [
      { label: 'Ver proyectos', href: '#proyectos' },
      { label: 'Ir al contacto', href: '#contacto' }
    ]
  };
};

const openAssistant = () => {
  if (!assistantShell || !assistantPanel || !assistantToggle) {
    return;
  }

  assistantShell.classList.add('is-open');
  assistantPanel.hidden = false;
  assistantToggle.setAttribute('aria-expanded', 'true');
  if (assistantInput) {
    assistantInput.focus();
  }
};

const closeAssistant = () => {
  if (!assistantShell || !assistantPanel || !assistantToggle) {
    return;
  }

  assistantShell.classList.remove('is-open');
  assistantToggle.setAttribute('aria-expanded', 'false');
  assistantPanel.hidden = true;
};

const toggleAssistant = () => {
  const isOpen = assistantShell?.classList.contains('is-open');
  if (isOpen) {
    closeAssistant();
  } else {
    openAssistant();
  }
};

const hydrateSiteConfig = () => {
  setTextContent('[data-brand-name]', appConfig.brandName);
  if (brandTagline) {
    brandTagline.textContent = appConfig.brand?.tagline || '';
  }
  setTextContent('[data-response-time]', appConfig.responseTime);
  setLinkValue('[data-contact-email-link]', appConfig.social.email, 'mailto:');
  setLinkValue('[data-secondary-email-link]', appConfig.social.secondaryEmail, 'mailto:');
  setLinkValue('[data-linkedin-link]', appConfig.social.linkedin);
  setLinkValue('[data-github-link]', appConfig.social.github);
  updateApiStatus();

  if (brandLogo && appConfig.brand?.logoSrc) {
    brandLogo.hidden = false;
    brandLogo.src = appConfig.brand.logoSrc;
    brandLogo.alt = appConfig.brand.logoAlt || `Logo de ${appConfig.brandName}`;
    if (brandMark) {
      brandMark.hidden = true;
    }

    brandLogo.addEventListener('error', () => {
      brandLogo.hidden = true;
      if (brandMark) {
        brandMark.hidden = false;
      }
    }, { once: true });
  } else if (brandMark) {
    brandMark.hidden = false;
  }

  if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
  }
};

const getPreferredTheme = () => {
  const storedTheme = localStorage.getItem(themeStorageKey);
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  if (appConfig.ui?.defaultTheme === 'light' || appConfig.ui?.defaultTheme === 'dark') {
    return appConfig.ui.defaultTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const updateThemeButton = (theme) => {
  if (!themeToggle || !themeToggleLabel) {
    return;
  }

  const isDark = theme === 'dark';
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggleLabel.textContent = isDark ? 'Sol' : 'Luna';
  themeToggle.setAttribute('aria-label', isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
};

const applyTheme = (theme) => {
  document.body.dataset.theme = theme;
  localStorage.setItem(themeStorageKey, theme);
  updateThemeButton(theme);

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.setAttribute('content', theme === 'dark' ? '#08101d' : '#3b82f6');
  }
};

const toggleTheme = () => {
  const currentTheme = document.body.dataset.theme === 'dark' ? 'dark' : 'light';
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
};

const toggleNav = () => {
  if (!navToggle || !siteNav) {
    return;
  }

  const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!isExpanded));
  siteNav.classList.toggle('is-open', !isExpanded);
  navToggle.classList.toggle('is-active', !isExpanded);
};

const closeNav = () => {
  if (!navToggle || !siteNav) {
    return;
  }

  navToggle.setAttribute('aria-expanded', 'false');
  siteNav.classList.remove('is-open');
  navToggle.classList.remove('is-active');
};

const shouldIgnoreNavClose = (target) => {
  if (!(target instanceof Node)) {
    return false;
  }

  return navToggle?.contains(target) || siteNav?.contains(target);
};

const updateScrollUi = () => {
  const scrollTop = window.scrollY;
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? Math.min((scrollTop / scrollableHeight) * 100, 100) : 0;

  if (scrollProgressBar) {
    scrollProgressBar.style.transform = `scaleX(${progress / 100})`;
  }

  if (scrollTopButton) {
    scrollTopButton.classList.toggle('is-visible', scrollTop > 420);
  }

  document.body.classList.toggle('is-scrolled', scrollTop > 24);
};

const revealObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.18
      }
    )
  : null;

const setupRevealAnimations = () => {
  if (!revealElements.length) {
    return;
  }

  if (!revealObserver) {
    revealElements.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  revealElements.forEach((element) => revealObserver.observe(element));
};

const updateCharacterCount = () => {
  if (!messageField || !charCount) {
    return;
  }

  charCount.textContent = String(messageField.value.length);
};

const setFieldState = (field) => {
  if (!(field instanceof HTMLElement)) {
    return;
  }

  field.setAttribute('aria-invalid', String(!field.checkValidity()));
};

const setStatus = (message, type) => {
  if (!statusMessage) {
    return;
  }

  statusMessage.textContent = message;
  statusMessage.className = 'form-status';
  if (type) {
    statusMessage.classList.add(type);
  }
};

const normalizePayload = (formData) => ({
  name: String(formData.get('nombre') || '').trim(),
  email: String(formData.get('correo') || '').trim(),
  company: String(formData.get('negocio') || '').trim(),
  service: String(formData.get('servicio') || '').trim(),
  message: String(formData.get('mensaje') || '').trim(),
  privacyAccepted: formData.get('privacidad') === 'on',
  website: String(formData.get('website') || '').trim(),
  source: 'portfolio-landing'
});

const saveDraft = () => {
  if (!form) {
    return;
  }

  const draft = Object.fromEntries(new FormData(form).entries());
  localStorage.setItem(draftStorageKey, JSON.stringify(draft));
};

const restoreDraft = () => {
  if (!form) {
    return;
  }

  const rawDraft = localStorage.getItem(draftStorageKey);
  if (!rawDraft) {
    return;
  }

  try {
    const draft = JSON.parse(rawDraft);
    Object.entries(draft).forEach(([key, value]) => {
      const field = form.elements.namedItem(key);
      if (!(field instanceof RadioNodeList) && field instanceof HTMLInputElement && field.type === 'checkbox') {
        field.checked = value === 'on' || value === true;
        return;
      }

      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
        field.value = String(value);
      }
    });
  } catch (error) {
    localStorage.removeItem(draftStorageKey);
  }
};

const setSubmittingState = (isSubmitting) => {
  if (submitButton) {
    submitButton.disabled = isSubmitting;
  }

  if (submitLabel) {
    submitLabel.textContent = isSubmitting ? 'Enviando...' : 'Enviar mensaje';
  }
};

const canUseApi = () => appConfig.contact.formMode === 'api' && Boolean(getEndpointPath());

const buildApiUrl = () => {
  const baseUrl = getApiBaseUrl().replace(/\/$/, '');
  const endpointPath = getEndpointPath();

  if (!baseUrl) {
    return endpointPath;
  }

  return `${baseUrl}${endpointPath}`;
};

const submitToApi = async (payload) => {
  const response = await fetch(buildApiUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'No fue posible procesar el formulario.');
  }

  return data;
};

const handleSuccessfulSubmission = (payload, message) => {
  localStorage.setItem(submissionStorageKey, JSON.stringify(payload));
  localStorage.removeItem(draftStorageKey);
  form.reset();
  updateCharacterCount();
  fields.forEach((field) => field.removeAttribute('aria-invalid'));
  setStatus(message, 'is-success');
};

hydrateSiteConfig();
applyTheme(getPreferredTheme());

if (navToggle && siteNav) {
  navToggle.addEventListener('click', toggleNav);
  siteNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNav));
  document.addEventListener('click', (event) => {
    if (!shouldIgnoreNavClose(event.target)) {
      closeNav();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeNav();
    }
  });
  window.addEventListener('resize', () => {
    closeNav();
  });
}

if (themeToggle) {
  themeToggle.addEventListener('click', toggleTheme);
}

if (assistantToggle && assistantPanel) {
  assistantToggle.addEventListener('click', toggleAssistant);
  assistantClose?.addEventListener('click', closeAssistant);

  assistantChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-assistant-prompt') || '';
      appendAssistantMessage('user', prompt);
      const reply = getAssistantReply(prompt);
      appendAssistantMessage('bot', reply.text, reply.links);
      openAssistant();
    });
  });

  assistantForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const prompt = String(assistantInput?.value || '').trim();
    if (!prompt) {
      return;
    }

    appendAssistantMessage('user', prompt);
    const reply = getAssistantReply(prompt);
    appendAssistantMessage('bot', reply.text, reply.links);
    assistantForm.reset();
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }

    if (assistantShell.classList.contains('is-open') && !assistantShell.contains(target)) {
      closeAssistant();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAssistant();
    }
  });
}

if (scrollTopButton) {
  scrollTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

window.addEventListener('scroll', updateScrollUi, { passive: true });
updateScrollUi();
setupRevealAnimations();

if (form) {
  restoreDraft();
  updateCharacterCount();

  fields.forEach((field) => {
    field.addEventListener('input', () => {
      setFieldState(field);
      saveDraft();
      if (field === messageField) {
        updateCharacterCount();
      }
    });

    field.addEventListener('blur', () => setFieldState(field));
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatus('', '');

    let firstInvalidField = null;
    fields.forEach((field) => {
      setFieldState(field);
      if (!field.checkValidity() && !firstInvalidField) {
        firstInvalidField = field;
      }
    });

    if (firstInvalidField) {
      setStatus('Revisa los campos marcados antes de enviar el formulario.', 'is-error');
      firstInvalidField.focus();
      form.reportValidity();
      return;
    }

    const payload = normalizePayload(new FormData(form));
    setSubmittingState(true);

    try {
      if (canUseApi()) {
        const result = await submitToApi(payload);
        handleSuccessfulSubmission(payload, result.message || 'Mensaje enviado correctamente. Recibiras respuesta pronto.');
      } else {
        handleSuccessfulSubmission(
          payload,
          `El formulario en linea se activara en una proxima actualizacion. Mientras tanto, escribeme directamente a ${appConfig.social.email}.`
        );
      }
    } catch (error) {
      if (appConfig.contact.allowLocalFallback) {
        localStorage.setItem(submissionStorageKey, JSON.stringify(payload));
        setStatus(
          `El envio en linea todavia no esta disponible. Usa el correo ${appConfig.social.email} para contactarme de inmediato.`,
          'is-error'
        );
      } else {
        setStatus(error.message, 'is-error');
      }
    } finally {
      setSubmittingState(false);
    }
  });
}
