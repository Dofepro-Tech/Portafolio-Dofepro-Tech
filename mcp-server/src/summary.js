const path = require('node:path');
const { exists, listTopLevelEntries, readUtf8File, tryParseJson } = require('./utils');

const buildProjectSummary = async (project) => {
  const packageJsonPath = path.join(project.root, 'package.json');
  const readmePath = path.join(project.root, 'README.md');
  const packageJsonExists = await exists(packageJsonPath);
  const readmeExists = await exists(readmePath);

  let packageInfo = null;
  let readmePreview = null;

  if (packageJsonExists) {
    packageInfo = tryParseJson(await readUtf8File(packageJsonPath));
  }

  if (readmeExists) {
    readmePreview = (await readUtf8File(readmePath))
      .split(/\r?\n/)
      .slice(0, 12)
      .join('\n');
  }

  return {
    key: project.key,
    name: project.name,
    type: project.type,
    root: project.root,
    entryFile: project.entryFile,
    tags: project.tags,
    metadata: project.metadata,
    hasPackageJson: packageJsonExists,
    hasReadme: readmeExists,
    packageInfo: packageInfo
      ? {
          name: packageInfo.name || null,
          version: packageInfo.version || null,
          scripts: packageInfo.scripts || {},
          dependencies: packageInfo.dependencies || {}
        }
      : null,
    readmePreview,
    topLevelEntries: await listTopLevelEntries(project.root)
  };
};

module.exports = {
  buildProjectSummary
};
