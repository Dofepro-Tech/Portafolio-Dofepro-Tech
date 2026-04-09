const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);

const tryExecGit = async (args, cwd) => {
  try {
    return await execFileAsync('git', args, {
      cwd,
      windowsHide: true,
      maxBuffer: 1024 * 1024
    });
  } catch (error) {
    return {
      failed: true,
      message: error.stderr || error.message || 'Fallo ejecutando Git.'
    };
  }
};

const getGitOverview = async (project) => {
  const topLevel = await tryExecGit(['-C', project.gitRoot, 'rev-parse', '--show-toplevel'], project.root);

  if (topLevel.failed) {
    return {
      isRepository: false,
      reason: 'No parece ser un repositorio Git o Git no esta disponible.'
    };
  }

  const gitRoot = topLevel.stdout.trim();
  const branchResult = await tryExecGit(['-C', gitRoot, 'rev-parse', '--abbrev-ref', 'HEAD'], project.root);
  const statusResult = await tryExecGit(['-C', gitRoot, 'status', '--short'], project.root);
  const logResult = await tryExecGit(['-C', gitRoot, 'log', '--oneline', '--decorate', '-n', '6'], project.root);

  return {
    isRepository: true,
    gitRoot: path.resolve(gitRoot),
    branch: branchResult.failed ? 'desconocida' : branchResult.stdout.trim(),
    statusLines: statusResult.failed
      ? [`No se pudo obtener status: ${statusResult.message}`]
      : statusResult.stdout.split(/\r?\n/).filter(Boolean),
    recentCommits: logResult.failed
      ? [`No se pudo obtener log: ${logResult.message}`]
      : logResult.stdout.split(/\r?\n/).filter(Boolean)
  };
};

module.exports = {
  getGitOverview
};
