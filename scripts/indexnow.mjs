// IndexNow 主动推送（Bing / Yandex 等）：把线上 sitemap 里的网址提交给搜索引擎。
// 网站部署完成后，在自己电脑上运行（需要 Node 18 以上）：
//   node scripts/indexnow.mjs                  提交线上 sitemap.xml 里的全部网址
//   node scripts/indexnow.mjs --dry-run        只打印要提交的内容，不发送
//   node scripts/indexnow.mjs <网址> [网址…]    只提交指定的网址（必须是本站网址）
// 之后每次新增或更新文章，再运行一次即可。
// 密钥文件是 public/<密钥>.txt：文件名就是密钥，内容必须和文件名一致，部署后要能公开访问（IndexNow 会去核对）。
// （以前这个功能是 /api/indexnow 接口；网站改成纯静态后没有服务器，所以改成这个脚本。）
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_URL = 'https://xingjiabijichang.blog';
const SITE_HOST = new URL(SITE_URL).host;
const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const requested = args.filter((a) => !a.startsWith('--'));

const keyFile = readdirSync(publicDir).find((f) => /^[0-9a-f]{32}\.txt$/i.test(f));
if (!keyFile) {
  console.error('public/ 里找不到密钥文件（文件名是 32 位十六进制字符的 .txt）');
  process.exit(1);
}
const key = keyFile.replace(/\.txt$/i, '');
if (readFileSync(path.join(publicDir, keyFile), 'utf8').trim() !== key) {
  console.error(`密钥文件 ${keyFile} 的内容必须和文件名一致`);
  process.exit(1);
}

async function sitemapUrls() {
  const res = await fetch(`${SITE_URL}/sitemap.xml`);
  if (!res.ok) throw new Error(`读取 ${SITE_URL}/sitemap.xml 失败：HTTP ${res.status}（网站部署好了吗？）`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

const all = requested.length > 0 ? requested : await sitemapUrls();
const urlList = [...new Set(all)].filter((u) => u === SITE_URL || u.startsWith(`${SITE_URL}/`)).slice(0, 10000);
if (urlList.length === 0) {
  console.error('没有可提交的本站网址');
  process.exit(1);
}

const payload = { host: SITE_HOST, key, keyLocation: `${SITE_URL}/${key}.txt`, urlList };
console.log(`准备提交 ${urlList.length} 个网址，密钥文件：${payload.keyLocation}`);
if (dryRun) {
  console.log(JSON.stringify(payload, null, 2));
  process.exit(0);
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
});
console.log(`IndexNow 返回 HTTP ${res.status}${res.ok ? '（已接收）' : '（失败：请先确认密钥文件能公开访问）'}`);
process.exit(res.ok ? 0 : 1);
