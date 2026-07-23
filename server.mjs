import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const port = process.env.PORT || 4173;
const root = process.cwd();
const publicDir = join(root, 'public');
const briefingsDir = join(root, 'briefings');
const types = { '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

async function briefings() {
  try {
    const names = (await readdir(briefingsDir)).filter((name) => name.endsWith('.json')).sort().reverse();
    return await Promise.all(names.map(async (name) => {
      try { return JSON.parse(await readFile(join(briefingsDir, name), 'utf8')); } catch { return null; }
    })).then((items) => items.filter(Boolean));
  } catch { return []; }
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/api/briefings') {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
    res.end(JSON.stringify(await briefings()));
    return;
  }
  const requested = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  const file = normalize(join(publicDir, requested));
  if (!file.startsWith(publicDir)) { res.writeHead(403); res.end('Forbidden'); return; }
  try {
    res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, () => console.log(`Signal Desk is ready at http://localhost:${port}`));
