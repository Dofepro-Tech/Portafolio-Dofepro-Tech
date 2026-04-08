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
  },
  assistant: {
    enabled: false,
    apiBaseUrl: '',
    endpointPath: '/api/assistant'
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
      },
      assistant: {
        ...defaultConfig.assistant,
        ...window.PORTFOLIO_CONFIG.assistant
      }
    }
  : defaultConfig;

const form = document.querySelector('#contactForm');
const statusMessage = document.querySelector('#formStatus');
const messageField = document.querySelector('#mensaje');
const charCount = document.querySelector('#charCount');
const submitButton = document.querySelector('#submitButton');
const submitLabel = document.querySelector('[data-submit-label]');
const serviceField = document.querySelector('#servicio');
const prefillNote = document.querySelector('#assistantPrefillNote');
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
const assistantSendButton = assistantForm ? assistantForm.querySelector('button[type="submit"]') : null;
const pageSearchForm = document.querySelector('#pageSearchForm');
const pageSearchInput = document.querySelector('#pageSearchInput');
const pageSearchResults = document.querySelector('#pageSearchResults');
const pageSearchStatus = document.querySelector('#pageSearchStatus');
const contactShortcutLinks = Array.from(document.querySelectorAll('[data-contact-service]'));
const brandLogo = document.querySelector('[data-brand-logo]');
const brandMark = document.querySelector('.brand-mark');
const brandTagline = document.querySelector('[data-brand-tagline]');
const revealElements = Array.from(document.querySelectorAll('[data-reveal]'));
const fields = form ? Array.from(form.querySelectorAll('input, select, textarea')) : [];
const draftStorageKey = 'portfolio-contact-draft';
const submissionStorageKey = 'portfolio-contact-last-submission';
const themeStorageKey = 'portfolio-theme';
const assistantConversation = [];
const contactPrefillQueryKeys = {
  service: 'contactService',
  message: 'contactMessage',
  cta: 'contactCta',
  focus: 'contactFocus'
};
let lastAssistantPrefill = '';
let lastContactShortcutPrefill = '';

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

const getAssistantApiBaseUrl = () => String(appConfig.assistant?.apiBaseUrl || appConfig.contact.apiBaseUrl || '').trim();

const getAssistantEndpointPath = () => {
  const endpointPath = String(appConfig.assistant?.endpointPath || '/api/assistant').trim();
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

const focusSectionLinks = {
  servicios: { label: 'Ver servicios', href: '#servicios' },
  paquetes: { label: 'Ver paquetes', href: '#paquetes' },
  stack: { label: 'Ver capacidades', href: '#stack' },
  proyectos: { label: 'Ver proyectos', href: '#proyectos' },
  casos: { label: 'Ver casos', href: '#casos' },
  recursos: { label: 'Ver recursos', href: '#recursos' },
  guias: { label: 'Leer guías', href: '#guias' },
  contacto: { label: 'Ir al contacto', href: '#contacto' },
  proposito: { label: 'Ver propósito', href: '#proposito' },
  impacto: { label: 'Ver logros', href: '#impacto' }
};

const serviceLabels = {
  landing: 'Landing page',
  'sitio-web': 'Sitio web informativo',
  auditoria: 'Auditoría web o de conversión',
  automatizacion: 'Automatización o integración',
  asesoria: 'Asesoría técnica',
  redisenio: 'Rediseño visual',
  mantenimiento: 'Soporte o mejora continua'
};

const pageSearchSectionIds = ['inicio', 'servicios', 'proposito', 'paquetes', 'stack', 'proceso', 'impacto', 'proyectos', 'casos', 'recursos', 'guias', 'testimonios', 'contacto'];

const normalizeSearchValue = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

const createPageSearchIndex = () => pageSearchSectionIds
  .map((sectionId) => {
    const section = document.querySelector(`#${sectionId}`);
    if (!section) {
      return null;
    }

    const titleElement = section.querySelector('h1, h2, h3');
    const labelElement = section.querySelector('.eyebrow');
    const descriptionElement = Array.from(section.querySelectorAll('p')).find((paragraph) => paragraph.textContent.trim());
    const title = titleElement?.textContent.trim() || sectionId;
    const label = labelElement?.textContent.trim() || 'Seccion';
    const description = descriptionElement?.textContent.trim() || '';
    const searchableText = normalizeSearchValue(`${label} ${title} ${description} ${section.textContent}`);

    return {
      href: `#${sectionId}`,
      label,
      title,
      description,
      searchableText
    };
  })
  .filter(Boolean);

const pageSearchIndex = createPageSearchIndex();

const searchPageSections = (query) => {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) {
    return [];
  }

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);

  return pageSearchIndex
    .map((item) => {
      const titleValue = normalizeSearchValue(item.title);
      const labelValue = normalizeSearchValue(item.label);
      let score = 0;

      terms.forEach((term) => {
        if (titleValue.includes(term)) {
          score += 6;
        }
        if (labelValue.includes(term)) {
          score += 3;
        }
        if (item.searchableText.includes(term)) {
          score += 1;
        }
      });

      return { ...item, score };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 5);
};

const scrollToSearchTarget = (href) => {
  const target = document.querySelector(href);
  if (!target) {
    return;
  }

  const highlightTarget = target.querySelector(':scope > .container') || target;

  closeNav();
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  highlightTarget.classList.remove('search-target-flash');
  window.requestAnimationFrame(() => {
    highlightTarget.classList.add('search-target-flash');
  });
  window.setTimeout(() => highlightTarget.classList.remove('search-target-flash'), 1800);
};

const scrollToContactForm = () => {
  const contactSection = document.querySelector('#contacto');
  if (!contactSection) {
    return;
  }

  const highlightTarget = contactSection.querySelector(':scope > .container') || contactSection;
  closeAssistant();
  closeNav();
  contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  highlightTarget.classList.remove('search-target-flash');
  window.requestAnimationFrame(() => {
    highlightTarget.classList.add('search-target-flash');
  });
  window.setTimeout(() => highlightTarget.classList.remove('search-target-flash'), 1800);
};

const focusContactMessageField = () => {
  if (!messageField) {
    return;
  }

  window.setTimeout(() => {
    messageField.focus({ preventScroll: true });
    const textLength = messageField.value.length;
    messageField.setSelectionRange(textLength, textLength);
  }, 420);
};

const getContactShortcutPayload = (source) => ({
  service: String(source?.getAttribute?.('data-contact-service') || '').trim(),
  message: String(source?.getAttribute?.('data-contact-message') || '').trim(),
  ctaLabel: String(source?.textContent || '').trim()
});

const buildContactNavigationUrl = (link, payload) => {
  const rawHref = String(link.getAttribute('href') || 'index.html#contacto').trim() || 'index.html#contacto';
  const targetUrl = new URL(rawHref, window.location.href);

  if (payload.service) {
    targetUrl.searchParams.set(contactPrefillQueryKeys.service, payload.service);
  }
  if (payload.message) {
    targetUrl.searchParams.set(contactPrefillQueryKeys.message, payload.message);
  }
  if (payload.ctaLabel) {
    targetUrl.searchParams.set(contactPrefillQueryKeys.cta, payload.ctaLabel);
  }
  targetUrl.searchParams.set(contactPrefillQueryKeys.focus, 'message');

  if (!targetUrl.hash) {
    targetUrl.hash = '#contacto';
  }

  return targetUrl;
};

const readContactPrefillFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const service = String(params.get(contactPrefillQueryKeys.service) || '').trim();
  const message = String(params.get(contactPrefillQueryKeys.message) || '').trim();
  const ctaLabel = String(params.get(contactPrefillQueryKeys.cta) || '').trim();
  const focus = String(params.get(contactPrefillQueryKeys.focus) || '').trim();

  if (!service && !message) {
    return null;
  }

  return { service, message, ctaLabel, focus };
};

const clearContactPrefillFromUrl = () => {
  if (!window.history.replaceState) {
    return;
  }

  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.delete(contactPrefillQueryKeys.service);
  currentUrl.searchParams.delete(contactPrefillQueryKeys.message);
  currentUrl.searchParams.delete(contactPrefillQueryKeys.cta);
  currentUrl.searchParams.delete(contactPrefillQueryKeys.focus);
  const normalizedSearch = currentUrl.searchParams.toString();
  const cleanUrl = `${currentUrl.pathname}${normalizedSearch ? `?${normalizedSearch}` : ''}${currentUrl.hash}`;
  window.history.replaceState({}, document.title, cleanUrl);
};

const applyContactShortcutPrefill = ({ service, message, ctaLabel } = {}, options = {}) => {
  const normalizedService = String(service || '').trim();
  const draftMessage = String(message || '').trim();
  const forceMessage = options.forceMessage === true;

  if (!serviceField || !normalizedService || !serviceLabels[normalizedService]) {
    return;
  }

  serviceField.value = normalizedService;
  setFieldState(serviceField);

  if (messageField && draftMessage) {
    const shouldReplace = forceMessage || !messageField.value.trim() || messageField.dataset.contactPrefill === 'true' || messageField.value.trim() === lastContactShortcutPrefill;
    if (shouldReplace) {
      messageField.value = draftMessage;
      messageField.dataset.contactPrefill = 'true';
      lastContactShortcutPrefill = draftMessage;
      updateCharacterCount();
      setFieldState(messageField);
    }
  }

  if (prefillNote) {
    prefillNote.hidden = false;
    prefillNote.textContent = ctaLabel
      ? `${ctaLabel} te llevó con ${serviceLabels[normalizedService].toLowerCase()} ya seleccionado. Puedes cambiarlo si prefieres otra opción.`
      : `Formulario preparado para ${serviceLabels[normalizedService].toLowerCase()}. Puedes cambiarlo si prefieres otra opción.`;
  }

  saveDraft();
};

const renderPageSearchResults = (results, query) => {
  if (!pageSearchResults || !pageSearchStatus) {
    return;
  }

  pageSearchResults.innerHTML = '';

  if (!query) {
    pageSearchResults.hidden = true;
    pageSearchStatus.textContent = 'Prueba con: landing, conversion, automatizacion, scraping, recursos o contacto.';
    return;
  }

  if (!results.length) {
    pageSearchResults.hidden = true;
    pageSearchStatus.textContent = 'No encontre coincidencias. Prueba con otra palabra o ve al contacto.';
    return;
  }

  const fragment = document.createDocumentFragment();

  results.forEach((result) => {
    const anchor = document.createElement('a');
    anchor.className = 'page-search-result';
    anchor.href = result.href;

    const tag = document.createElement('span');
    tag.className = 'page-search-result-tag';
    tag.textContent = result.label;

    const title = document.createElement('strong');
    title.textContent = result.title;

    const description = document.createElement('span');
    description.textContent = result.description || 'Ir a esta seccion';

    anchor.append(tag, title, description);
    anchor.addEventListener('click', (event) => {
      event.preventDefault();
      scrollToSearchTarget(result.href);
    });

    fragment.appendChild(anchor);
  });

  pageSearchResults.appendChild(fragment);
  pageSearchResults.hidden = false;
  pageSearchStatus.textContent = `${results.length} resultado${results.length === 1 ? '' : 's'} para "${query}".`;
};

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

const canUseAssistantApi = () => Boolean(appConfig.assistant?.enabled && getAssistantEndpointPath());

const buildAssistantApiUrl = () => {
  const baseUrl = getAssistantApiBaseUrl().replace(/\/$/, '');
  const endpointPath = getAssistantEndpointPath();
  return baseUrl ? `${baseUrl}${endpointPath}` : endpointPath;
};

const buildAssistantLinks = (payload) => {
  const links = [];
  if (payload.focusSection && focusSectionLinks[payload.focusSection]) {
    links.push(focusSectionLinks[payload.focusSection]);
  }
  if (payload.prefill?.service || payload.focusSection !== 'contacto') {
    links.push({ label: 'Ir al contacto', href: '#contacto' });
  }

  return links.filter((link, index, collection) => collection.findIndex((entry) => entry.href === link.href) === index);
};

const setAssistantSubmittingState = (isSubmitting) => {
  if (assistantInput) {
    assistantInput.disabled = isSubmitting;
  }

  if (assistantSendButton) {
    assistantSendButton.disabled = isSubmitting;
    assistantSendButton.textContent = isSubmitting ? 'Pensando...' : 'Enviar';
  }
};

const applyAssistantPrefill = (prefill, userPrompt) => {
  if (!prefill) {
    return;
  }

  const normalizedService = String(prefill.service || '').trim();
  const draftMessage = String(prefill.message || '').trim();

  if (serviceField && normalizedService && serviceLabels[normalizedService]) {
    serviceField.value = normalizedService;
    setFieldState(serviceField);
  }

  if (messageField && draftMessage) {
    const shouldReplace = !messageField.value.trim() || messageField.dataset.assistantPrefill === 'true' || messageField.value.trim() === lastAssistantPrefill;
    if (shouldReplace) {
      messageField.value = draftMessage;
      messageField.dataset.assistantPrefill = 'true';
      lastAssistantPrefill = draftMessage;
      updateCharacterCount();
      setFieldState(messageField);
    }
  }

  if (prefillNote && normalizedService && serviceLabels[normalizedService]) {
    prefillNote.hidden = false;
    prefillNote.textContent = `Formulario preparado para ${serviceLabels[normalizedService].toLowerCase()}. Puedes editarlo antes de enviarlo.`;
  }

  if (assistantConversation.length === 0 || assistantConversation[assistantConversation.length - 1]?.content !== userPrompt) {
    assistantConversation.push({ role: 'user', content: userPrompt });
  }

  saveDraft();
};

const requestAssistantReply = async (prompt) => {
  const response = await fetch(buildAssistantApiUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: prompt,
      history: assistantConversation.slice(-6)
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'No fue posible responder la consulta en este momento.');
  }

  return data;
};

const handleAssistantPrompt = async (prompt) => {
  if (!prompt) {
    return;
  }

  appendAssistantMessage('user', prompt);
  assistantConversation.push({ role: 'user', content: prompt });
  setAssistantSubmittingState(true);
  openAssistant();

  try {
    if (!canUseAssistantApi()) {
      throw new Error('El asistente IA no esta disponible en este momento.');
    }

    const reply = await requestAssistantReply(prompt);
    const links = buildAssistantLinks(reply);
    appendAssistantMessage('bot', reply.answer || 'No pude generar una respuesta útil en este momento.', links);
    assistantConversation.push({ role: 'assistant', content: reply.answer || '' });
    applyAssistantPrefill(reply.prefill, prompt);
  } catch (error) {
    appendAssistantMessage('bot', error.message || 'No fue posible responder la consulta en este momento.', [{ label: 'Ir al contacto', href: '#contacto' }]);
  } finally {
    setAssistantSubmittingState(false);
  }
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

if (pageSearchForm && pageSearchInput) {
  pageSearchInput.addEventListener('input', () => {
    const query = pageSearchInput.value.trim();
    renderPageSearchResults(searchPageSections(query), query);
  });

  pageSearchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = pageSearchInput.value.trim();
    const results = searchPageSections(query);
    renderPageSearchResults(results, query);

    if (results.length) {
      scrollToSearchTarget(results[0].href);
    }
  });
}

if (contactShortcutLinks.length) {
  contactShortcutLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const payload = getContactShortcutPayload(link);
      if (!payload.service) {
        return;
      }

      const targetUrl = buildContactNavigationUrl(link, payload);
      const isSameDocument = targetUrl.pathname === window.location.pathname && targetUrl.hash === '#contacto' && Boolean(form);

      if (isSameDocument) {
        event.preventDefault();
        applyContactShortcutPrefill(payload, { forceMessage: true });
        scrollToContactForm();
        focusContactMessageField();
        return;
      }

      link.setAttribute('href', `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`);
    });
  });
}

if (assistantToggle && assistantPanel) {
  assistantToggle.addEventListener('click', toggleAssistant);
  assistantClose?.addEventListener('click', closeAssistant);

  assistantChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-assistant-prompt') || '';
      handleAssistantPrompt(prompt);
    });
  });

  assistantForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const prompt = String(assistantInput?.value || '').trim();
    if (!prompt) {
      return;
    }

    handleAssistantPrompt(prompt);
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
  const contactPrefillFromUrl = readContactPrefillFromUrl();
  if (contactPrefillFromUrl) {
    applyContactShortcutPrefill(contactPrefillFromUrl, { forceMessage: true });
    if (contactPrefillFromUrl.focus === 'message') {
      focusContactMessageField();
    }
    clearContactPrefillFromUrl();
  }
  updateCharacterCount();

  fields.forEach((field) => {
    field.addEventListener('input', () => {
      setFieldState(field);
      saveDraft();
      if (field === messageField) {
        field.dataset.assistantPrefill = 'false';
        field.dataset.contactPrefill = 'false';
      }
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
