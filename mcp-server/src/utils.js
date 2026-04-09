const fs = require('node:fs/promises');
const path = require('node:path');

const DEFAULT_IGNORED_DIRECTORIES = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.next',
  '.turbo',
  '.cache'
]);

const TEXT_FILE_EXTENSIONS = new Set([
  '.js',
  '.cjs',
  '.mjs',
  '.ts',
  '.tsx',
  '.jsx',
  '.json',
  '.md',
  '.html',
  '.css',
  '.scss',
  '.txt',
  '.yml',
  '.yaml',
  '.toml',
  '.env',
  '.xml',
  '.svg',
  '.py',
  '.java',
  '.kt',
  '.go',
  '.rs',
  '.sql',
  '.sh',
  '.ps1'
]);

const normalizePosixPath = (value) => value.split(path.sep).join('/');

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const isPathInside = (rootPath, targetPath) => {
  const relative = path.relative(rootPath, targetPath);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
};

const resolveWithinRoot = (rootPath, relativePath) => {
  const candidatePath = path.resolve(rootPath, relativePath);

  if (!isPathInside(rootPath, candidatePath)) {
    throw new Error(`La ruta ${relativePath} queda fuera del proyecto permitido.`);
  }

  return candidatePath;
};

const exists = async (targetPath) => {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
};

const readUtf8File = async (filePath) => fs.readFile(filePath, 'utf8');

const splitLines = (content) => content.replace(/\r\n/g, '\n').split('\n');

const isTextPath = (filePath) => {
  const extension = path.extname(filePath).toLowerCase();
  return TEXT_FILE_EXTENSIONS.has(extension) || path.basename(filePath).toLowerCase() === '.gitignore';
};

const listTopLevelEntries = async (rootPath, limit = 40) => {
  const entries = await fs.readdir(rootPath, { withFileTypes: true });

  return entries
    .sort((left, right) => left.name.localeCompare(right.name))
    .slice(0, limit)
    .map((entry) => ({
      name: entry.name,
      kind: entry.isDirectory() ? 'dir' : 'file'
    }));
};

const walkFiles = async (rootPath, options = {}) => {
  const {
    maxFiles = 500,
    ignoredDirectories = DEFAULT_IGNORED_DIRECTORIES,
    include = () => true
  } = options;

  const results = [];
  const queue = [''];

  while (queue.length > 0 && results.length < maxFiles) {
    const relativeDir = queue.shift();
    const absoluteDir = path.join(rootPath, relativeDir);
    const entries = await fs.readdir(absoluteDir, { withFileTypes: true });

    for (const entry of entries) {
      if (results.length >= maxFiles) {
        break;
      }

      const relativePath = relativeDir ? path.join(relativeDir, entry.name) : entry.name;
      const absolutePath = path.join(rootPath, relativePath);

      if (entry.isDirectory()) {
        if (!ignoredDirectories.has(entry.name)) {
          queue.push(relativePath);
        }

        continue;
      }

      if (entry.isFile() && include(absolutePath, relativePath)) {
        results.push({
          absolutePath,
          relativePath: normalizePosixPath(relativePath)
        });
      }
    }
  }

  return results;
};

const tryParseJson = (content) => {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
};

module.exports = {
  DEFAULT_IGNORED_DIRECTORIES,
  clamp,
  exists,
  isPathInside,
  isTextPath,
  listTopLevelEntries,
  normalizePosixPath,
  readUtf8File,
  resolveWithinRoot,
  splitLines,
  tryParseJson,
  walkFiles
};
