import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Next 默认把 Bingbot / BingPreview 当作“不能流式输出元数据”的爬虫：每次现场渲染、不缓存，响应体积大 2–4 倍。
  // 本站每个页面的标题、描述、canonical 都是构建时写好的静态内容（已核对都在 <head> 里），所以让 Bing 和普通浏览器、
  // Googlebot 一样走静态缓存版本。下面是 Next 的默认名单去掉 Bingbot 与 BingPreview，其余爬虫保持不变。
  // 注意：以后如果某个页面的 metadata 要靠运行时数据生成，要把 Bingbot|BingPreview 加回这个名单。
  htmlLimitedBots:
    /[\w-]+-Google|Google-[\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight/i,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
