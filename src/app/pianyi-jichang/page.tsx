import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Tag, ArrowRight, ClipboardCheck } from 'lucide-react';
import { PageHeroBanner } from '@/components/PageHeroBanner';
import { FAQAccordion } from '@/components/FAQAccordion';
import {
  current,
  focusTable,
  monthlyMiniPacks,
  rankBestPerGB,
  rankCheapestYearly,
  rankEntryMonthly,
  rankMonthlyPerGB,
  type RankedPlan,
} from '@/data/cheapRankings';
import { fmtPerGB, fmtYuan, type RankInfo } from '@/data/priceStats';
import { BRANDS, FOCUS_BRAND_IDS } from '@/data/brands';
import { getBrandTest } from '@/data/brandTests';
import {
  FOCUS_MARK_CLASS,
  FOCUS_ROW_CLASS,
  FocusBrandTable,
  FocusLegend,
  type FocusTableRow,
} from '@/components/FocusBrandTable';
import { SITE_STATS } from '@/data/siteStats';
import { absoluteUrl } from '@/data/site';
import type { FAQItem } from '@/types';

/**
 * 专题页：便宜机场。
 * 回答“便宜机场有哪些、便宜的机场价格多少钱、买便宜机场要注意什么”。
 * 所有名次都由价格表实时计算（见 data/cheapRankings.ts），不手写；三张价格表里优选品牌不置顶，只用底色标出。
 * 页面顶部的“最低价演算表”是站长指定顺序的重点品牌（编辑顺序，不是价格排名），数字由价格表算出，位次写真实位次。
 */

const entry = rankEntryMonthly();
const perGB = rankBestPerGB();
const yearly = rankCheapestYearly();
const monthlyPerGB = rankMonthlyPerGB();
const miniPacks = monthlyMiniPacks(16);

const top = {
  entry: current(entry)[0],
  perGB: current(perGB)[0],
  yearly: current(yearly)[0],
};

// 本站重点 7 家：顺序是站长指定的推荐顺序（编辑选择，不是价格排名）；数字都由价格表算出，位次写真实位次（见 data/cheapRankings.ts 的 focusTable）
const focusRows = focusTable();
const FOCUS_SET = new Set<string>(FOCUS_BRAND_IDS);
const BRAND_ALIAS = new Map(BRANDS.map((b) => [b.id, b.aliases?.[0]] as const));
const brandCount = SITE_STATS.brandCount;
const dataDateRange =
  SITE_STATS.earliestDataDate === SITE_STATS.latestDataDate
    ? SITE_STATS.latestDataDate
    : `${SITE_STATS.earliestDataDate} 至 ${SITE_STATS.latestDataDate}`;

const TITLE = `便宜机场推荐 2026：${brandCount} 家机场价格从低到高排`;
const DESCRIPTION = `便宜机场有哪些？按 ${brandCount} 家价格表排序：入门月付最低 ${fmtYuan(top.entry.price)}，每 GB 最低 ${fmtPerGB(top.perGB.perGB)}/GB，年付最低 ${fmtYuan(top.yearly.price)}。价格待核验，以官网为准。`;

export const metadata: Metadata = {
  title: { absolute: `${TITLE}｜性价比机场` },
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl('/pianyi-jichang') },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: '性价比机场',
    url: absoluteUrl('/pianyi-jichang'),
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 630, alt: '性价比机场：樱花树下的红色鸟居与石灯笼，远处是富士山与弯月' }],
  },
};

function yuan(n: number): string {
  return fmtYuan(n);
}

function gbLabel(p: RankedPlan): string {
  if (p.monthlyGB === null) return `共 ${p.totalGB} GB，用完为止`;
  return p.cycle === 'm' ? `每月 ${p.monthlyGB} GB` : `每月 ${p.monthlyGB} GB（周期共 ${p.totalGB} GB）`;
}

function BrandCell({ p }: { p: RankedPlan }) {
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
        <Link href={`/brands/${p.brandSlug}`} className="inline-flex min-h-7 items-center font-bold text-[#0F172A] hover:text-[#7C3AED]">
          {p.brandName}
        </Link>
        {p.featured ? (
          <span className="rounded bg-[#0F172A] px-1.5 py-0.5 text-[11px] font-bold text-white">本站优选</span>
        ) : p.recommended ? (
          <span className="rounded bg-[#7C3AED] px-1.5 py-0.5 text-[11px] font-bold text-white">本站推荐</span>
        ) : null}
        {p.isHistorical && (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">历史资料</span>
        )}
      </div>
      <div className="text-[12px] text-slate-500 whitespace-nowrap">
        {p.planName} · {p.cycleLabel}
      </div>
    </div>
  );
}

function RankTableBase({
  rows,
  valueLabel,
  value,
  limit,
}: {
  rows: RankedPlan[];
  valueLabel: string;
  value: (p: RankedPlan) => string;
  limit?: number;
}) {
  const shown = limit ? rows.slice(0, limit) : rows;
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full min-w-[640px] text-left text-xs sm:text-[13px] border-collapse">
        <thead className="bg-[#18243B] text-slate-200 text-[12px]">
          <tr>
            <th className="py-2.5 px-3 font-semibold w-10">#</th>
            <th className="py-2.5 px-3 font-semibold">品牌 · 套餐</th>
            <th className="py-2.5 px-3 font-semibold whitespace-nowrap">{valueLabel}</th>
            <th className="py-2.5 px-3 font-semibold whitespace-nowrap">实付</th>
            <th className="py-2.5 px-3 font-semibold">流量</th>
            <th className="py-2.5 px-3 font-semibold whitespace-nowrap">每 GB</th>
            <th className="py-2.5 px-3 font-semibold whitespace-nowrap">资料日</th>
            <th className="py-2.5 px-3 font-semibold whitespace-nowrap text-center">入口</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {shown.map((p, i) => (
            <tr key={`${p.brandId}-${p.planName}-${p.cycle}`} className={`align-top hover:bg-slate-50 ${FOCUS_SET.has(p.brandId) ? FOCUS_ROW_CLASS : ''}`}>
              <td className={`py-2.5 px-3 font-bold text-[#7C3AED] ${FOCUS_SET.has(p.brandId) ? FOCUS_MARK_CLASS : ''}`}>{i + 1}</td>
              <td className="py-2.5 px-3">
                <BrandCell p={p} />
              </td>
              <td className="py-2.5 px-3 font-bold text-[#6955E8] whitespace-nowrap">{value(p)}</td>
              <td className="py-2.5 px-3 whitespace-nowrap">
                {yuan(p.price)}
                <span className="block text-[11px] text-slate-500">{p.cycle === 'm' ? '每月实付' : p.cycle === 'o' ? '一次性' : '一次付清'}</span>
              </td>
              <td className="py-2.5 px-3">{gbLabel(p)}</td>
              <td className="py-2.5 px-3 whitespace-nowrap">{fmtPerGB(p.perGB)}</td>
              <td className="py-2.5 px-3 whitespace-nowrap text-slate-500">{p.dataDate}</td>
              <td className="py-2.5 px-3 text-center whitespace-nowrap">
                <Link href={`/brands/${p.brandSlug}`} className="inline-flex min-h-8 items-center whitespace-nowrap text-[#7C3AED] hover:underline font-semibold">
                  资料页
                </Link>
                {p.affiliateUrl && (
                  <a
                    href={p.affiliateUrl}
                    target="_blank"
                    rel="sponsored nofollow noopener"
                    className="ml-2 inline-flex min-h-8 items-center whitespace-nowrap text-slate-500 hover:text-[#7C3AED] hover:underline"
                  >
                    官网（推广）
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 价格表：有本站重点品牌的行加浅紫底色，表上方写明图例 */
function RankTable(props: { rows: RankedPlan[]; valueLabel: string; value: (p: RankedPlan) => string; limit?: number }) {
  const shown = props.limit ? props.rows.slice(0, props.limit) : props.rows;
  return (
    <div className="space-y-1.5">
      <FocusLegend count={FOCUS_BRAND_IDS.length} show={shown.some((p) => FOCUS_SET.has(p.brandId))} />
      <RankTableBase {...props} />
    </div>
  );
}

/** “34 家里第 9 低（3 家并列）” */
function rankText(info: RankInfo | null): string {
  if (!info) return '';
  return `${info.total} 家里第 ${info.rank} 低${info.tied > 1 ? `（${info.tied} 家并列）` : ''}`;
}

const focusTableRows: FocusTableRow[] = focusRows.map((r) => {
  const { entry, yearly, perGB: bestGB } = r;
  return {
    position: r.position,
    brandSlug: entry.brandSlug,
    brandName: entry.brandName,
    alias: BRAND_ALIAS.get(entry.brandId),
    featured: entry.featured,
    isHistorical: entry.isHistorical,
    dataDate: entry.dataDate,
    affiliateUrl: entry.affiliateUrl,
    cells: [
      {
        label: '月付最低价',
        value: `${yuan(entry.price)}/月`,
        detail: `${entry.planName} · 每月 ${entry.monthlyGB ?? entry.totalGB} GB · ${fmtPerGB(entry.perGB)}/GB`,
        rank: rankText(r.rankEntry),
      },
      {
        label: '每 GB 最低',
        value: bestGB ? `${fmtPerGB(bestGB.perGB)}/GB` : '—',
        detail: bestGB
          ? `${bestGB.planName} · ${bestGB.cycleLabel} ${yuan(bestGB.price)}${bestGB.cycle === 'm' ? ' 每月' : ' 一次付清'}`
          : '价格表里没有可比的档位',
        rank: rankText(r.rankPerGB),
      },
      {
        label: '年付最低',
        value: yearly ? `${yuan(yearly.price)}/年` : '没有年付',
        detail: yearly
          ? `${yearly.planName} · 每月 ${yearly.monthlyGB ?? yearly.totalGB} GB · 折合 ${yuan(Math.round((yearly.price / 12) * 100) / 100)}/月`
          : '价格表里没有年付档',
        rank: rankText(r.rankYearly),
      },
    ],
  };
});

// 页脚说明用的名单：有站长测试记录的、历史资料的、没有推广链接的重点品牌（全部由数据得出，不手写）
const focusTested = focusRows.flatMap((r) => {
  const test = getBrandTest(r.entry.brandId);
  return test ? [{ r, test }] : [];
});
const focusHistorical = focusRows.filter((r) => r.entry.isHistorical);
const focusNoAffiliate = focusRows.filter((r) => !r.entry.affiliateUrl);
const focusAffiliateCount = focusRows.length - focusNoAffiliate.length;

const FAQS: FAQItem[] = [
  {
    id: 'cheap-how-much',
    question: '便宜机场一个月多少钱？',
    answer: `按本站 ${brandCount} 家机场的价格表，入门月付最低是 ${top.entry.brandName} ${top.entry.planName} ${yuan(top.entry.price)}（每月 ${top.entry.monthlyGB ?? 0} GB）；${entry.length} 家里有 ${entry.filter((p) => p.price <= 20).length} 家的入门月付不超过 ¥20，${entry.filter((p) => p.price <= 30).length} 家不超过 ¥30。价格为公开资料整理（资料日 ${dataDateRange}），尚未在官网结算页逐项核验，下单前以官网为准。`,
  },
  {
    id: 'cheap-is-value',
    question: '最便宜的机场就是最划算的吗？',
    answer: `不一定。“便宜”有三种口径：月付实付最低、每 GB 单价最低、年付实付最低，这三个榜的第一名各不相同（本页三张表就是证据）。每月只用几十 GB 的人看月付实付；每月要几百 GB 的人看每 GB 单价；确定长期使用的人才看年付。先估算自己每月的用量，再决定按哪个口径挑，方法见《100GB 机场流量够用吗》。`,
  },
  {
    id: 'cheap-risk',
    question: '便宜机场安全吗？会不会跑路？',
    answer: `本站主要整理价格，没有对各品牌的线路、稳定性或经营状况做过系统测试（灵动云资料页有站长的一次延迟与解锁测试，仅供参考），无法替你判断。能做的是控制风险：第一次买便宜机场先选月付或季付小额试用，不要一上来就买年付、多年付；在自己的网络和常用时段用一段时间，确认续费价格、退款规则和倍率之后，再考虑长周期。本页标注“历史资料”的品牌，价格不代表当前在售。`,
  },
  {
    id: 'cheap-how-to-buy',
    question: '便宜机场怎么买？第一次购买要看什么？',
    answer: `按这个顺序：先在本页按口径挑 2–3 家候选 → 到品牌资料页看完整价格表和购买前核对清单 → 到官网核对当前价格、续费价、流量重置规则、倍率、设备数和退款条款 → 选最短周期付款 → 按《机场新手使用指南》导入订阅。付款前十项核对清单见《第一次买便宜机场要核对什么？》。`,
  },
];

export default function CheapAirportsPage() {
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `入门月付最低的机场（前 10，共 ${entry.length} 家）`,
    description: '按本站价格表排序：每家实付最低的月付档，按实付金额从低到高。价格待核验。',
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: Math.min(10, entry.length),
    itemListElement: entry.slice(0, 10).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${p.brandName} ${p.planName}（月付 ${yuan(p.price)} / ${p.monthlyGB ?? p.totalGB}GB）`,
      url: absoluteUrl(`/brands/${p.brandSlug}`),
    })),
  };

  return (
    <div className="pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />

      <PageHeroBanner
        bgImageSrc="/images/backgrounds/bg-torii-sunset.jpg"
        badgeText={`便宜机场专题 · ${brandCount} 家价格表排序`}
        badgeIcon={<Tag className="h-3.5 w-3.5 text-pink-400" />}
        h1Title={`便宜机场推荐 2026：${brandCount} 家机场按价格从低到高排`}
        subtitle={`便宜的机场价格到底多少钱？${brandCount} 家机场按入门月付、每 GB、年付三种口径分别排序，名次由价格表计算（资料日 ${dataDateRange}，待核验）。`}
        breadcrumbs={[{ label: '便宜机场' }]}
        scenicCaption="水上鸟居与天幕环轨 · 便宜也要算清楚口径"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 本站重点：最低价演算表。顺序是本站推荐顺序（编辑选择，不是价格排名），每个数字旁边写它在全部品牌里的真实位次 */}
        <section aria-labelledby="focus-heading" className="space-y-3">
          <h2 id="focus-heading" className="text-xl sm:text-2xl font-bold text-[#0F172A]">
            本站重点推荐的便宜机场：{focusRows.length} 家最低价演算表
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            这里的“机场”指按流量套餐收费的网络代理订阅，不是航空机场。下面 {focusRows.length} 家是本站重点推荐的品牌：先看每家的最低价，再看它在 {brandCount} 家里的真实位次。不想逐家比的人，看这张表就够了。
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong className="text-slate-800">顺序说明：</strong>
            表里的顺序是本站的推荐顺序（编辑选择），<strong>不是价格排名</strong>。每个数字下面写着它在 {brandCount} 家里的真实位次；按价格从低到高排的完整榜单在下面的表里，浅紫底色的行就是这 {focusRows.length} 家。
          </p>

          <FocusBrandTable
            caption={`本站重点 ${focusRows.length} 家机场的最低价演算表：月付最低价、每 GB 最低价、年付最低价和各自的真实位次`}
            rows={focusTableRows}
          />

          <ul className="list-disc space-y-1 pl-5 text-xs leading-relaxed text-slate-500">
            <li>价格来自价格表（资料日 {dataDateRange}），尚未在官网结算页逐项核验，下单前以官网为准；表里只比较价格，不代表线路质量。</li>
            {focusTested.length > 0 && (
              <li>
                {focusTested.map(({ r, test }, i) => (
                  <React.Fragment key={r.entry.brandId}>
                    {i > 0 && '；'}
                    {r.entry.brandName}有站长 {test.date} 的延迟与解锁测试记录（单次，见
                    <Link href={`/brands/${r.entry.brandSlug}#test`} className="text-[#7C3AED] hover:underline">资料页</Link>
                    ）
                  </React.Fragment>
                ))}
                ；其余重点品牌没有测试数据。
              </li>
            )}
            {focusHistorical.length > 0 && (
              <li>
                {focusHistorical.map((r) => r.entry.brandName).join('、')}在站内标为“历史资料”：价格只是整理时的历史参考，不代表当前在售
                {focusNoAffiliate.length > 0
                  ? `；${focusNoAffiliate.map((r) => r.entry.brandName).join('、')}没有本站的推广链接，只提供资料页`
                  : ''}
                。
              </li>
            )}
            <li>
              表中“官网（推广）”是本站的推广（邀请）链接，{focusAffiliateCount} 家有；通过它注册或购买，本站可能获得佣金，不影响你支付的价格。详见
              <Link href="/disclosure" className="whitespace-nowrap text-[#7C3AED] hover:underline">推广合作与资料说明</Link>。
            </li>
          </ul>
        </section>

        {/* 价格表算出来的第一名：只看价格 */}
        <section className="rounded-3xl border border-pink-100 bg-[#FFF9FD] p-5 sm:p-7 space-y-3">
          <h2 className="text-xl font-bold text-[#0F172A]">按价格表算出来的三个第一名（只看价格，不是推荐）</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            “便宜”要先说口径。三种口径的第一名，由价格表计算（不含历史资料品牌）：
          </p>
          <ul className="grid gap-3 sm:grid-cols-3 text-sm">
            <li className="rounded-2xl border border-pink-100 bg-white p-4">
              <span className="block text-[12px] font-bold uppercase tracking-wider text-[#7C3AED]">月付实付最低</span>
              <span className="mt-1 block text-lg font-bold text-[#0F172A]">
                {top.entry.brandName} <span className="text-base font-semibold text-[#6955E8]">{yuan(top.entry.price)}/月</span>
              </span>
              <span className="block text-xs text-slate-500">{top.entry.planName} · 每月 {top.entry.monthlyGB} GB · {fmtPerGB(top.entry.perGB)}/GB</span>
            </li>
            <li className="rounded-2xl border border-pink-100 bg-white p-4">
              <span className="block text-[12px] font-bold uppercase tracking-wider text-[#7C3AED]">每 GB 单价最低</span>
              <span className="mt-1 block text-lg font-bold text-[#0F172A]">
                {top.perGB.brandName} <span className="text-base font-semibold text-[#6955E8]">{fmtPerGB(top.perGB.perGB)}/GB</span>
              </span>
              <span className="block text-xs text-slate-500">
                {top.perGB.planName} · {top.perGB.cycleLabel} {yuan(top.perGB.price)}一次付清 · {gbLabel(top.perGB)}
              </span>
            </li>
            <li className="rounded-2xl border border-pink-100 bg-white p-4">
              <span className="block text-[12px] font-bold uppercase tracking-wider text-[#7C3AED]">年付实付最低</span>
              <span className="mt-1 block text-lg font-bold text-[#0F172A]">
                {top.yearly.brandName} <span className="text-base font-semibold text-[#6955E8]">{yuan(top.yearly.price)}/年</span>
              </span>
              <span className="block text-xs text-slate-500">
                {top.yearly.planName} · 每月 {top.yearly.monthlyGB} GB · 折合 {yuan(Math.round((top.yearly.price / 12) * 100) / 100)}/月
              </span>
            </li>
          </ul>
          <p className="text-xs text-slate-500 leading-relaxed">
            三个第一名不是同一家，所以“最便宜”得先说口径。不知道按哪个口径挑，先看
            <Link href="/blog/100gb-traffic-guide" className="text-[#7C3AED] hover:underline">《100GB 机场流量够用吗》</Link>
            估算用量；按预算筛用首页的
            <Link href="/#comparison-table" className="text-[#7C3AED] hover:underline">套餐对比表</Link>。
          </p>
        </section>

        {/* 表一：入门月付 */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">一、月付最便宜的机场：{entry.length} 家入门月付从低到高</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            “入门月付”是每家实付最低的月付档。想先花最少的钱试一个月，看这张表；这类档位流量通常也少，每 GB 比大档位贵。
          </p>
          <RankTable rows={entry} valueLabel="月付实付" value={(p) => `${yuan(p.price)}/月`} />
        </section>

        {/* 月付小包 */}
        {miniPacks.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">二、¥16 以内的月付小包：{miniPacks.length} 个</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              每月只用几十 GB、想挂着备用的人看这里；每 GB 不便宜，胜在一次只花十几元。
            </p>
            <RankTable rows={miniPacks} valueLabel="月付实付" value={(p) => `${yuan(p.price)}/月`} />
          </section>
        )}

        {/* 表二：每 GB */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">三、每 GB 最便宜的机场：按单价从低到高（前 15）</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            每家在月/季/半年/年付里每 GB 最低的一档（不含两年付以上和流量包）。用量大的人按这张表挑；低单价多是年付大流量，要一次付清、也要用得完。
          </p>
          <RankTable rows={perGB} valueLabel="每 GB 单价" value={(p) => `${fmtPerGB(p.perGB)}/GB`} limit={15} />
          <details className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
            <summary className="min-h-8 cursor-pointer py-1 font-semibold text-[#0F172A]">只看月付：每家月付档里每 GB 最低的一档（前 15）</summary>
            <div className="mt-3">
              <RankTable rows={monthlyPerGB} valueLabel="月付每 GB" value={(p) => `${fmtPerGB(p.perGB)}/GB`} limit={15} />
            </div>
          </details>
        </section>

        {/* 表三：年付 */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">四、年付最便宜的机场：{yearly.length} 家最低年付从低到高（前 15）</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            每家最低的年付档。¥100 上下的多是每月 40–70 GB 的小包，适合用量小、一年付一次的人。年付要一次付清，第一次接触的品牌先别直接买年付，原因见
            <Link href="/blog/monthly-vs-yearly-vs-pay-as-you-go" className="text-[#7C3AED] hover:underline">《机场月付、年付与不限时套餐哪种更划算》</Link>。
          </p>
          <RankTable rows={yearly} valueLabel="年付实付" value={(p) => `${yuan(p.price)}/年`} limit={15} />
          <p className="text-xs text-slate-500">
            想看年付较月付省多少、哪些是学生版和限时套餐，见<Link href="/jichang-youhui" className="text-[#7C3AED] hover:underline">机场优惠汇总</Link>。
          </p>
        </section>

        {/* 购买前核对 */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 space-y-3">
          <h2 className="text-xl font-bold text-[#0F172A] flex items-center">
            <ClipboardCheck className="mr-2 h-5 w-5 text-[#7C3AED]" />
            买便宜机场之前，先核对这五件事
          </h2>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-700 leading-relaxed">
            <li>
              <strong>倍率：</strong>标称 100GB 在 2 倍率节点下只能用 50GB。本站价格表里只有少数品牌标注了“1 倍率”，其余按 1 倍率计算、标明“资料未标注”，请到官网和用户面板确认。算法见
              <Link href="/blog/traffic-multiplier" className="text-[#7C3AED] hover:underline">《机场流量倍率怎么算》</Link>。
            </li>
            <li>
              <strong>续费价：</strong>首购价和续费原价要分开算全年支出，见
              <Link href="/blog/renewal-cost" className="text-[#7C3AED] hover:underline">《机场续费价与优惠怎么算》</Link>。
            </li>
            <li>
              <strong>流量重置规则：</strong>每月 1 日重置、每 30 天重置、一次性用完为止，三种不能混比。
            </li>
            <li>
              <strong>设备数与退款条款：</strong>本站价格表大多没有收录，必须在官网确认。
            </li>
            <li>
              <strong>先买短周期：</strong>在自己的网络和晚高峰时段用一段时间，记录延迟、丢包和持续速率（方法见
              <Link href="/blog/speed-test-latency-stability-guide" className="text-[#7C3AED] hover:underline">《机场测速怎么做》</Link>
              ），再决定要不要换长周期。
            </li>
          </ol>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link href="/blog/first-purchase-guide" className="inline-flex items-center rounded-xl bg-[#7C3AED] px-4 py-2 text-xs font-semibold text-white hover:bg-[#6D28D9] transition-colors">
              付款前十项核对清单
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
            <Link href="/calculator" className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:border-pink-300 transition-colors">
              把倍率和用量代进计算器
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">关于便宜机场的常见问题</h2>
          <FAQAccordion faqs={FAQS} />
        </section>

        {/* 数据说明 */}
        <section className="text-xs text-slate-500 leading-relaxed space-y-1 border-t border-pink-100 pt-6">
          <p>
            <strong className="text-slate-700">数据说明：</strong>名次按价格表计算（与资料页“价格位次”同一算法），资料日 {dataDateRange}，待核验，价格表更新后会变。只比较价格，不代表线路质量；除灵动云的一次站长延迟与解锁测试外，没有其他测试数据。
          </p>
          <p>
            <strong className="text-slate-700">推广说明：</strong>表中“官网（推广）”是本站的推广（邀请）链接，通过它注册或购买本站可能获得佣金，不影响你支付的价格；“本站优选”“本站推荐”是编辑推荐位，不等于价格最低，它们在各口径下的位次以本页表格为准。详见
            <Link href="/disclosure" className="whitespace-nowrap text-[#7C3AED] hover:underline">推广合作与资料说明</Link>。
          </p>
        </section>
      </div>
    </div>
  );
}
