const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const projectRoot = path.resolve(__dirname, '..');
const srcRoot = path.join(projectRoot, 'src');

const collectJsFiles = (dirPath, bucket = []) => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      collectJsFiles(fullPath, bucket);
      continue;
    }

    if (entry.isFile() && fullPath.endsWith('.js')) {
      bucket.push(fullPath);
    }
  }

  return bucket;
};

const filesToCheck = [
  ...collectJsFiles(srcRoot),
  path.join(projectRoot, 'scripts', 'check.js'),
  path.join(projectRoot, 'scripts', 'verify.js')
];

for (const filePath of filesToCheck) {
  execFileSync(process.execPath, ['--check', filePath], {
    stdio: 'inherit'
  });
}

console.log(`Sintaxis validada en ${filesToCheck.length} archivos.`);
