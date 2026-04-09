const path = require('node:path');
const fs = require('node:fs/promises');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { clamp, isTextPath, normalizePosixPath, readUtf8File, walkFiles } = require('../utils');

const execFileAsync = promisify(execFile);

const searchWithRipgrep = async (project, { query, glob, maxResults }) => {
  const args = ['--json', '-n', '-F', query];

  if (glob) {
    args.push('-g', glob);
  }

  args.push(project.root);

  const { stdout } = await execFileAsync('rg', args, {
    cwd: project.root,
    windowsHide: true,
    maxBuffer: 4 * 1024 * 1024
  });

  const results = [];
  const lines = stdout.split(/\r?\n/).filter(Boolean);

  for (const line of lines) {
    const payload = JSON.parse(line);

    if (payload.type !== 'match') {
      continue;
    }

    const absolutePath = payload.data.path.text;
    results.push({
      file: normalizePosixPath(path.relative(project.root, absolutePath)),
      line: payload.data.line_number,
      text: payload.data.lines.text.trim()
    });

    if (results.length >= maxResults) {
      break;
    }
  }

  return {
    engine: 'ripgrep',
    results
  };
};

const searchWithFallback = async (project, { query, maxResults }) => {
  const loweredQuery = query.toLowerCase();
  const files = await walkFiles(project.root, {
    maxFiles: 400,
    include: (absolutePath) => isTextPath(absolutePath)
  });

  const results = [];

  for (const file of files) {
    if (results.length >= maxResults) {
      break;
    }

    const stats = await fs.stat(file.absolutePath);

    if (stats.size > 512 * 1024) {
      continue;
    }

    const content = await readUtf8File(file.absolutePath);
    const lines = content.split(/\r?\n/);

    for (let index = 0; index < lines.length; index += 1) {
      if (lines[index].toLowerCase().includes(loweredQuery)) {
        results.push({
          file: file.relativePath,
          line: index + 1,
          text: lines[index].trim()
        });
      }

      if (results.length >= maxResults) {
        break;
      }
    }
  }

  return {
    engine: 'internal',
    results
  };
};

const searchProjectText = async (project, options) => {
  const maxResults = clamp(Number(options.maxResults) || 20, 1, 80);

  try {
    return await searchWithRipgrep(project, {
      query: options.query,
      glob: options.glob,
      maxResults
    });
  } catch {
    return searchWithFallback(project, {
      query: options.query,
      maxResults
    });
  }
};

module.exports = {
  searchProjectText
};
