import type { NextConfig } from "next";

// 本站是纯静态网站：品牌、价格表、文章的数据全写在代码里，页面都在构建时生成，所以直接导出成静态文件（out/ 目录），
// 放到 Cloudflare Pages 这类静态托管上就行，不需要服务器。
// - 静态导出不能和 cacheComponents（部分预渲染）同时用，也不支持 Next 自带的图片优化，所以这里不开 cacheComponents，
//   图片用原图（public/images 里的图已经压缩过）。
// - 不存在的网址由托管平台返回 out/404.html（状态码 404）；动态路由用 generateStaticParams 列出全部页面，并设 dynamicParams = false。
// - 本机预览导出结果：npm run build，再 npm run start（start 会用 scripts/serve-out.mjs 起一个静态服务器）。
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
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
