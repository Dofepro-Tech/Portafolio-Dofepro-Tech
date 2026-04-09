const path = require('node:path');
const {
  exists,
  readUtf8File,
  resolveWithinRoot
} = require('../utils');

const createCheck = (key, level, passed, message) => ({
  key,
  level,
  passed,
  message
});

const hasPattern = (content, expression) => expression.test(content);

const auditWebProject = async (project, entryFileOverride) => {
  const entryFile = entryFileOverride || project.entryFile || 'index.html';
  const entryPath = resolveWithinRoot(project.root, entryFile);
  const entryExists = await exists(entryPath);
  const checks = [];

  checks.push(createCheck('entry-file', 'required', entryExists, entryExists
    ? `Existe el archivo de entrada ${entryFile}.`
    : `No existe el archivo de entrada ${entryFile}.`));

  let entryContent = '';

  if (entryExists) {
    entryContent = await readUtf8File(entryPath);

    checks.push(createCheck('title', 'required', hasPattern(entryContent, /<title>[^<]+<\/title>/i), 'El HTML principal debe incluir un title util.'));
    checks.push(createCheck('meta-description', 'required', hasPattern(entryContent, /<meta\s+name=["']description["'][^>]+content=/i), 'El HTML principal debe incluir meta description.'));
    checks.push(createCheck('viewport', 'required', hasPattern(entryContent, /<meta\s+name=["']viewport["']/i), 'El HTML principal debe incluir viewport.'));
    checks.push(createCheck('canonical', 'recommended', hasPattern(entryContent, /<link\s+rel=["']canonical["']/i), 'Conviene declarar canonical en la pagina principal.'));
    checks.push(createCheck('og-title', 'recommended', hasPattern(entryContent, /<meta\s+property=["']og:title["']/i), 'Conviene incluir Open Graph title.'));
    checks.push(createCheck('privacy-link', 'required', hasPattern(entryContent, /politica-privacidad\.html/i), 'La home deberia enlazar a la politica de privacidad.'));
    checks.push(createCheck('terms-link', 'required', hasPattern(entryContent, /terminos-condiciones\.html/i), 'La home deberia enlazar a terminos y condiciones.'));
  }

  const supportFiles = [
    ['robots.txt', 'recommended'],
    ['sitemap.xml', 'recommended'],
    ['ads.txt', 'recommended'],
    ['politica-privacidad.html', 'required'],
    ['terminos-condiciones.html', 'required']
  ];

  for (const [relativePath, level] of supportFiles) {
    const fileExists = await exists(path.join(project.root, relativePath));
    checks.push(createCheck(`file:${relativePath}`, level, fileExists, fileExists
      ? `Existe ${relativePath}.`
      : `Falta ${relativePath}.`));
  }

  const sitemapPath = path.join(project.root, 'sitemap.xml');

  if (await exists(sitemapPath)) {
    const sitemapContent = await readUtf8File(sitemapPath);
    checks.push(createCheck('sitemap-privacy', 'recommended', /politica-privacidad\.html/i.test(sitemapContent), 'Conviene que sitemap incluya politica de privacidad.'));
    checks.push(createCheck('sitemap-terms', 'recommended', /terminos-condiciones\.html/i.test(sitemapContent), 'Conviene que sitemap incluya terminos y condiciones.'));
  }

  const totals = checks.reduce((accumulator, check) => {
    accumulator.total += 1;
    if (check.passed) {
      accumulator.passed += 1;
    }

    if (!check.passed && check.level === 'required') {
      accumulator.requiredFailures += 1;
    }

    if (!check.passed && check.level === 'recommended') {
      accumulator.recommendedFailures += 1;
    }

    return accumulator;
  }, {
    total: 0,
    passed: 0,
    requiredFailures: 0,
    recommendedFailures: 0
  });

  return {
    projectKey: project.key,
    entryFile,
    score: Math.round((totals.passed / totals.total) * 100),
    totals,
    checks
  };
};

module.exports = {
  auditWebProject
};
