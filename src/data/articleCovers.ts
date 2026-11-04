import type { Article } from '@/types';

/**
 * 文章封面（卡片用，16:9，WebP，统一 1200×675、200KB 以内）。
 * - 每篇文章一张封面，alt 文字按画面实际内容书写；第一批文章的封面是从站内原有插画转成的 WebP
 *   （原来的 1MB JPG 和 500 像素宽的横幅图不再直接用作封面）。
 * - 想换封面：把同名文件放进 public/images/articles/covers/ 覆盖即可（保持 16:9），
 *   换了画面的话请同步修改下面的 alt。
 * - 这里不记录任何浏览量/阅读数：没有真实统计来源的数字一律不展示。
 */
export interface ArticleCover {
  src: string;
  /** 画面描述；缺省时用「文章标题 + 封面插画」 */
  alt?: string;
  /** 卡片左上角的小标签 */
  tag: string;
  width?: number;
  height?: number;
}

const DIR = '/images/articles/covers/';

export const ARTICLE_COVERS: Record<string, ArticleCover> = {
  // —— 新增六篇 ——
  'airport-plan-price-comparison': {
    src: `${DIR}plan-price-lantern-street.webp`,
    alt: '夜幕下樱花与垂柳环绕的日本河畔老街，石板路旁亮着暖色灯笼，小桥倒映在河面',
    tag: '套餐价格',
    width: 1200,
    height: 675,
  },
  'traffic-multiplier': {
    src: `${DIR}traffic-multiplier-fuji-orbits.webp`,
    alt: '月夜下的富士山与五重塔，樱花环绕，夜空中圆形光轨与光点连成网络',
    tag: '流量倍率',
    width: 1200,
    height: 675,
  },
  'renewal-cost': {
    src: `${DIR}renewal-sakura-bridge-sunset.webp`,
    alt: '落日映照下的樱花石拱桥，河畔木屋挂着灯笼，远处山丘上有一座宝塔',
    tag: '优惠续费',
    width: 1200,
    height: 675,
  },
  '100gb-traffic-guide': {
    src: `${DIR}100gb-tokyo-night-network.webp`,
    alt: '樱花水岸后方的东京夜景，东京塔与高楼林立，新干线驶过高架桥，夜空浮现世界地图与数据图标',
    tag: '流量预算',
    width: 1200,
    height: 675,
  },
  'first-purchase-guide': {
    src: `${DIR}first-purchase-shrine-sakura.webp`,
    alt: '樱花树下的红色鸟居与石灯笼，远处是富士山与新月',
    tag: '新手购买',
    width: 1200,
    height: 675,
  },
  'value-ranking-guide': {
    src: `${DIR}ranking-fuji-lake.webp`,
    alt: '黄昏的富士山与平静湖面，红色鸟居立在水中，樱花枝伸向画面，对岸亮着灯火',
    tag: '榜单解读',
    width: 1200,
    height: 675,
  },

  // —— 第一批文章：站内原有插画转成的 WebP ——
  'top-cost-effective-airports-in-depth-comparison-2026': {
    src: `${DIR}comparison-torii-fuji-sunset-orbits.webp`,
    alt: '粉紫色晚霞下的湖畔鸟居与富士山，夜空中有发光的轨道光环，岸边石灯笼亮着，远处村落灯火点点',
    tag: '深度横评',
    width: 1200,
    height: 675,
  },
  'lingdongyun-review-and-cost-analysis-2026': {
    src: `${DIR}lingdongyun-torii-fuji-dusk.webp`,
    alt: '紫色暮光中的湖中鸟居，远处是富士山与宝塔，樱花花瓣飘落，岸边立着石灯笼',
    tag: '品牌评测',
    width: 1200,
    height: 675,
  },
  'how-to-choose-cost-effective-airport-2026': {
    src: `${DIR}choose-shrine-sakura-fuji.webp`,
    alt: '樱花树下的红色鸟居与石灯笼，远处是雪顶富士山与弯月，天边是粉紫色的晚霞',
    tag: '选购指南',
    width: 1200,
    height: 675,
  },
  'monthly-vs-yearly-vs-pay-as-you-go': {
    src: `${DIR}monthly-yearly-canal-town-dusk.webp`,
    alt: '黄昏的日本水乡，石拱桥横跨运河，两岸木屋挂着灯笼，柳树与樱花倒映在水面，天上一弯新月',
    tag: '套餐对比',
    width: 1200,
    height: 675,
  },
  'budget-guide-10-to-50-cny': {
    src: `${DIR}budget-lake-torii-lanterns.webp`,
    alt: '暮色湖面上的红色鸟居，水面漂着许多发光的水灯，远处是青山与岸边的灯火，樱花枝从画面两侧伸出',
    tag: '预算选购',
    width: 1200,
    height: 675,
  },
  'iepl-iplc-relay-direct-line-guide': {
    src: `${DIR}lines-torii-fuji-night-orbits.webp`,
    alt: '深蓝夜色中的湖中鸟居与雪顶富士山，夜空中有发光的轨道光环，湖面映着岸边灯火',
    tag: '线路科普',
    width: 1200,
    height: 675,
  },
  'nodes-for-chatgpt-youtube-streaming': {
    src: `${DIR}nodes-tokyo-night-world-map.webp`,
    alt: '樱花水岸后的东京夜景，东京塔与高楼林立，新干线驶过拱桥，夜空中浮现世界地图与数据图标，远处是富士山',
    tag: '应用场景',
    width: 1200,
    height: 675,
  },
  'speed-test-latency-stability-guide': {
    src: `${DIR}speedtest-sakura-town-bridge-sunset.webp`,
    alt: '落日下的樱花古镇，石拱桥横跨河面，两岸木屋挂着灯笼，远处山上有五重塔，天空有发光的轨道光环',
    tag: '测速方法',
    width: 1200,
    height: 675,
  },
};

export function getArticleCover(article: Pick<Article, 'slug' | 'title' | 'category'>): Required<Pick<ArticleCover, 'src' | 'alt' | 'tag'>> &
  Pick<ArticleCover, 'width' | 'height'> {
  const hit = ARTICLE_COVERS[article.slug];
  return {
    src: hit?.src ?? `${DIR}choose-shrine-sakura-fuji.webp`,
    alt: hit?.alt ?? `${article.title} 封面插画`,
    tag: hit?.tag ?? article.category,
    width: hit?.width,
    height: hit?.height,
  };
}
