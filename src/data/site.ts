import { SITE_STATS } from './siteStats';

/**
 * 站点级常量。域名、站点名称、默认标题与描述都集中在这里，页面里不要再手写域名。
 * 将来换域名，只需要改 SITE_URL 和 SITE_HOST 两处。
 */
export const SITE_URL = 'https://xingjiabijichang.blog';
export const SITE_HOST = 'xingjiabijichang.blog';
export const SITE_NAME = '性价比机场';

/** 首页与全站默认的标题、描述（各内页会用自己的标题覆盖）。 */
export const SITE_TITLE = `性价比机场推荐 2026：${SITE_STATS.brandCount} 家机场套餐价格对比与便宜机场选购指南`;
export const SITE_DESCRIPTION = `性价比机场推荐：整理 ${SITE_STATS.brandCount} 家机场、${SITE_STATS.priceOptionCount} 个价格选项，按预算和用量选套餐；便宜机场、机场优惠看专题页。价格以官网为准。`;

/**
 * 非文章页面默认的分享图（og:image / twitter:image），1200×630 JPG，由 public/images/og-default.jpg 提供；
 * 文章页用各自的封面。注意：页面自己写了 openGraph 的话整个对象会覆盖 layout 的，要把 images 再写一遍。
 */
export const DEFAULT_OG_IMAGE = {
  url: '/images/og-default.jpg',
  width: 1200,
  height: 630,
  alt: '性价比机场：樱花树下的红色鸟居与石灯笼，远处是富士山与弯月',
};

/** 拼出站内页面的完整网址，例如 absoluteUrl('/blog')。 */
export function absoluteUrl(path = '/'): string {
  return `${SITE_URL}${path}`;
}

/**
 * 站长的联系 / 社区入口（顶部导航与页脚用）。
 * - telegram：Telegram 群组邀请链接。
 * - github：仓库地址；为空字符串时页面不显示 GitHub 入口（站长上传后再填）。
 * - email：公开的联系邮箱（页脚、关于页的纠错入口、站点结构化数据里都会出现）。
 */
export const SOCIAL_LINKS = {
  telegram: 'https://t.me/+FvH3BCI6Hl0wY2Q1',
  github: '',
  email: 'wongkelvin1995@gmail.com',
} as const;
