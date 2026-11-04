import { NextResponse } from 'next/server';
import sitemap from '@/app/sitemap';
import { SITE_HOST, SITE_URL } from '@/data/site';

/**
 * IndexNow 主动推送（Bing / Yandex 等）。
 *
 * 使用方法（网站上线后，只需要做一次）：
 * 1. 在托管平台的环境变量里设置 INDEXNOW_SECRET（自己想一串足够长的随机字符）。
 * 2. 执行：
 *    curl -X POST https://xingjiabijichang.blog/api/indexnow -H "x-indexnow-secret: 你的密钥" -H "Content-Type: application/json" -d "{}"
 *    不带 urlList 时，会提交首页、主要页面、全部文章和允许收录的品牌页。
 * 之后每次新增/更新文章，再推送一次对应网址即可（urlList 里只能放本站网址）。
 *
 * 没有设置 INDEXNOW_SECRET 时接口是关闭的，避免被他人滥用。
 * 密钥文件 public/f72a494d13a647df8bc2fba0914c81a2.txt 必须保持可公开访问，且内容与下面的 KEY 一致。
 */
const KEY = 'f72a494d13a647df8bc2fba0914c81a2';
const MAX_URLS = 100;

/** 默认推送 sitemap 里的全部网址，这样新增页面、文章只需要维护 sitemap 一处。 */
function defaultUrlList(): string[] {
  return sitemap().map((entry) => entry.url);
}

export async function GET() {
  return NextResponse.json({
    status: process.env.INDEXNOW_SECRET ? 'ready' : 'disabled（未设置 INDEXNOW_SECRET）',
    host: SITE_HOST,
    keyLocation: `${SITE_URL}/${KEY}.txt`,
  });
}

export async function POST(request: Request) {
  const secret = process.env.INDEXNOW_SECRET;
  if (!secret) {
    return NextResponse.json({ success: false, error: 'IndexNow 推送未启用：请先设置环境变量 INDEXNOW_SECRET' }, { status: 503 });
  }
  if (request.headers.get('x-indexnow-secret') !== secret) {
    return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const requested: unknown = body?.urlList;
    const urlList = (Array.isArray(requested) && requested.length ? requested : defaultUrlList())
      .filter((u): u is string => typeof u === 'string' && u.startsWith(`${SITE_URL}/`))
      .slice(0, MAX_URLS);

    if (urlList.length === 0) {
      return NextResponse.json({ success: false, error: 'urlList 里没有本站网址' }, { status: 400 });
    }

    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: SITE_HOST, key: KEY, keyLocation: `${SITE_URL}/${KEY}.txt`, urlList }),
    });

    // 记一条日志（托管平台的日志里能查到）：什么时候推送、返回什么状态码、推了多少个网址
    console.info('[indexnow]', JSON.stringify({ at: new Date().toISOString(), statusCode: response.status, submittedCount: urlList.length }));

    return NextResponse.json({
      success: response.ok,
      statusCode: response.status,
      submittedCount: urlList.length,
      submittedUrls: urlList,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
