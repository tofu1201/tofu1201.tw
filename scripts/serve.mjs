import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { renderPage } from '../src/page.mjs';
import { renderNotFound } from '../src/not-found.mjs';
import { metadataFiles } from '../src/metadata.mjs';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const preview = process.argv.includes('--preview');
const flag = (name) => {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
};
const port = Number(flag('--port') || process.env.PORT || 4321);
const host = flag('--host') || '127.0.0.1';
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT 必須是 1–65535 之間的整數。');
const directory = resolve(projectRoot, preview ? 'dist' : 'public');
if (preview) {
  try { await stat(resolve(directory, 'index.html')); }
  catch { console.error('請先執行 npm run build，再開啟正式版預覽。'); process.exit(1); }
}
const generated = metadataFiles();
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.avif': 'image/avif',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};

const server = createServer(async (request, response) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('Cache-Control', preview ? 'public, max-age=0, must-revalidate' : 'no-cache');
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method Not Allowed');
    return;
  }
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let body;
    let type;
    let status = 200;
    if (!preview && (pathname === '/' || pathname === '/index.html')) {
      body = Buffer.from(renderPage()); type = types['.html'];
    } else if (!preview && generated.has(pathname.slice(1))) {
      body = Buffer.from(generated.get(pathname.slice(1))); type = types[extname(pathname)];
    } else {
      const target = resolve(directory, `.${pathname === '/' ? '/index.html' : pathname}`);
      if (!target.startsWith(`${directory}${sep}`)) {
        response.writeHead(403); response.end('Forbidden'); return;
      }
      try {
        body = await readFile(target); type = types[extname(target)] || 'application/octet-stream';
      } catch (error) {
        if (!['ENOENT', 'EISDIR', 'ENOTDIR', 'EINVAL'].includes(error.code)) throw error;
        body = Buffer.from(renderNotFound()); type = types['.html']; status = 404;
      }
    }
    const etag = `"${createHash('sha256').update(body).digest('hex').slice(0, 20)}"`;
    response.setHeader('ETag', etag);
    response.setHeader('Vary', 'Accept-Encoding');
    if (request.headers['if-none-match'] === etag && status === 200) {
      response.writeHead(304); response.end(); return;
    }
    response.setHeader('Content-Type', type);
    if (/gzip/.test(request.headers['accept-encoding'] || '') && /^(text\/|application\/(json|xml))/.test(type) && body.length > 1000) {
      body = gzipSync(body); response.setHeader('Content-Encoding', 'gzip');
    }
    response.setHeader('Content-Length', body.length);
    response.writeHead(status);
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch (error) {
    const invalidRequest = error instanceof URIError || error instanceof TypeError;
    if (!invalidRequest) console.error(error);
    response.writeHead(invalidRequest ? 400 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(invalidRequest ? 'Bad Request' : 'Internal Server Error');
  }
});

server.on('error', (error) => {
  console.error(error.code === 'EADDRINUSE' ? `連接埠 ${port} 已使用，請加入 --port 4322。` : error.message);
  process.exit(1);
});
server.listen(port, host, () => console.log(`\n  Tofu Chen — ${preview ? 'Production preview' : 'Development'}\n  http://${host}:${port}\n`));
