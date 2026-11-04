import { MetadataRoute } from 'next';
import { ARTICLES } from '@/data/articles';
import { BRANDS, isBrandIndexable } from '@/data/brands';
import { getSheetStats } from '@/data/priceStats';
import { SITE_STATS } from '@/data/siteStats';
import { SITE_URL, absoluteUrl } from '@/data/site';

// lastmod 只使用内容里记录的真实日期（YYYY-MM-DD），不用 new Date()：
// 每次构建都变化的 lastmod 会让搜索引擎逐渐不再信任这个字段。
// - 首页、文章目录：跟着最新一篇文章的修改日期走（它们列出文章；首页同时取价格资料日里较晚的一个）。
// - 品牌目录、品牌页：跟着价格资料日期走（品牌页内容全部由价格表生成）。
// - 其余静态页：文案有实质修改时，手工改 STATIC_PAGES_UPDATED。
const latestArticleDay = ARTICLES.map((a) => a.modifiedDate).sort().pop() ?? '2026-11-02';
const latestPriceDay = SITE_STATS.latestDataDate || latestArticleDay;
const STATIC_PAGES_UPDATED = '2026-11-03';

export default function sitemap(): MetadataRoute.Sitemap {
  const homeDay = [latestArticleDay, latestPriceDay].sort().pop() ?? latestArticleDay;

  // 静态页面
  const staticRoutes: MetadataRoute.Sitemap = [
    // 首页 URL 与 <link rel="canonical"> 保持一致（Next 输出的首页 canonical 不带末尾斜杠）
    { url: SITE_URL, lastModified: homeDay, changeFrequency: 'weekly', priority: 1.0 },
    { url: absoluteUrl('/blog'), lastModified: latestArticleDay, changeFrequency: 'weekly', priority: 0.9 },
    // 两个专题页：内容全部由价格表实时计算，日期跟价格资料日走
    { url: absoluteUrl('/pianyi-jichang'), lastModified: latestPriceDay, changeFrequency: 'weekly', priority: 0.9 },
    { url: absoluteUrl('/jichang-youhui'), lastModified: latestPriceDay, changeFrequency: 'weekly', priority: 0.9 },
    { url: absoluteUrl('/calculator'), lastModified: STATIC_PAGES_UPDATED, changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteUrl('/brands'), lastModified: latestPriceDay, changeFrequency: 'weekly', priority: 0.8 },
    { url: absoluteUrl('/guide'), lastModified: STATIC_PAGES_UPDATED, changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl('/routes'), lastModified: STATIC_PAGES_UPDATED, changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl('/disclosure'), lastModified: STATIC_PAGES_UPDATED, changeFrequency: 'monthly', priority: 0.5 },
    { url: absoluteUrl('/about'), lastModified: STATIC_PAGES_UPDATED, changeFrequency: 'monthly', priority: 0.5 },
  ];

  // 文章
  const articleRoutes: MetadataRoute.Sitemap = ARTICLES.map((article) => ({
    url: absoluteUrl(`/blog/${article.slug}`),
    lastModified: article.modifiedDate,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // 品牌页：只提交允许收录的品牌（其余品牌页是 noindex，不能放进 sitemap）；日期用该品牌的价格资料日
  const brandRoutes: MetadataRoute.Sitemap = BRANDS.filter(isBrandIndexable).map((brand) => ({
    url: absoluteUrl(`/brands/${brand.slug}`),
    lastModified: getSheetStats(brand.id)?.dataDate ?? latestPriceDay,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...articleRoutes, ...brandRoutes];
}
