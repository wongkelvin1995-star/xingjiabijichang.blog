import { MetadataRoute } from 'next';
import { SITE_URL, absoluteUrl } from '@/data/site';

// 静态导出（部署到 Cloudflare Pages）要求元数据路由明确标成静态；服务器模式下它本来就是静态的
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
      // 指定了 Bingbot / Googlebot 的分组会完全取代 * 分组，所以这里也要重复 /api/ 的限制
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_URL,
  };
}
