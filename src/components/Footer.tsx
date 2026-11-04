import React from 'react';
import Link from 'next/link';
import { Calculator, AlertCircle, Compass, Send, Code2, Mail } from 'lucide-react';
import { SITE_HOST, SITE_NAME, SOCIAL_LINKS } from '@/data/site';

export function Footer() {
  return (
    <footer className="border-t border-pink-500/20 bg-[#0F172A] text-slate-300">
      {/* Top Banner / Mission */}
      <div className="border-b border-white/10 bg-[#0B0F19] py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center space-x-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#7C3AED] text-white text-xs font-bold">
                  🌸
                </span>
                <span className="font-semibold text-white tracking-wide text-sm sm:text-base">
                  性价比机场 · 编辑部
                </span>
              </div>
              <p className="text-xs sm:text-sm text-pink-100/80 leading-relaxed">
                用更少的钱，选择更大的世界。只按<strong>实际付款、流量额度、倍率和续费价格</strong>衡量套餐性价比。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/calculator"
                className="inline-flex items-center rounded-xl bg-gradient-to-r from-[#F472B6] to-[#DB2777] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-pink-500/20 hover:opacity-95 transition-all"
              >
                <Calculator className="mr-1.5 h-4 w-4" />
                套餐真实成本计算器
              </Link>
              <Link
                href="/guide"
                className="inline-flex items-center rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition-colors"
              >
                <Compass className="mr-1.5 h-4 w-4 text-pink-300" />
                新手使用指南
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Identity */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-400">
                <svg viewBox="0 0 40 40" className="h-5 w-5" fill="currentColor">
                  <path d="M6 10h28v2.5H6z" />
                  <path d="M4 7.5c6 1.8 26 1.8 32 0l.5 2.5c-7 1.8-26 1.8-33 0z" />
                  <rect x="11" y="10" width="3.2" height="23" rx="0.5" />
                  <rect x="25.8" y="10" width="3.2" height="23" rx="0.5" />
                  <path d="M8.5 16h23v2.2H8.5z" />
                </svg>
              </div>
              <span className="whitespace-nowrap text-base font-bold text-white tracking-tight">
                性价比机场
              </span>
              <span className="rounded bg-pink-500/20 px-1.5 py-0.5 text-[11px] text-pink-300 border border-pink-500/30">
                .blog
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              高性价比机场推荐、便宜机场与套餐价格对比。不盲目追求低价，只求每一分钱花得值。
            </p>
            {/* 联系邮箱：纠错、合作都走这里 */}
            <a
              href={`mailto:${SOCIAL_LINKS.email}`}
              className="inline-flex min-h-8 items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-pink-400" />
              <span className="break-all">{SOCIAL_LINKS.email}</span>
            </a>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-[12px] text-slate-300 space-y-1">
              <div className="flex items-center text-pink-300 font-medium">
                <AlertCircle className="mr-1.5 h-3.5 w-3.5 text-pink-400" />
                合规声明与赞助披露
              </div>
              <p>
                本站部分品牌链接包含推广（邀请）参数，已标记为 sponsored nofollow noopener；通过链接注册或购买，本站可能获得佣金。品牌资料均为公开资料整理，价格与规则请以官网当前页面为准。
              </p>
            </div>
          </div>

          {/* Col 2: Core Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-pink-200 uppercase tracking-wider">
              核心测算工具与表格
            </h4>
            <ul className="space-y-0 text-xs">
              <li>
                <Link
                  href="/pianyi-jichang"
                  className="text-slate-300 hover:text-white transition-colors flex items-center py-1.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-400 mr-2"></span>
                  便宜机场推荐（按月付、每 GB、年付价格排序）
                </Link>
              </li>
              <li>
                <Link
                  href="/jichang-youhui"
                  className="text-slate-300 hover:text-white transition-colors flex items-center py-1.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-400 mr-2"></span>
                  机场优惠汇总（年付折扣、小包与限时套餐）
                </Link>
              </li>
              <li>
                <Link
                  href="/#comparison-table"
                  className="text-slate-300 hover:text-white transition-colors flex items-center py-1.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-400 mr-2"></span>
                  机场套餐多维比较表（支持动态排序）
                </Link>
              </li>
              <li>
                <Link
                  href="/calculator"
                  className="text-slate-300 hover:text-white transition-colors flex items-center py-1.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-400 mr-2"></span>
                  套餐真实每 GB 成本计算器
                </Link>
              </li>
              <li>
                <Link
                  href="/brands"
                  className="text-slate-300 hover:text-white transition-colors flex items-center py-1.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-400 mr-2"></span>
                  编辑推荐品牌资料库（灵动云/暮光加速等）
                </Link>
              </li>
              <li>
                <Link
                  href="/guide"
                  className="text-slate-300 hover:text-white transition-colors flex items-center py-1.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-400 mr-2"></span>
                  新手入门教程（Clash / Sing-box 导入）
                </Link>
              </li>
              <li>
                <Link
                  href="/routes"
                  className="text-slate-300 hover:text-white transition-colors flex items-center py-1.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-400 mr-2"></span>
                  节点线路全解析（IEPL/IPLC 专线科普）
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Original Articles */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-pink-200 uppercase tracking-wider">
              原创深度知识专栏
            </h4>
            <ul className="space-y-0 text-xs">
              <li>
                <Link
                  href="/blog/airport-plan-price-comparison"
                  className="text-slate-300 hover:text-white transition-colors line-clamp-1 py-1.5"
                >
                  机场套餐价格怎么比？月付、年付同口径对比
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/traffic-multiplier"
                  className="text-slate-300 hover:text-white transition-colors line-clamp-1 py-1.5"
                >
                  机场流量倍率怎么算？有效额度与每 GB 成本
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/renewal-cost"
                  className="text-slate-300 hover:text-white transition-colors line-clamp-1 py-1.5"
                >
                  机场续费价与优惠怎么算？实际付款与条件
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/100gb-traffic-guide"
                  className="text-slate-300 hover:text-white transition-colors line-clamp-1 py-1.5"
                >
                  100GB 机场流量够用吗？七天记录法估算
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/budget-guide-10-to-50-cny"
                  className="text-slate-300 hover:text-white transition-colors line-clamp-1 py-1.5"
                >
                  10 元到 50 元机场预算指南
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/first-purchase-guide"
                  className="text-slate-300 hover:text-white transition-colors line-clamp-1 py-1.5"
                >
                  第一次买便宜机场要核对什么？购买前清单
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/value-ranking-guide"
                  className="text-slate-300 hover:text-white transition-colors line-clamp-1 py-1.5"
                >
                  机场性价比排行榜怎么看？口径不同第一名不同
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Transparency & SEO */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-pink-200 uppercase tracking-wider">
              透明度与 SEO 规范
            </h4>
            <ul className="space-y-0 text-xs">
              <li>
                <Link href="/disclosure" className="inline-block py-1.5 text-slate-300 hover:text-white transition-colors">
                  推广合作与资料说明
                </Link>
              </li>
              <li>
                <Link href="/about" className="inline-block py-1.5 text-slate-300 hover:text-white transition-colors">
                  关于性价比机场
                </Link>
              </li>
              <li>
                {/* 这两个不是页面，用普通 <a>，不走客户端路由 */}
                <a href="/sitemap.xml" className="inline-block py-1.5 text-slate-300 hover:text-white transition-colors">
                  Sitemap 网站地图 (XML)
                </a>
              </li>
              <li>
                <a href="/robots.txt" className="inline-block py-1.5 text-slate-300 hover:text-white transition-colors">
                  Robots 爬虫协议规范
                </a>
              </li>
              <li className="pt-2 border-t border-white/10">
                <Link href="/me" className="inline-block py-1.5 text-slate-300 hover:text-white transition-colors">
                  个人中心（收藏 / 对比 / 偏好 / 阅读记录，仅保存在本浏览器）
                </Link>
              </li>
              <li className="flex flex-wrap gap-2 pt-1">
                <a
                  href={SOCIAL_LINKS.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-8 items-center gap-1 rounded-lg bg-white/10 px-2.5 text-[12px] font-semibold text-slate-200 hover:bg-pink-500/20 hover:text-white transition-colors"
                  aria-label="Telegram 群组（新窗口打开）"
                >
                  <Send className="h-3.5 w-3.5" /> Telegram 群组
                </a>
                {/* GitHub 地址为空时不显示入口，不放占位文字 */}
                {SOCIAL_LINKS.github && (
                  <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center gap-1 rounded-lg bg-white/10 px-2.5 text-[12px] font-semibold text-slate-200 hover:bg-pink-500/20 hover:text-white transition-colors" aria-label="GitHub 仓库（新窗口打开）">
                    <Code2 className="h-3.5 w-3.5" /> GitHub
                  </a>
                )}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            © 2026 {SITE_NAME} ({SITE_HOST}) · 保留所有权利
          </div>
          <div className="text-[12px] text-slate-400 text-center sm:text-right">
            内容整理自公开资料，购买前请以品牌官网当前页面为准 · 所有建议仅供理性选购参考
          </div>
        </div>
      </div>
    </footer>
  );
}
