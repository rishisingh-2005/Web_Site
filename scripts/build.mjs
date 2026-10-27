import { cp, lstat, mkdir, readdir, readFile, realpath, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = await realpath(fileURLToPath(new URL('..', import.meta.url)));
const outputDirectory = path.resolve(projectRoot, 'dist');
const indexFile = path.join(projectRoot, 'index.html');
const sourceDirectory = path.join(projectRoot, 'src');
const publicDirectory = path.join(projectRoot, 'public');
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const configuredBasePath = process.env.BASE_PATH
  ?? (repositoryName && !repositoryName.endsWith('.github.io') ? `/${repositoryName}` : '');
const basePath = configuredBasePath ? `/${configuredBasePath.replace(/^\/+|\/+$/g, '')}` : '';

// Check inputs before touching a previous build.
if (!(await stat(indexFile)).isFile()) throw new Error('Missing index.html.');
if (!(await stat(sourceDirectory)).isDirectory()) throw new Error('Missing src directory.');
if (!(await stat(publicDirectory)).isDirectory()) throw new Error('Missing public directory.');

// The only recursive deletion allowed is the real dist directory directly
// inside this project. Refuse symlinks and any unexpected resolved location.
if (path.dirname(outputDirectory) !== projectRoot || path.basename(outputDirectory) !== 'dist') {
  throw new Error('Refusing to clean a build directory outside the project.');
}
try {
  const existingOutput = await lstat(outputDirectory);
  if (existingOutput.isSymbolicLink() || !existingOutput.isDirectory()) {
    throw new Error('Refusing to replace dist because it is not a regular directory.');
  }
  if (await realpath(outputDirectory) !== outputDirectory) {
    throw new Error('Refusing to clean a build directory with an unexpected real path.');
  }
  await rm(outputDirectory, { recursive: true, force: true });
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

await mkdir(outputDirectory, { recursive: true });
await cp(indexFile, path.join(outputDirectory, 'index.html'));
await cp(sourceDirectory, path.join(outputDirectory, 'src'), { recursive: true });
await cp(publicDirectory, outputDirectory, { recursive: true });

if (basePath) {
  const entries = await readdir(path.join(outputDirectory, 'src'), { withFileTypes: true });
  const sourceFiles = entries
    .filter((entry) => entry.isFile() && /\.(?:css|js)$/.test(entry.name))
    .map((entry) => path.join(outputDirectory, 'src', entry.name));

  for (const file of [path.join(outputDirectory, 'index.html'), ...sourceFiles]) {
    const contents = await readFile(file, 'utf8');
    const rewritten = contents.replace(/(["'])\/(?!\/)([^"'#\s]+)\1/g, (_, quote, assetPath) =>
      `${quote}${basePath}/${assetPath}${quote}`,
    );
    await writeFile(file, rewritten);
  }
}

console.log('Built the complete static website in dist/.');
console.log('Deploy the contents of dist/ to any static web host.');
