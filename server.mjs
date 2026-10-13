import http from 'node:http';
import { readFile } from 'node:fs/promises';

const port = Number(process.env.PORT || 4180);
if (!Number.isInteger(port) || port < 1024 || port > 65535 || port === 4173) {
  console.error('Elige un puerto válido distinto de 4173. El puerto predeterminado es 4180.');
  process.exit(1);
}

const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/hero-background.css', ['hero-background.css', 'text/css; charset=utf-8']],
  ['/hero-background.js', ['hero-background.js', 'text/javascript; charset=utf-8']],
  ['/favicon.svg', ['favicon.svg', 'image/svg+xml']],
]);
const server = http.createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' });
    return response.end('Método no permitido');
  }
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const entry = files.get(pathname);
  if (!entry) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return response.end('Página no encontrada');
  }
  try {
    const content = await readFile(new URL(entry[0], import.meta.url));
    response.writeHead(200, { 'Content-Type': entry[1], 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('No se pudo cargar la página');
  }
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `El puerto ${port} está ocupado. Elige otro con PORT; no se utilizará 4173.` : error.message);
  process.exit(1);
});
server.listen(port, '127.0.0.1', () => console.log(`Landing page disponible en http://localhost:${port}`));
