import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  FEATURED_BRAND_ID,
  displayName,
  getAllBrands,
  getBrandBySlug,
  isBrandIndexable,
} from '@/data/brands';
import { getPlansByBrand } from '@/data/plans';
import { getBrandImage } from '@/data/brandImages';
import {
  RANK_METRIC_LABELS,
  describeRank,
  fmtPerGB,
  fmtYuan,
  getRank,
  getSheetStats,
  type RankInfo,
  type RankMetric,
} from '@/data/priceStats';
import { SITE_STATS } from '@/data/siteStats';
import { buildChecklist, buildFeaturedBlock, uniformDiscountLadder } from '@/data/brandFacts';
import { getBrandTest } from '@/data/brandTests';
import {
  PROMO_CODES_DATE,
  PROMO_DISCOUNT_LABEL,
  PROMO_TERMS,
  PROMO_VALIDITY_LABEL,
  getPromoCode,
} from '@/data/promoCodes';
import { CopyCodeButton } from '@/components/CopyCodeButton';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CompareToggleButton, FavoriteBrandButton } from '@/components/user/UserActions';
import { VisitRecorder } from '@/components/user/VisitRecorder';
import {
  ShieldCheck,
  ExternalLink,
  Check,
  X,
  AlertTriangle,
  Server,
  Zap,
  Calculator,
  Layers,
  ArrowLeft,
  ClipboardCheck,
  Scale,
  Activity,
} from 'lucide-react';
import { DEFAULT_OG_IMAGE, SITE_NAME, absoluteUrl } from '@/data/site';

interface Props {
  params: Promise<{ slug: string }>;
}

// 同 blog/[slug]：静态导出只生成 generateStaticParams 列出的品牌页，其余网址由托管平台返回 404。
export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllBrands().map((brand) => ({
    slug: brand.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) return { title: '品牌未找到', robots: { index: false, follow: true } };

  const indexable = isBrandIndexable(brand);

  // 品牌名以英文/数字结尾时补一个空格，避免“StarDream怎么样”连在一起
  const full = displayName(brand);
  const nm = /[A-Za-z0-9)）]$/.test(full) ? `${full} ` : full;
  const stats = getSheetStats(brand.id);

  return {
    // 标题不带站点后缀；年份只在整体不超过 32 字时才加，长英文别名的品牌页也能控制在 32 字内
    title: {
      absolute:
        `${nm}怎么样？套餐价格与购买前核对`.length <= 26
          ? `${nm}怎么样？套餐价格与购买前核对（2026）`
          : `${nm}怎么样？套餐价格与购买前核对`,
    },
    description: stats
      ? `${brand.name}套餐价格（资料日 ${stats.dataDate}）：${brand.tagline}。待核验，以官网为准。`
      : `${nm}品牌资料：套餐价格整理中，暂未收录经核实的价格；购买前请以官网当前页面为准。`,
    alternates: {
      canonical: absoluteUrl(`/brands/${brand.slug}`),
    },
    // 资料尚未补齐的品牌页先不收录，避免近似重复页面拖累整站质量判断。
    robots: indexable ? undefined : { index: false, follow: true },
    // 自己写了 openGraph 就会整体覆盖 layout 里的，所以 siteName 和默认分享图要再写一遍
    openGraph: {
      title: `${full}套餐价格与适用条件（2026）`,
      description: `${brand.name}：${brand.tagline}`,
      url: absoluteUrl(`/brands/${brand.slug}`),
      siteName: SITE_NAME,
      locale: 'zh_CN',
      type: 'website',
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

const RANK_METRICS: RankMetric[] = [
  'entryMonthlyPrice',
  'entryMonthlyPerGB',
  'cheapestYearlyPrice',
  'bestPerGB',
  'bestUnlimitedPerGB',
];

function formatRankValue(info: RankInfo): string {
  return info.metric === 'entryMonthlyPrice' || info.metric === 'cheapestYearlyPrice'
    ? fmtYuan(info.value)
    : `${fmtPerGB(info.value)}/GB`;
}

export default async function BrandDetailPage({ params }: Props) {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) notFound();

  const brandPlans = getPlansByBrand(brand.id);
  const stats = getSheetStats(brand.id);
  const isFeatured = brand.id === FEATURED_BRAND_ID;
  const featured = isFeatured ? buildFeaturedBlock(brand) : null;
  const ladder = uniformDiscountLadder(brand.id);
  const checklist = buildChecklist(brand);
  const ranks = RANK_METRICS.map((m) => getRank(brand.id, m)).filter((r): r is RankInfo => r !== null);

  // 站长测试记录（只有少数品牌有）；截图文件不在 public/ 里时只显示整理好的表格，不显示图
  const test = getBrandTest(brand.id);
  const hasTestImage = !!test && fs.existsSync(path.join(process.cwd(), 'public', test.image.src));

  // 结构化数据：网页信息（面包屑由 Breadcrumb 组件输出）。不输出 Product/aggregateRating（没有真实评分来源）。
  const pageUrl = absoluteUrl(`/brands/${brand.slug}`);
  const brandSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': pageUrl,
        url: pageUrl,
        name: `${displayName(brand)}套餐价格与适用条件`,
        description: brand.tagline,
        inLanguage: 'zh-CN',
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: absoluteUrl('/') },
        about: {
          '@type': 'Brand',
          name: brand.name,
          ...(brand.aliases && brand.aliases.length > 0 ? { alternateName: brand.aliases } : {}),
        },
      },
    ],
  };

  const buyLabel = brand.affiliateLabel || `前往${brand.name}官网注册`;
  // 站长提供的优惠码（只列码，折扣幅度和有效期没有核验）
  const promo = getPromoCode(brand.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }}
      />
      {/* 个人中心的阅读记录：纯客户端写入本浏览器，不渲染内容，不影响静态输出 */}
      <VisitRecorder kind="brand" id={brand.id} />

      {/* Top Navigation Row */}
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            { label: '品牌资料库', href: '/brands' },
            { label: `${brand.name} 详细资料` },
          ]}
        />
        <Link
          href="/brands"
          className="hidden sm:inline-flex items-center text-xs text-slate-500 hover:text-[#6955E8] transition-colors"
        >
          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
          <span>返回全部品牌列表</span>
        </Link>
      </div>

      {/* 顶部插画：纯装饰，替代文字留空 */}
      <div className="relative w-full h-44 sm:h-56 md:h-64 rounded-3xl overflow-hidden border border-pink-100 shadow-md bg-[#0F172A]">
        <Image
          src={getBrandImage(brand.id)}
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-4 left-4 sm:left-6 text-white drop-shadow-md">
          <span className="text-[11px] tracking-widest uppercase text-pink-300 font-mono">
            SAKURA · 品牌资料档案
          </span>
          <p className="text-lg sm:text-2xl font-black text-white">
            {brand.name} · 套餐资料与价格整理
          </p>
        </div>
      </div>

      {/* Brand Hero Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#9333EA] to-[#0F172A] text-white flex items-center justify-center font-black text-2xl shadow-md shadow-purple-500/20">
              {brand.name.slice(0, 1)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                  {brand.name}套餐价格与适用条件
                </h1>
                {brand.badge && (
                  <span className="rounded-lg bg-[#0F172A] px-2.5 py-0.5 text-xs font-bold text-white">
                    {brand.badge}
                  </span>
                )}
              </div>
              {brand.aliases && brand.aliases.length > 0 && (
                <p className="mt-1 text-xs text-slate-500">别名：{brand.aliases.join('、')}</p>
              )}
              <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">{brand.tagline}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FavoriteBrandButton brandId={brand.id} />
            {brand.isVerified ? (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <ShieldCheck className="mr-1.5 h-4 w-4 text-emerald-600" />
                资料已核验
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                <AlertTriangle className="mr-1.5 h-4 w-4 text-amber-600" />
                公开资料·待核验
              </span>
            )}
            {brand.isHistorical && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
                历史资料·不代表当前在售
              </span>
            )}
          </div>
        </div>

        {/* 套餐概览（由价格表现算，无评分） */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="bg-[#FFF9FD] p-3 rounded-xl border border-pink-100/60">
            <span className="text-slate-500 block text-[12px]">价格选项</span>
            <span className="text-xl font-bold text-[#7C3AED]">{stats?.optionCount ?? 0}</span>
            <span className="text-[11px] text-slate-500"> 个</span>
            <span className="block text-[11px] text-slate-500">{stats?.schemeCount ?? 0} 个套餐方案</span>
          </div>
          <div className="bg-[#F5F7FB] p-3 rounded-xl">
            <span className="text-slate-500 block text-[12px]">入门月付</span>
            <span className="text-lg font-bold text-slate-800">
              {stats?.entryMonthly ? fmtYuan(stats.entryMonthly.price) : '—'}
            </span>
            {stats?.entryMonthly && (
              <span className="block text-[11px] text-slate-500">
                {stats.entryMonthly.name} · {stats.entryMonthly.totalGB}GB
              </span>
            )}
          </div>
          <div className="bg-[#F5F7FB] p-3 rounded-xl">
            <span className="text-slate-500 block text-[12px]">最低年付</span>
            <span className="text-lg font-bold text-slate-800">
              {stats?.cheapestYearly ? fmtYuan(stats.cheapestYearly.price) : '—'}
            </span>
            {stats?.cheapestYearly && (
              <span className="block text-[11px] text-slate-500">{stats.cheapestYearly.name}</span>
            )}
          </div>
          <div className="bg-[#F5F7FB] p-3 rounded-xl">
            <span className="text-slate-500 block text-[12px]">最低标称每 GB（含全部周期）</span>
            <span className="text-lg font-bold text-slate-800">
              {brandPlans.length ? fmtPerGB(Math.min(...brandPlans.map((p) => p.nominalPerGB))) : '—'}
            </span>
          </div>
          <div className="col-span-2 bg-[#F5F7FB] p-3 rounded-xl sm:col-span-1">
            <span className="text-slate-500 block text-[12px]">价格资料日</span>
            <span className="text-lg font-bold text-slate-800">{stats?.dataDate ?? '—'}</span>
            <span className="block text-[11px] text-amber-700">{brand.isVerified ? '已核验' : '待核验'}</span>
          </div>
        </div>

        {/* Main Description */}
        <div className="pt-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">资料概要</h2>
          <p className="text-sm text-slate-700 leading-relaxed">{brand.description}</p>
        </div>

        {/* 页内导航：购买入口在页面下方，先看套餐和判断依据 */}
        <nav aria-label="页内导航" className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 text-xs">
          {[
            { href: '#conditions', label: '适用条件' },
            { href: '#ranks', label: '价格位次' },
            ...(test ? [{ href: '#test', label: '站长测试' }] : []),
            { href: '#plans', label: '套餐明细' },
            { href: '#checklist', label: '购买前核对' },
            ...(promo ? [{ href: '#promo', label: '优惠码' }] : []),
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="inline-flex items-center rounded-full border border-pink-200 bg-pink-50/60 px-3.5 py-1.5 font-semibold text-[#7C3AED] hover:bg-pink-100 hover:text-[#EC4899] transition-colors"
            >
              {item.label}
            </a>
          ))}
          <Link
            href="/#comparison-table"
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3.5 py-1.5 font-semibold text-slate-800 hover:border-pink-300 hover:bg-pink-50/40 transition-colors"
          >
            <Layers className="mr-1.5 h-3.5 w-3.5 text-[#7C3AED]" />
            <span>在比较表中对比</span>
          </Link>
        </nav>
      </div>

      {/* 适用条件 */}
      <section id="conditions" className="scroll-mt-24 space-y-4">
        <h2 className="text-lg font-bold text-[#18243B] flex items-center">
          <Scale className="mr-2 h-5 w-5 text-[#6955E8]" />
          <span>{isFeatured ? `本站为什么优选${brand.name}：适用条件与依据` : `${brand.name}适合谁、不适合谁`}</span>
        </h2>
        {featured ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 space-y-2">
                <h3 className="text-sm font-bold text-emerald-800">适合这些用户</h3>
                <ul className="space-y-1.5 text-xs text-slate-700 leading-relaxed list-disc pl-4">
                  {featured.fitFor.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-5 space-y-2">
                <h3 className="text-sm font-bold text-rose-800">不太适合这些用户</h3>
                <ul className="space-y-1.5 text-xs text-slate-700 leading-relaxed list-disc pl-4">
                  {featured.notFitFor.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-5 space-y-3">
              <h3 className="text-sm font-bold text-[#18243B]">推荐依据（都由价格表计算得出）</h3>
              <ol className="space-y-3 text-xs text-slate-700 leading-relaxed">
                {featured.reasons.map((r, i) => (
                  <li key={r.title} className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7C3AED] text-[12px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span>
                      <strong className="text-[#18243B]">{r.title}：</strong>
                      {r.detail}
                      <span className="block text-[12px] text-slate-500 mt-0.5">依据：{r.basis}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <p className="text-[12px] text-slate-500 leading-relaxed pt-1 border-t border-purple-100">
                “优选”是本站的推荐位，不等于价格最低，也不是测评结论：本站使用{brand.name}的推广（邀请）链接，读者通过链接注册或购买，本站可能获得佣金。详见
                <Link href="/disclosure" className="whitespace-nowrap text-[#7C3AED] hover:underline">推广合作与资料说明</Link>。
              </p>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-5 text-xs text-slate-700 space-y-1">
            <span className="font-bold text-[#18243B] text-sm block">适合人群</span>
            <p className="leading-relaxed">{brand.targetAudience}</p>
          </div>
        )}
      </section>

      {/* 价格位次：全部由价格表实时计算 */}
      {ranks.length > 0 && (
        <section id="ranks" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-3">
          <h2 className="text-lg font-bold text-[#18243B]">价格位次</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            按 {SITE_STATS.brandCount} 家价格表计算，位次越小越便宜；只比较价格，不代表线路质量。待核验。
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left border-collapse text-xs">
              <thead className="bg-[#18243B] text-slate-200 text-[12px]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">比较项</th>
                  <th className="py-2.5 px-3 font-semibold whitespace-nowrap">本品牌</th>
                  <th className="py-2.5 px-3 font-semibold">位次</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {ranks.map((r) => (
                  <tr key={r.metric}>
                    <td className="py-2.5 px-3">{RANK_METRIC_LABELS[r.metric]}</td>
                    <td className="py-2.5 px-3 font-bold text-[#6955E8] whitespace-nowrap">{formatRankValue(r)}</td>
                    <td className="py-2.5 px-3">{describeRank(r)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 站长测试记录：只有站长自己跑过、有截图和完整测试条件的品牌才有；单次测试，不当作结论 */}
      {test && (
        <section id="test" className="scroll-mt-24 rounded-3xl border border-emerald-100 bg-emerald-50/30 p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-[#18243B] flex items-center">
            <Activity className="mr-2 h-5 w-5 text-emerald-600" />
            <span>站长真实测试记录（{test.date}）：延迟与解锁判定</span>
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            站长的一次测试，按截图原样整理；只代表当时那条网络下的延迟和地区判定，不代表线路质量或速度。
          </p>
          <dl className="grid gap-3 sm:grid-cols-2 text-xs">
            {(
              [
                ['测试时间', test.date],
                ['测试者', test.tester],
                ['工具', test.tool],
                ['网络环境', test.network],
                ['测试范围', test.scope],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className={`rounded-xl border border-emerald-100 bg-white p-3 ${label === '测试范围' ? 'sm:col-span-2' : ''}`}>
                <dt className="text-[12px] text-slate-500">{label}</dt>
                <dd className="mt-0.5 text-slate-800 leading-relaxed">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[820px] text-left text-xs border-collapse">
              <thead className="bg-[#18243B] text-slate-200 text-[12px] whitespace-nowrap">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">地区</th>
                  <th className="py-2.5 px-3 font-semibold">节点数</th>
                  <th className="py-2.5 px-3 font-semibold">TLS RTT</th>
                  <th className="py-2.5 px-3 font-semibold">HTTPS 延迟</th>
                  <th className="py-2.5 px-3 font-semibold">YouTube</th>
                  <th className="py-2.5 px-3 font-semibold">Netflix</th>
                  <th className="py-2.5 px-3 font-semibold">Disney+</th>
                  <th className="py-2.5 px-3 font-semibold">TikTok</th>
                  <th className="py-2.5 px-3 font-semibold">OpenAI</th>
                  <th className="py-2.5 px-3 font-semibold">Steam 货币</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 whitespace-nowrap">
                {test.regions.map((r) => (
                  <tr key={r.region}>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{r.region}</td>
                    <td className="py-2.5 px-3">{r.nodes}</td>
                    <td className="py-2.5 px-3">{r.tlsRtt}</td>
                    <td className="py-2.5 px-3">{r.httpsLatency}</td>
                    <td className="py-2.5 px-3">{r.youtube}</td>
                    <td className="py-2.5 px-3">{r.netflix}</td>
                    <td className="py-2.5 px-3">{r.disney}</td>
                    <td className="py-2.5 px-3">{r.tiktok}</td>
                    <td className="py-2.5 px-3">{r.openai}</td>
                    <td className="py-2.5 px-3">{r.steam}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-700 space-y-1.5">
            <span className="font-bold text-[#18243B] block">怎么读这张表</span>
            <ul className="list-disc pl-5 space-y-1 leading-relaxed">
              {test.howToRead.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          {hasTestImage && (
            <figure className="space-y-2">
              <a
                href={test.image.src}
                target="_blank"
                rel="noopener"
                className="block overflow-hidden rounded-2xl border border-slate-200 bg-white"
                title="在新窗口打开原始截图"
              >
                {/* 原始截图是一张长表格，尺寸随站长上传的文件而定，直接用 img 按宽度自适应 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={test.image.src} alt={test.image.alt} loading="lazy" className="w-full h-auto" />
              </a>
              <figcaption className="text-[12px] text-slate-500">原始截图（点击在新窗口打开大图）；上表是从这张截图整理出来的。</figcaption>
            </figure>
          )}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900 space-y-1.5">
            <span className="font-bold block">适用范围与局限</span>
            <ul className="list-disc pl-5 space-y-1 leading-relaxed">
              {test.caveats.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p className="pt-1">
              自己复测的方法见
              <Link href="/blog/speed-test-latency-stability-guide" className="text-[#7C3AED] hover:underline">《机场测速怎么做？晚高峰、延迟与稳定性检测指南》</Link>。
            </p>
          </div>
        </section>
      )}

      {/* 技术参数：仅在品牌资料已核验时展示；未核验时不展示任何协议/线路类参数 */}
      {brand.isVerified && brand.attributes ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <Server className="h-5 w-5 text-[#6955E8]" />
            <h2 className="text-lg font-bold text-[#18243B]">技术架构与服务参数</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {(
              [
                ['运营起始年限', brand.attributes.establishedYear],
                ['支持通信协议', brand.attributes.protocols.join(', ')],
                ['底层线路类型', brand.attributes.lineTypes.join('、')],
                ['国内中转核心入口', brand.attributes.entryNodes],
                ['退款支持政策', brand.attributes.refundPolicy],
                ['设备连接数量限制', brand.attributes.deviceLimit],
                ['付款通道', brand.attributes.paymentMethods.join('、')],
                ['客户支持服务渠道', brand.attributes.supportChannels.join('、')],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="border border-slate-100 rounded-xl p-3.5 bg-[#F5F7FB]">
                <span className="text-slate-500 block mb-0.5">{label}</span>
                <span className="font-semibold text-slate-800 text-sm">{value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 text-xs text-amber-900 leading-relaxed">
          <span className="font-bold text-sm block mb-1">线路、协议与服务条款：暂不单独展示</span>
          {brand.name} 的线路、协议、退款、付款方式尚未核验，本页不单独列出；简介和价格表里的线路、倍率、不限速都只是资料标注
          {test ? '；延迟与解锁有站长一次测试（见上方），速率未测。' : '，未测试。'}
          以官网为准。
        </div>
      )}

      {/* 价格优势 / 弱势：内容全部来自本站收录的价格表；线路、速度等体验性说法一律标注“资料标注”，不当作实测结论 */}
      {(brand.pros.length > 0 || brand.cons.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50/30 p-6 space-y-3">
            <h2 className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>价格优势</span>
            </h2>
            <ul className="space-y-2 text-xs text-slate-700">
              {brand.pros.map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <Check className="mr-2 h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-rose-100 bg-rose-50/30 p-6 space-y-3">
            <h2 className="flex items-center space-x-2 text-rose-800 font-bold text-sm">
              <X className="h-4 w-4 text-rose-600" />
              <span>弱势与注意事项</span>
            </h2>
            <ul className="space-y-2 text-xs text-slate-700">
              {brand.cons.map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <X className="mr-2 h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 套餐明细 */}
      <section id="plans" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-[#6955E8]" />
            <h2 className="text-lg font-bold text-[#18243B]">{brand.name} 套餐明细（价格待核验）</h2>
          </div>
          <span className="text-xs text-slate-500">
            共 {stats?.optionCount ?? 0} 个价格选项（{stats?.schemeCount ?? 0} 个套餐方案 × 付款周期）
          </span>
        </div>

        <div className="rounded-xl bg-[#F5F7FB] p-4 text-xs text-slate-600 leading-relaxed space-y-1">
          <p>
            <strong className="text-slate-800">怎么读：</strong>
            “实际付款”是一次付清的金额（月付即每月实付）；“折合月价”= 一次付清 ÷ 月数，只作参考。“每月 N GB”是每月额度，“周期共 N GB”是整个周期合计；“不限时按量”是一次性流量包。
          </p>
          {ladder.length > 0 && (
            <p>
              <strong className="text-slate-800">折扣阶梯：</strong>
              {ladder.map((l) => `${l.label} ${l.zhe}`).join('、')}（各主力档位一致，由价格表计算）。
            </p>
          )}
          <p>点“对比”可加入<Link href="/me#compare" className="text-[#7C3AED] hover:underline">个人中心的套餐对比</Link>（最多 4 个，仅存本浏览器）。{brand.affiliateUrl && `表中“选购”和下方的“${buyLabel}”是本站推广链接。`}</p>
        </div>

        <p className="text-[12px] text-slate-500 min-[900px]:hidden">
          ← 表格较宽，可左右滑动查看全部列 →
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-left border-collapse text-xs">
            <thead className="bg-[#18243B] text-slate-200 text-[12px]">
              <tr>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">套餐名称</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">周期</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">实际付款</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">流量</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">倍率 · 设备</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">参考折算单价</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap text-center">对比</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap text-center">官网入口</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {brandPlans.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 px-4 text-center text-slate-500">
                    暂未收录该品牌经核实的套餐价格，相关资料整理中。
                  </td>
                </tr>
              )}
              {brandPlans.map((p) => {
                const isOneTime = p.billingCycle === 'unlimited';
                const isMonthly = p.billingCycle === 'monthly';
                const hasCustomReset = /刷新|重置/.test(p.trafficResetRule) || isOneTime;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 align-top">
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">{p.planName}</td>
                    <td className="py-3 px-3 font-semibold whitespace-nowrap">{p.billingCycleLabel}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-bold text-[#6955E8]">
                        {p.currency}
                        {p.actualPrice.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {isMonthly
                          ? '每月实付'
                          : isOneTime
                            ? '一次性购买'
                            : `一次付清 · ${p.perMonthLabel}`}
                      </span>
                      {p.savingsLabel && !isOneTime && (
                        <span className="text-[11px] text-emerald-700 block">{p.savingsLabel}</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {isOneTime || p.monthlyGB === null ? (
                        <span className="whitespace-nowrap">{p.trafficGB} GB（一次性）</span>
                      ) : (
                        <>
                          <span>每月 {p.monthlyGB} GB</span>
                          {!isMonthly && (
                            <span className="text-[11px] text-slate-500 block">周期共 {p.trafficGB} GB</span>
                          )}
                        </>
                      )}
                      {hasCustomReset && (
                        <span className="text-[11px] text-slate-500 block max-w-[16rem] leading-snug">
                          {p.trafficResetRule}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="whitespace-nowrap">{p.trafficMultiplier}</span>
                      <span className="text-[11px] text-slate-500 block max-w-[10rem] leading-snug">{p.deviceLimit}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#6955E8] whitespace-nowrap">
                      ¥{p.referenceCostPerEffectiveGB.toFixed(3)}/GB
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <CompareToggleButton planId={p.id} />
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {p.affiliateUrl || brand.affiliateUrl ? (
                        <a
                          href={p.affiliateUrl || brand.affiliateUrl || '#'}
                          target="_blank"
                          rel="sponsored nofollow noopener"
                          className="inline-flex items-center whitespace-nowrap rounded-lg bg-[#7C3AED] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#6D28D9]"
                        >
                          <span>选购</span>
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      ) : (
                        <Link
                          href="/#comparison-table"
                          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:border-purple-300 hover:text-[#6955E8]"
                        >
                          横向对比
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 购买前核对清单 */}
      <section id="checklist" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-[#F5F7FB] p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-bold text-[#18243B] flex items-center">
          <ClipboardCheck className="mr-2 h-5 w-5 text-[#6955E8]" />
          <span>购买前核对清单</span>
        </h2>
        {featured && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#18243B]">购买前需要注意的限制</h3>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700 leading-relaxed">
              {featured.limits.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p className="text-[12px] text-slate-500">资料来源与核对日期：{featured.sourceLine}</p>
          </div>
        )}
        <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-700 leading-relaxed">
          {checklist.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
        <p className="text-[12px] text-slate-500 leading-relaxed">核验说明：{brand.verificationNotes}</p>
      </section>

      {/* 购买入口：放在套餐解释和判断依据之后，并说明推广关系 */}
      <section id="buy" className="scroll-mt-24 rounded-3xl border border-pink-200 bg-gradient-to-br from-pink-50/70 to-purple-50/60 p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-bold text-[#18243B]">看完套餐和核对清单之后，再去官网</h2>
        {brand.affiliateUrl ? (
          <>
            <p className="text-xs text-slate-600 leading-relaxed">
              下面的按钮是本站使用的{brand.name}推广（邀请）链接，已标注 <code>rel=&quot;sponsored nofollow noopener&quot;</code>：
              通过它注册或购买，本站可能获得佣金；这不会改变你支付的价格，本站也不承诺有额外优惠。价格、套餐是否在售请以官网当前页面为准，付款前请核对网址，不要在非官方页面输入账号密码。
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={brand.affiliateUrl}
                target="_blank"
                rel="sponsored nofollow noopener"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#F472B6] via-[#EC4899] to-[#7C3AED] px-6 py-3 text-xs font-bold text-white shadow-md shadow-pink-500/20 hover:opacity-95 transition-all"
              >
                <span>{buyLabel}（推广链接）</span>
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </a>
              <Link
                href="/calculator"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-slate-800 hover:border-pink-300 hover:bg-pink-50/40 transition-colors"
              >
                <Calculator className="mr-1.5 h-3.5 w-3.5 text-[#7C3AED]" />
                <span>先用计算器算一下</span>
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-slate-600 leading-relaxed">
              本站没有{brand.name}的推广链接，也没有核实过它的官网网址，所以这里不放官网入口。需要购买时，请通过可靠渠道确认官网地址，核对套餐和价格后再付款，不要在非官方页面输入账号密码。
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/#comparison-table"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 hover:border-purple-300 hover:bg-purple-50/40 transition-colors"
              >
                <Layers className="mr-1.5 h-3.5 w-3.5 text-[#7C3AED]" />
                <span>在比较表中对比此品牌</span>
              </Link>
              <Link
                href="/calculator"
                className="inline-flex items-center justify-center rounded-xl bg-[#7C3AED] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#6D28D9] transition-colors"
              >
                <Calculator className="mr-1.5 h-3.5 w-3.5" />
                <span>测算真实成本</span>
              </Link>
            </div>
          </>
        )}
        {promo && (
          <div id="promo" className="scroll-mt-24 space-y-2 rounded-2xl border border-pink-200 bg-white/80 p-4">
            <h3 className="text-sm font-bold text-[#18243B]">{brand.name}优惠码</h3>
            {promo.note ? (
              <p className="text-xs leading-relaxed text-amber-800">
                站长清单里这一条写的是“{promo.code}”，更像套餐名而不像优惠码，待站长确认，暂不提供复制。
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <CopyCodeButton code={promo.code} brandName={brand.name} />
                <span className="text-xs font-semibold text-[#6955E8]">{PROMO_TERMS}</span>
              </div>
            )}
            <p className="text-[12px] leading-relaxed text-slate-500">
              优惠码由站长提供（清单日期 {PROMO_CODES_DATE}），站长说明：折扣 {PROMO_DISCOUNT_LABEL}，有效期{PROMO_VALIDITY_LABEL}。适用套餐、周期和能否叠加年付折扣没有说明，本站也没有核验：在官网结算页输入后，只看最终付款金额，以结算页为准。所有品牌的优惠码见
              <Link href="/jichang-youhui" className="text-[#7C3AED] hover:underline">机场优惠码与优惠汇总</Link>。
            </p>
          </div>
        )}
        <p className="leading-relaxed text-xs text-slate-500 pt-1">
          相关阅读：
          <Link href="/blog/airport-plan-price-comparison" className="text-[#7C3AED] hover:underline">机场套餐价格怎么比</Link>
          {' · '}
          <Link href="/blog/traffic-multiplier" className="text-[#7C3AED] hover:underline">流量倍率怎么算</Link>
          {' · '}
          <Link href="/blog/first-purchase-guide" className="text-[#7C3AED] hover:underline">第一次购买的注意事项</Link>
          {' · '}
          <Link href="/disclosure" className="whitespace-nowrap text-[#7C3AED] hover:underline">推广合作与资料说明</Link>
        </p>
      </section>
    </div>
  );
}
