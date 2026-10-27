import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

const projectRoot = await realpath(fileURLToPath(new URL('..', import.meta.url)));
const publicRoot = path.join(projectRoot, 'public');
const sourceRoot = path.join(projectRoot, 'src');
const options = { host: '127.0.0.1', port: 5173 };

for (let index = 2; index < process.argv.length; index += 1) {
  const argument = process.argv[index];
  const [key, inlineValue] = argument.split('=', 2);
  if (key === '--help' || key === '-h') {
    console.log('Usage: node scripts/serve.mjs [--host 127.0.0.1] [--port 5173]');
    process.exit(0);
  }
  if (key !== '--host' && key !== '--port') {
    throw new Error(`Unknown option: ${key}. Use --help for available options.`);
  }
  const value = inlineValue ?? process.argv[++index];
  if (!value || value.startsWith('--')) throw new Error(`Missing value for ${key}.`);
  if (key === '--host') options.host = value;
  else {
    if (!/^\d+$/.test(value) || Number(value) > 65535) {
      throw new Error('The port must be a number from 0 to 65535.');
    }
    options.port = Number(value);
  }
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.mp4': 'video/mp4',
};

function isWithin(directory, candidate) {
  const relative = path.relative(directory, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function respond(response, status, message, headOnly = false) {
  response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end(headOnly ? undefined : message);
}

const server = createServer(async (request, response) => {
  response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  const headOnly = request.method === 'HEAD';
  if (request.method !== 'GET' && !headOnly) {
    response.setHeader('Allow', 'GET, HEAD');
    respond(response, 405, 'Method not allowed.');
    return;
  }

  try {
    // Decode before checking segments so encoded traversal is rejected too.
    const pathname = decodeURIComponent((request.url ?? '/').split('?')[0]);
    const segments = pathname.split('/');
    if (!pathname.startsWith('/') || /[\\\0:]/.test(pathname) || segments.some((part) => part.startsWith('.'))) {
      respond(response, 403, 'Forbidden.', headOnly);
      return;
    }

    let allowedRoot = publicRoot;
    let filename = path.resolve(publicRoot, `.${pathname}`);
    if (pathname === '/' || pathname === '/index.html') {
      allowedRoot = projectRoot;
      filename = path.join(projectRoot, 'index.html');
    } else if (pathname.startsWith('/src/')) {
      allowedRoot = sourceRoot;
      filename = path.resolve(projectRoot, `.${pathname}`);
    }

    if (!isWithin(allowedRoot, filename)) {
      respond(response, 403, 'Forbidden.', headOnly);
      return;
    }
    const actualFilename = await realpath(filename);
    const actualRoot = await realpath(allowedRoot);
    if (!isWithin(actualRoot, actualFilename)) {
      respond(response, 403, 'Forbidden.', headOnly);
      return;
    }
    const fileInfo = await stat(actualFilename);
    if (!fileInfo.isFile()) {
      respond(response, 404, 'Not found.', headOnly);
      return;
    }

    response.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(actualFilename).toLowerCase()] ?? 'application/octet-stream',
      'Content-Length': fileInfo.size,
    });
    if (headOnly) response.end();
    else await pipeline(createReadStream(actualFilename), response);
  } catch (error) {
    if (response.headersSent) {
      response.destroy();
      return;
    }
    if (error instanceof URIError) respond(response, 400, 'Invalid URL.', headOnly);
    else if (error.code === 'ENOENT' || error.code === 'ENOTDIR') respond(response, 404, 'Not found.', headOnly);
    else if (error.code === 'EACCES' || error.code === 'EPERM') respond(response, 403, 'Forbidden.', headOnly);
    else {
      console.error(error);
      respond(response, 500, 'Unable to serve this file.', headOnly);
    }
  }
});

server.on('error', (error) => {
  console.error(error.code === 'EADDRINUSE'
    ? `Port ${options.port} is already in use. Try npm run dev -- --port ${options.port + 1}.`
    : error.message);
  process.exitCode = 1;
});

server.listen(options.port, options.host, () => {
  const address = server.address();
  const displayHost = options.host.includes(':') ? `[${options.host}]` : options.host;
  console.log(`A little love, served at http://${displayHost}:${address.port}`);
  console.log('Press Ctrl+C to stop.');
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
