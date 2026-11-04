import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PLANS } from '@/data/plans';
import { FEATURED_BRAND_ID } from '@/data/brands';
import { SITE_STATS, describeBrandCoverage } from '@/data/siteStats';
import { buildDirectoryEntries } from '@/data/brandDirectoryData';
import { BrandDirectory } from '@/components/BrandDirectory';
import { FeaturedBrandSection } from '@/components/FeaturedBrandSection';
import { UserFitSection } from '@/components/UserFitSection';
import { ARTICLES } from '@/data/articles';
import { FAQS } from '@/data/faqs';
import { HeroIllustration } from '@/components/HeroIllustration';
import { SakuraPetals } from '@/components/SakuraPetals';
import { AdvantagesBar } from '@/components/AdvantagesBar';
import { ArticleCard } from '@/components/ArticleCard';
import { HomeInteractiveSection } from '@/components/HomeInteractiveSection';
import { FAQAccordion } from '@/components/FAQAccordion';
import { ArrowRight, HelpCircle, Calculator, BookOpen, Info } from 'lucide-react';
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, absoluteUrl } from '@/data/site';
import { current, fmtPercent, rankBestPerGB, rankCheapestYearly, rankEntryMonthly, rankYearlyDiscounts, spotlightEntryMonthly, yearlyMiniPacks } from '@/data/cheapRankings';
import { fmtPerGB, fmtYuan } from '@/data/priceStats';

// 首页两个专题入口上的数字（只取当前资料，不含历史资料品牌）
const cheapestEntry = current(rankEntryMonthly())[0];
const cheapestPerGB = current(rankBestPerGB())[0];
const cheapestYearly = current(rankCheapestYearly())[0];
const bestYearlyDiscount = current(rankYearlyDiscounts())[0];
const yearlyPacks = yearlyMiniPacks(120);
// 首屏价格条：站长指定的“本站重点”品牌，按入门月付从低到高算（同价按指定顺序），见 data/cheapRankings.ts
const spotlight = spotlightEntryMonthly();

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: absoluteUrl('/') },
  // 这里的 openGraph 会整体覆盖 layout 里的，所以 siteName / locale / images 要再写一遍
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: SITE_NAME,
    url: absoluteUrl('/'),
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function HomePage() {
  // 首页品牌目录：全部收录品牌，默认拼音顺序（目录组件内可切换价格排序）
  const directoryEntries = buildDirectoryEntries();
  const dataDateRange =
    SITE_STATS.earliestDataDate === SITE_STATS.latestDataDate
      ? SITE_STATS.latestDataDate
      : `${SITE_STATS.earliestDataDate} 至 ${SITE_STATS.latestDataDate}`;
  // 首页展示最新 6 篇文章（新增的六篇主题文章），保证每一篇都能从首页一步到达
  const featuredArticles = ARTICLES.slice(0, 6);
  // 其余文章在六张卡片下面以文字链接列出，首页一步就能到达每一篇
  const moreArticles = ARTICLES.slice(6);

  return (
    <div className="min-h-screen bg-[#FFF9FD] text-[#0F172A] selection:bg-[#F9A8D4] selection:text-[#0F172A]">
      {/* 首屏：日系樱花画境（点击画面切换） */}
      <section className="relative min-h-[520px] sm:min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-hidden bg-[#0F172A] pt-12 pb-24 sm:pb-28">
                <HeroIllustration />

        {/* 飘落的樱花瓣 */}
        <SakuraPetals />

        {/* 首屏文字与按钮。整块 pointer-events-none，让点击能穿过文字空白处落到大图上（点击画面切换画境），按钮单独恢复可点 */}
        <div className="rise-stagger pointer-events-none relative z-20 mx-auto max-w-4xl px-4 text-center space-y-5 sm:space-y-6">
          {/* 题记 */}
          <p className="text-xs sm:text-sm md:text-base font-serif tracking-widest text-pink-100 text-balance [text-shadow:0_1px_6px_rgba(15,23,42,0.8)]">
            性价比机场，让每一份预算都花在实用的网络体验上
          </p>

          {/* 主标题 H1 */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-md text-balance">
            {/* 两段各自整体换行，避免“34”和“家”被拆到两行；渐变直接放在各段上，窄屏内部折行时也能正常显示 */}
            {/* 纯白实色字，不用渐变镂空：渐变文字在深色大图上发虚，实色更清楚 */}
            <span className="inline-block text-white">性价比机场推荐 2026：</span>
            <span className="inline-block text-white">{SITE_STATS.brandCount} 家机场套餐价格对比与便宜机场选购指南</span>
          </h1>

          {/* 副标题 */}
          <p className="text-sm sm:text-lg md:text-xl font-semibold text-white tracking-wide max-w-xl mx-auto text-balance [text-shadow:0_2px_8px_rgba(15,23,42,0.75)]">
            按实际付款、付款周期、流量规则和使用限制比较，选择适合自己的网络。
          </p>

          {/* 四个标签 */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-1">
            <span className="inline-flex min-h-9 items-center rounded-full bg-[#0F172A]/45 backdrop-blur-md border border-white/30 px-3.5 py-1.5 text-[13px] font-semibold tracking-wide text-white [text-shadow:0_1px_3px_rgba(15,23,42,0.6)]">
              🌸 套餐价格对比
            </span>
            <span className="inline-flex min-h-9 items-center rounded-full bg-[#0F172A]/45 backdrop-blur-md border border-white/30 px-3.5 py-1.5 text-[13px] font-semibold tracking-wide text-white [text-shadow:0_1px_3px_rgba(15,23,42,0.6)]">
              🌸 流量成本计算
            </span>
            <span className="inline-flex min-h-9 items-center rounded-full bg-[#0F172A]/45 backdrop-blur-md border border-white/30 px-3.5 py-1.5 text-[13px] font-semibold tracking-wide text-white [text-shadow:0_1px_3px_rgba(15,23,42,0.6)]">
              🌸 新手选购指南
            </span>
            <span className="inline-flex min-h-9 items-center rounded-full bg-[#0F172A]/45 backdrop-blur-md border border-white/30 px-3.5 py-1.5 text-[13px] font-semibold tracking-wide text-white [text-shadow:0_1px_3px_rgba(15,23,42,0.6)]">
              🌸 {SITE_STATS.brandCount} 家品牌资料
            </span>
          </div>

          {/* 价格速览：首屏直接看到“本站重点”品牌的入门月付。顺序不是手写的：按入门月付从低到高算，同价按指定顺序。整行不拦截点击，只有链接本身可点 */}
          {/* 深色半透明底板：白字直接压在亮色大图上读不清，加底板后对比度足够 */}
          <div className="pointer-events-none mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-0.5 rounded-2xl border border-white/20 bg-[#0F172A]/65 px-4 py-2.5 text-[13px] text-white backdrop-blur-md">
            <span className="basis-full text-center text-[12px] font-semibold text-white/90">
              本站重点 {spotlight.length} 家 · 入门月付从低到高（同价按本站顺序）
            </span>
            {spotlight.map((p) => (
              <Link key={p.brandId} href={`/brands/${p.brandSlug}`} className="pointer-events-auto inline-flex min-h-8 items-center hover:underline">
                {p.brandName}
                <strong className="ml-1.5 text-base font-black text-pink-200">{fmtYuan(p.price)}</strong>
                {p.monthlyGB !== null && <span className="ml-1 text-white/80">{p.monthlyGB}GB</span>}
              </Link>
            ))}
            <span className="basis-full text-center text-[12px] text-white/90">
              价格表资料日 {dataDateRange}，待核验，以官网为准 ·{' '}
              <Link href="/pianyi-jichang" className="pointer-events-auto font-semibold underline">
                看全部 {SITE_STATS.brandCount} 家价格榜单
              </Link>
            </span>
          </div>

          {/* 行动按钮 */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
            <a
              href="#fit"
              className="btn-sheen pointer-events-auto inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#F472B6] via-[#EC4899] to-[#DB2777] px-6 sm:px-8 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-105 active:scale-95 transition-all"
            >
              <span>按使用需求找机场</span>
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </a>
            <a
              href="#brands"
              className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/30 px-6 sm:px-8 py-3 text-xs sm:text-sm font-semibold text-white shadow-md hover:border-pink-300 hover:scale-105 active:scale-95 transition-all"
            >
              <span>{SITE_STATS.brandCount} 家机场目录</span>
            </a>
          </div>
        </div>
      </section>

      {/* 四项优势：浮在首屏下沿 */}
      <AdvantagesBar />

      {/* 正文区域 */}
      <div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8 xl:px-10 pt-10 sm:pt-14 pb-20">
        <div className="space-y-14">
          {/* 1. 本站优选（灵动云）：适用条件 → 依据 → 限制 → 入口，排在最前但只占一块 */}
          <FeaturedBrandSection />

          {/* 1.5 两个专题入口：便宜机场榜单、机场优惠汇总（数字都由价格表实时计算） */}
          <section aria-label="便宜机场与机场优惠专题" className="grid gap-4 md:grid-cols-2">
            <Link
              href="/pianyi-jichang"
              className="reveal group rounded-2xl border border-pink-100/90 bg-white p-5 shadow-xs hover:border-pink-300 hover:shadow-md transition-all"
            >
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#7C3AED]">专题 · 便宜机场</span>
              <h2 className="mt-1 text-lg font-bold text-[#0F172A] group-hover:text-[#7C3AED] transition-colors">
                便宜机场推荐：{SITE_STATS.brandCount} 家按价格从低到高排
              </h2>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                入门月付最低 {fmtYuan(cheapestEntry.price)}（{cheapestEntry.brandName}）、每 GB 最低 {fmtPerGB(cheapestPerGB.perGB)}（{cheapestPerGB.brandName}）、年付最低 {fmtYuan(cheapestYearly.price)}（{cheapestYearly.brandName}）。三种口径分别排名，不混在一起。
              </p>
              <span className="mt-2 inline-flex items-center text-xs font-semibold text-[#7C3AED]">
                看便宜机场榜单 <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </span>
            </Link>
            <Link
              href="/jichang-youhui"
              className="reveal group rounded-2xl border border-pink-100/90 bg-white p-5 shadow-xs hover:border-pink-300 hover:shadow-md transition-all"
            >
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#7C3AED]">专题 · 机场优惠</span>
              <h2 className="mt-1 text-lg font-bold text-[#0F172A] group-hover:text-[#7C3AED] transition-colors">
                机场优惠码与优惠汇总：优惠码、年付折扣与年付小包
              </h2>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                各家机场优惠码一页看完（站长说明：8 折、一次性；未逐项核验，以官网结算页为准）；年付较月付最多省 {fmtPercent(bestYearlyDiscount.saved)}（{bestYearlyDiscount.brandName}），¥120 以内的年付小包 {yearlyPacks.length} 个，由价格表计算。
              </p>
              <span className="mt-2 inline-flex items-center text-xs font-semibold text-[#7C3AED]">
                看机场优惠码与优惠汇总 <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </span>
            </Link>
          </section>

          {/* 2. 核心板块：什么样的用户适合什么价位的机场（优选品牌每组第一，其余按价格表实时排序） */}
          <UserFitSection />

          {/* 3. 全部品牌目录：名称全部默认可见，链接到资料页 */}
          <section id="brands" className="space-y-4 scroll-mt-20">
            <div className="flex items-center justify-between pb-2 border-b border-pink-100">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] flex items-center">
                  <span className="mr-2">🌸</span>
                  <span>{SITE_STATS.brandCount} 家机场品牌目录</span>
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {describeBrandCoverage()}，共 {SITE_STATS.planSchemeCount} 个套餐方案 / {SITE_STATS.priceOptionCount} 个价格选项。默认为本站推荐顺序（不是价格排名），可筛选或切换价格排序。
                </p>
              </div>
              <Link
                href="/brands"
                className="ml-3 inline-flex min-h-9 shrink-0 items-center whitespace-nowrap text-xs font-semibold text-[#7C3AED] hover:text-[#EC4899] transition-colors"
              >
                <span>品牌资料库</span>
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </div>
            <BrandDirectory entries={directoryEntries} dataDateRange={dataDateRange} pinnedId={FEATURED_BRAND_ID} />
          </section>

          {/* 4. 预算选择 + 套餐对比表 */}
          <HomeInteractiveSection plans={PLANS} />

          {/* 5. 选购判断文章 */}
          <section id="blog" className="space-y-4 scroll-mt-20">
            <div className="flex items-center justify-between pb-2 border-b border-pink-100">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] flex items-center">
                  <span className="mr-2">🌸</span>
                  <span>选购判断：价格、倍率、续费与流量用量</span>
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  六篇文章各答一个问题：价格怎么比、倍率怎么扣、续费怎么算、100GB 够不够、第一次买查什么、排名怎么看。
                </p>
              </div>
              <Link
                href="/blog"
                className="ml-3 inline-flex min-h-9 shrink-0 items-center whitespace-nowrap text-xs font-semibold text-[#7C3AED] hover:text-[#EC4899] transition-colors"
              >
                <span>全部文章</span>
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {featuredArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
            {moreArticles.length > 0 && (
              <div className="rounded-2xl border border-pink-100/90 bg-white p-4 sm:p-5 shadow-xs">
                <h3 className="text-sm font-bold text-[#0F172A]">更多文章</h3>
                <ul className="mt-2 grid gap-x-8 gap-y-0.5 sm:grid-cols-2">
                  {moreArticles.map((article) => (
                    <li key={article.slug}>
                      <Link
                        href={`/blog/${article.slug}`}
                        className="flex min-h-9 items-center text-xs sm:text-sm text-[#7C3AED] hover:underline"
                      >
                        {article.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* 6. 计算器入口（保留 #calculator 锚点，旧链接仍可到达） */}
          <section id="calculator" className="scroll-mt-20">
            <div className="reveal flex flex-col gap-4 rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-5 sm:p-7 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1.5">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#0F172A] flex items-center">
                  <Calculator className="mr-2 h-5 w-5 text-[#7C3AED]" />
                  <span>每 GB 成本计算器：按倍率和实际用量算单价</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                  输入周期费用、标称流量、倍率和每月实际用量，算出可用额度、每 GB 单价和按实际用量折算的单价。
                </p>
              </div>
              <Link
                href="/calculator"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#7C3AED] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#6D28D9] transition-colors"
              >
                <span>打开计算器</span>
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </div>
          </section>

          {/* 常见问题 */}
          <section id="faq" className="space-y-4 scroll-mt-20">
            <div className="pb-2 border-b border-pink-100">
              <div className="inline-flex items-center space-x-1.5 rounded-full bg-pink-100 px-3 py-0.5 text-xs font-semibold text-[#7C3AED] mb-1.5">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>热点疑问解答</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
                常见问题与避坑解答（FAQ）
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                倍率、晚高峰、年付风险、解锁判断和推广链接：新手最常问的几件事。
              </p>
            </div>

            <FAQAccordion faqs={FAQS} />
          </section>

          {/* 7. 方法与站点信息 */}
          <section id="about-site" className="scroll-mt-20 grid gap-5 md:grid-cols-2">
            <div className="reveal rounded-2xl border border-pink-100/90 bg-white p-5 sm:p-6 shadow-xs space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#0F172A] flex items-center">
                <BookOpen className="mr-2 h-4.5 w-4.5 text-[#7C3AED]" />
                <span>本站怎么比价</span>
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm leading-relaxed text-slate-600">
                <li>只比价格表能算出来的事实：实际付款、付款周期、流量、折算单价；不写评分、销量和用户评价。测速只有灵动云资料页里站长的一次记录。</li>
                <li>“入门月付”是每家实付最低的月付档；长周期套餐标注“一次付清”，折合月价只作参考。</li>
                <li>资料没标注倍率、设备数的，按 1 倍率计算并标明“未标注”；写明的按资料显示。</li>
                <li>价格为公开资料整理（资料日 {dataDateRange}），未在官网结算页逐项核验，购买前以官网为准。</li>
              </ul>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link href="/about" className="inline-flex min-h-8 items-center text-xs font-semibold text-[#7C3AED] hover:underline">关于本站</Link>
                <span aria-hidden="true" className="self-center text-slate-400">·</span>
                <Link href="/disclosure" className="inline-flex min-h-8 items-center text-xs font-semibold text-[#7C3AED] hover:underline">推广合作与资料说明</Link>
                <span aria-hidden="true" className="self-center text-slate-400">·</span>
                <Link href="/guide" className="inline-flex min-h-8 items-center text-xs font-semibold text-[#7C3AED] hover:underline">新手使用指南</Link>
              </div>
            </div>
            <div className="reveal rounded-2xl border border-pink-100/90 bg-white p-5 sm:p-6 shadow-xs space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#0F172A] flex items-center">
                <Info className="mr-2 h-4.5 w-4.5 text-[#7C3AED]" />
                <span>关于性价比机场</span>
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                性价比机场整理机场订阅套餐的价格、流量与续费信息，帮注重预算的用户在同一口径下比较。首页顺序：优选品牌 → 按用户类型选套餐 → 全部目录 → 套餐对比 → 选购文章 → 计算器 → 常见问题；每个品牌名都链接到资料页，页内有价格位次和购买前核对清单。
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
