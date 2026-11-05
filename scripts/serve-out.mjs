// 本机预览静态导出的结果：先 npm run build（生成 out/），再 npm run start。
// 行为尽量和 Cloudflare Pages 一致：/about → about.html，/blog/xxx → blog/xxx.html，找不到就返回 404.html（状态码 404）。
// 用法：npm run start，或 npm run start -- -p 3006（端口默认 3000）
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'out');
const args = process.argv.slice(2);
const portIndex = args.findIndex((a) => a === '-p' || a === '--port');
const port = Number((portIndex >= 0 ? args[portIndex + 1] : process.env.PORT) || 3000);

if (!existsSync(path.join(root, 'index.html'))) {
  console.error('找不到 out/index.html：请先运行 npm run build');
  process.exit(1);
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.map': 'application/json',
};

function isFile(p) {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
}

/** 网址 → out/ 里的文件；不允许跳出 out/ 目录 */
function resolveFile(urlPath) {
  let rel;
  try {
    rel = decodeURIComponent(urlPath).replace(/^\/+/, '');
  } catch {
    return null;
  }
  const base = path.resolve(root, rel);
  if (base !== root && !base.startsWith(root + path.sep)) return null;
  return [base, `${base}.html`, path.join(base, 'index.html')].find(isFile) ?? null;
}

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let file = resolveFile(url.pathname);
  let status = 200;
  if (!file) {
    file = path.join(root, '404.html');
    status = 404;
  }
  res.writeHead(status, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
}).listen(port, () => {
  console.log(`静态预览：http://localhost:${port}（目录 ${root}）`);
});
