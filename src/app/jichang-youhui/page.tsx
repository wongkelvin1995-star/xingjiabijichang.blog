import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BadgePercent, ArrowRight, ShieldAlert } from 'lucide-react';
import { PageHeroBanner } from '@/components/PageHeroBanner';
import { FAQAccordion } from '@/components/FAQAccordion';
import { CopyCodeButton } from '@/components/CopyCodeButton';
import {
  FOCUS_MARK_CLASS,
  FOCUS_ROW_CLASS,
  FocusBrandTable,
  FocusLegend,
  type FocusTableRow,
} from '@/components/FocusBrandTable';
import {
  current,
  fmtPercent,
  fmtZhe,
  focusDeals,
  rankBestCycleDiscounts,
  rankYearlyDiscounts,
  specialPlans,
  yearlyMiniPacks,
  type DiscountEntry,
  type DiscountRank,
  type RankedPlan,
} from '@/data/cheapRankings';
import { fmtPerGB, fmtYuan, getSheetStats, type RankInfo } from '@/data/priceStats';
import { BRANDS, FOCUS_BRAND_IDS } from '@/data/brands';
import {
  PROMO_CODES_DATE,
  PROMO_DISCOUNT_LABEL,
  PROMO_LISTED_COUNT,
  PROMO_TERMS,
  PROMO_VALIDITY_LABEL,
  getPromoCode,
} from '@/data/promoCodes';
import { SITE_STATS } from '@/data/siteStats';
import { absoluteUrl } from '@/data/site';
import type { FAQItem } from '@/types';

/**
 * 专题页：机场优惠（含优惠码）。
 * 内容分两类：① 站长提供的各家优惠码（站长说明：8 折、一次性；适用套餐和周期没有说明，本站没有核验，不推算用码后的价格）；
 * ② 价格表里能算出来、能核对的优惠：周期折扣（年付较月付省多少）、年付小包 / 活动包、资料标注的学生版 / 限时 / 体验套餐。
 * 页面顶部“本站重点 7 家”的顺序是站长指定的推荐顺序（编辑顺序，不是折扣排名），数字由价格表算出，位次写真实位次。
 */

const yearlyDiscounts = rankYearlyDiscounts();
const bestDiscounts = rankBestCycleDiscounts();
const miniPacks = yearlyMiniPacks(120);
const specials = specialPlans();
const deals = focusDeals();
const FOCUS_SET = new Set<string>(FOCUS_BRAND_IDS);
const BRAND_ALIAS = new Map(BRANDS.map((b) => [b.id, b.aliases?.[0]] as const));

const topDiscount = current(yearlyDiscounts)[0];
const topBest = current(bestDiscounts)[0];

// 不在“本站重点 7 家”里的品牌：按品牌资料库的顺序列出优惠码
const otherBrands = BRANDS.filter((b) => !FOCUS_SET.has(b.id) && getPromoCode(b.id));
const historicalDeals = deals.filter((d) => d.isHistorical);
const noAffiliateDeals = deals.filter((d) => !d.affiliateUrl);

const brandCount = SITE_STATS.brandCount;
const dataDateRange =
  SITE_STATS.earliestDataDate === SITE_STATS.latestDataDate
    ? SITE_STATS.latestDataDate
    : `${SITE_STATS.earliestDataDate} 至 ${SITE_STATS.latestDataDate}`;

const TITLE = `机场优惠码与优惠汇总 2026：各家优惠码、年付折扣与年付小包`;
const DESCRIPTION = `机场优惠码有哪些？汇总站长提供的各家机场优惠码（点一下复制），并整理 ${brandCount} 家价格表里能算出的优惠：年付较月付最多省 ${fmtPercent(topDiscount.saved)}，¥120 以内年付小包 ${miniPacks.length} 个。站长说明这些优惠码是 ${PROMO_DISCOUNT_LABEL}、${PROMO_VALIDITY_LABEL}，未逐项核验，以官网结算页为准。`;

export const metadata: Metadata = {
  title: { absolute: `${TITLE}｜性价比机场` },
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl('/jichang-youhui') },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: '性价比机场',
    url: absoluteUrl('/jichang-youhui'),
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 630, alt: '性价比机场：樱花树下的红色鸟居与石灯笼，远处是富士山与弯月' }],
  },
};

const yuan = (n: number) => fmtYuan(n);
const perMonth = (n: number) => fmtYuan(Math.round(n * 100) / 100);

/** 价格类位次：“34 家里第 9 低（3 家并列）” */
function lowRank(info: RankInfo | null): string {
  if (!info) return '';
  return `${info.total} 家里第 ${info.rank} 低${info.tied > 1 ? `（${info.tied} 家并列）` : ''}`;
}

/** 折扣类位次：“30 家里第 5 高（3 家并列）” */
function highRank(info: DiscountRank | null): string {
  if (!info) return '';
  return `${info.total} 家里第 ${info.rank} 高${info.tied > 1 ? `（${info.tied} 家并列）` : ''}`;
}

/** 入门月付 + 最低年付的一句话，来自价格表 */
function priceLine(brandId: string): string {
  const s = getSheetStats(brandId);
  if (!s) return '';
  const parts: string[] = [];
  if (s.entryMonthly) parts.push(`入门月付 ${yuan(s.entryMonthly.price)} / ${s.entryMonthly.totalGB}GB`);
  if (s.cheapestYearly) parts.push(`年付 ${yuan(s.cheapestYearly.price)} 起`);
  return parts.join(' · ');
}

/** 优惠码：普通文字 + 复制按钮；清单里写得不像优惠码的条目标“待确认”，不给复制按钮 */
function PromoCodeView({ brandId, brandName }: { brandId: string; brandName: string }) {
  const promo = getPromoCode(brandId);
  if (!promo) return <span className="text-slate-500">—</span>;
  if (promo.note) {
    return (
      <span className="inline-flex flex-wrap items-center gap-1.5">
        <code className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[13px] font-bold text-slate-700">{promo.code}</code>
        <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800">待确认</span>
      </span>
    );
  }
  return <CopyCodeButton code={promo.code} brandName={brandName} />;
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
      <div className="text-[12px] text-slate-500 whitespace-nowrap">{p.planName}</div>
    </div>
  );
}

function EntryCell({ p }: { p: RankedPlan }) {
  return (
    <>
      <Link href={`/brands/${p.brandSlug}`} className="inline-flex min-h-8 items-center whitespace-nowrap text-[#7C3AED] hover:underline font-semibold">
        资料页
      </Link>
      {p.affiliateUrl && (
        <a href={p.affiliateUrl} target="_blank" rel="sponsored nofollow noopener" className="ml-2 inline-flex min-h-8 items-center whitespace-nowrap text-slate-500 hover:text-[#7C3AED] hover:underline">
          官网（推广）
        </a>
      )}
    </>
  );
}

function DiscountTable({ rows, limit }: { rows: DiscountEntry[]; limit?: number }) {
  const shown = limit ? rows.slice(0, limit) : rows;
  return (
    <div className="space-y-1.5">
      <FocusLegend count={FOCUS_BRAND_IDS.length} show={shown.some((d) => FOCUS_SET.has(d.brandId))} />
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-xs sm:text-[13px] border-collapse">
          <thead className="bg-[#18243B] text-slate-200 text-[12px]">
            <tr>
              <th className="py-2.5 px-3 font-semibold w-10">#</th>
              <th className="py-2.5 px-3 font-semibold">品牌 · 套餐</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap">周期</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap">较月付省</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap">月付 × 月数</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap">一次付清</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap">折合月价</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap">每月流量</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap text-center">入口</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {shown.map((d, i) => (
              <tr
                key={`${d.brandId}-${d.planName}-${d.cycle}`}
                className={`align-top hover:bg-slate-50 ${FOCUS_SET.has(d.brandId) ? FOCUS_ROW_CLASS : ''}`}
              >
                <td className={`py-2.5 px-3 font-bold text-[#7C3AED] ${FOCUS_SET.has(d.brandId) ? FOCUS_MARK_CLASS : ''}`}>{i + 1}</td>
                <td className="py-2.5 px-3">
                  <BrandCell p={d} />
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">{d.cycleLabel}</td>
                <td className="py-2.5 px-3 whitespace-nowrap font-bold text-[#6955E8]">
                  {fmtPercent(d.saved)}
                  <span className="block text-[11px] font-normal text-slate-500">{fmtZhe(d.saved)}</span>
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap text-slate-500">
                  {yuan(d.monthlyPrice)} × {d.months} = {yuan(d.monthlyPrice * d.months)}
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap font-semibold">{yuan(d.price)}</td>
                <td className="py-2.5 px-3 whitespace-nowrap">{perMonth(d.perMonth)}/月</td>
                <td className="py-2.5 px-3 whitespace-nowrap">{d.monthlyGB ?? '—'} GB</td>
                <td className="py-2.5 px-3 text-center whitespace-nowrap">
                  <EntryCell p={d} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlanTable({ rows, priceLabel }: { rows: RankedPlan[]; priceLabel: string }) {
  return (
    <div className="space-y-1.5">
      <FocusLegend count={FOCUS_BRAND_IDS.length} show={rows.some((p) => FOCUS_SET.has(p.brandId))} />
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-xs sm:text-[13px] border-collapse">
          <thead className="bg-[#18243B] text-slate-200 text-[12px]">
            <tr>
              <th className="py-2.5 px-3 font-semibold w-10">#</th>
              <th className="py-2.5 px-3 font-semibold">品牌 · 套餐</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap">周期</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap">{priceLabel}</th>
              <th className="py-2.5 px-3 font-semibold">流量</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap">每 GB</th>
              <th className="py-2.5 px-3 font-semibold">资料标注</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap text-center">入口</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {rows.map((p, i) => (
              <tr
                key={`${p.brandId}-${p.planName}-${p.cycle}`}
                className={`align-top hover:bg-slate-50 ${FOCUS_SET.has(p.brandId) ? FOCUS_ROW_CLASS : ''}`}
              >
                <td className={`py-2.5 px-3 font-bold text-[#7C3AED] ${FOCUS_SET.has(p.brandId) ? FOCUS_MARK_CLASS : ''}`}>{i + 1}</td>
                <td className="py-2.5 px-3">
                  <BrandCell p={p} />
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">{p.cycleLabel}</td>
                <td className="py-2.5 px-3 whitespace-nowrap font-bold text-[#6955E8]">
                  {yuan(p.price)}
                  {p.cycle === 'y' && <span className="block text-[11px] font-normal text-slate-500">折合 {perMonth(p.price / 12)}/月</span>}
                </td>
                <td className="py-2.5 px-3">
                  {p.monthlyGB === null ? `共 ${p.totalGB} GB，用完为止` : `每月 ${p.monthlyGB} GB${p.cycle !== 'm' ? `（周期共 ${p.totalGB} GB）` : ''}`}
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">{fmtPerGB(p.perGB)}</td>
                <td className="py-2.5 px-3 text-slate-500 max-w-[16rem]">{p.note ?? '—'}</td>
                <td className="py-2.5 px-3 text-center whitespace-nowrap">
                  <EntryCell p={p} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 页顶“本站重点 7 家”表：优惠码 + 价格表里能核对的折扣，位次是在全部品牌里的真实位次
const dealRows: FocusTableRow[] = deals.map((d) => {
  const promo = getPromoCode(d.brandId);
  const cheapest = d.cheapestYearly;
  return {
    position: d.position,
    brandSlug: d.brandSlug,
    brandName: d.brandName,
    alias: BRAND_ALIAS.get(d.brandId),
    featured: d.featured,
    isHistorical: d.isHistorical,
    dataDate: d.dataDate,
    affiliateUrl: d.affiliateUrl,
    cells: [
      {
        label: '优惠码',
        value: <PromoCodeView brandId={d.brandId} brandName={d.brandName} />,
        detail: promo?.note ?? `${PROMO_TERMS}（站长说明）`,
      },
      {
        label: '年付优惠',
        value: d.yearly ? `省 ${fmtPercent(d.yearly.saved)}` : '没有可比的年付档',
        detail: d.yearly
          ? `${d.yearly.planName}：月付 ${yuan(d.yearly.monthlyPrice)} × 12，年付 ${yuan(d.yearly.price)}（${fmtZhe(d.yearly.saved)}）`
          : '价格表里没有可与月付比较的年付档',
        rank: highRank(d.rankYearly),
      },
      {
        label: '长周期优惠',
        value: d.best ? `${d.best.cycleLabel}省 ${fmtPercent(d.best.saved)}` : '—',
        detail: d.best
          ? `${d.best.planName} ${yuan(d.best.price)} 一次付清（${fmtZhe(d.best.saved)}），折合 ${perMonth(d.best.perMonth)}/月`
          : '没有比年付更省的其他周期档',
        rank: highRank(d.rankBest),
      },
      {
        label: '最低年付',
        value: cheapest ? `${yuan(cheapest.price)}/年` : '没有年付',
        detail: cheapest
          ? `${cheapest.planName} · 每月 ${cheapest.monthlyGB ?? cheapest.totalGB} GB · 折合 ${perMonth(cheapest.price / 12)}/月`
          : '价格表里没有年付档',
        rank: lowRank(d.rankCheapestYearly),
      },
    ],
  };
});

const FAQS: FAQItem[] = [
  {
    id: 'youhui-code',
    question: '机场优惠码在哪里领？本站有没有优惠码？',
    answer: `有。本页收录了站长提供的各家机场优惠码（清单日期 ${PROMO_CODES_DATE}，共 ${PROMO_LISTED_COUNT} 家有记录）：本站重点的 ${deals.length} 家在页首的表里，其余 ${otherBrands.length} 家在“其余 ${otherBrands.length} 家的优惠码”一节，每个码旁边有“复制”按钮。站长说明这些码折扣是 ${PROMO_DISCOUNT_LABEL}、有效期是${PROMO_VALIDITY_LABEL}；适用哪些套餐和周期，站长没有说明，本站也没有核验，也可能随时失效：到官网结算页输入后，看最终付款金额，以结算页为准。优惠码只认服务商官网、官方公告和官方群组里发布的；第三方页面贴出来的“独家优惠码”，先去结算页试一下再决定。`,
  },
  {
    id: 'youhui-discount',
    question: '机场优惠码是几折？可以用几次？',
    answer: `站长说明：本页的优惠码折扣是 ${PROMO_DISCOUNT_LABEL}，有效期是“${PROMO_VALIDITY_LABEL}”，可以理解为只优惠一次。同一个账号用过之后还能不能再用、适用哪些套餐和周期，站长没有说明，本站也没有核验，以官网结算页为准。续费价通常要按原价另算，算法见《机场续费价与优惠怎么算》。`,
  },
  {
    id: 'youhui-stack',
    question: '优惠码和年付折扣能叠加吗？',
    answer: `本站不知道。年付、两年付、三年付的折扣是官网标价本身的折扣，本站能由价格表算出来；站长说明优惠码是 ${PROMO_DISCOUNT_LABEL}、${PROMO_VALIDITY_LABEL}，但能不能在折扣价上再打折、是否只限首购、是否限定某个套餐或周期，站长没有说明，本站也没有核验。在官网结算页输入优惠码后，只看最终付款金额，别自己叠加着算。`,
  },
  {
    id: 'youhui-yearly',
    question: '机场年付优惠划算吗？',
    answer: `按本站价格表，年付较同名套餐月付 ×12 最多省 ${fmtPercent(topDiscount.saved)}（${topDiscount.brandName} ${topDiscount.planName}），多数品牌省 15%–20%。划不划算取决于你能不能用满一年：年付要一次付清，服务商一年内的变动、停运、退款规则都要自己承担；第一次接触的品牌，先用月付或季付试过，再换年付。算法见《机场月付、年付与不限时套餐哪种更划算》。`,
  },
  {
    id: 'youhui-student-limited',
    question: '学生版、限时套餐、体验包是真的吗？',
    answer:
      '本页列出的学生版、限时、活动、体验类套餐都是价格表里“资料标注”的档位，是否仍在售、是否要验证学生身份、限时到什么时候，本站没有核验，请以官网当前页面为准。这类套餐通常流量较少或有附加条件，买之前要看清续费价是否恢复原价。',
  },
  {
    id: 'youhui-renewal',
    question: '优惠价买了以后，续费会不会涨价？',
    answer:
      '很可能会。首购优惠、节日活动价、优惠码通常只对第一个周期有效，续费按原价。本站价格表没有收录续费价，必须在官网或客服处确认。把首购价和续费原价分开算全年支出的方法，见《机场续费价与优惠怎么算》。',
  },
];

export default function AirportDiscountsPage() {
  return (
    <div className="pb-20">
      <PageHeroBanner
        bgImageSrc="/images/backgrounds/bg-canal-lanterns.jpg"
        badgeText={`机场优惠专题 · 优惠码与 ${brandCount} 家价格表计算`}
        badgeIcon={<BadgePercent className="h-3.5 w-3.5 text-pink-400" />}
        h1Title="机场优惠码与优惠汇总 2026：优惠码、年付折扣与年付小包"
        subtitle={`各家机场优惠码一页看完（站长说明：${PROMO_DISCOUNT_LABEL}、${PROMO_VALIDITY_LABEL}；未逐项核验，以官网结算页为准），再配上价格表里能核对的优惠：年付折扣、¥120 以内的年付小包、学生版 / 限时 / 体验套餐。资料日 ${dataDateRange}，待核验。`}
        breadcrumbs={[{ label: '机场优惠' }]}
        scenicCaption="江户水乡与暖光灯街 · 优惠先看最终付款金额"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 本站重点 7 家：优惠码 + 折扣演算表。顺序是本站推荐顺序（编辑选择，不是折扣排名），位次写真实位次 */}
        <section aria-labelledby="deals-heading" className="space-y-3">
          <h2 id="deals-heading" className="text-xl sm:text-2xl font-bold text-[#0F172A]">
            本站重点推荐的优惠：{deals.length} 家优惠码与折扣演算表
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            这里的“机场”指按流量套餐收费的网络代理订阅，不是航空机场。下面 {deals.length} 家是本站重点推荐的品牌：每家给出站长提供的优惠码，以及价格表里能核对的折扣，并写明它在 {brandCount} 家里的真实位次。
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong className="text-slate-800">顺序说明：</strong>
            表里的顺序是本站的推荐顺序（编辑选择），<strong>不是折扣排名</strong>。按折扣从高到低排的完整榜单在下面的表里，浅紫底色的行就是这 {deals.length} 家；其余 {otherBrands.length} 家的优惠码在表后面。
          </p>

          <FocusBrandTable
            caption={`本站重点 ${deals.length} 家机场的优惠码与折扣演算表：优惠码、年付优惠、长周期优惠、最低年付和各自的真实位次`}
            rows={dealRows}
          />

          <ul className="list-disc space-y-1 pl-5 text-xs leading-relaxed text-slate-500">
            <li>
              优惠码由站长提供（清单日期 {PROMO_CODES_DATE}）。站长说明：折扣 {PROMO_DISCOUNT_LABEL}，有效期{PROMO_VALIDITY_LABEL}。适用哪些套餐和周期、能不能叠加，站长没有说明，本站也没有逐项核验，所以不推算“用码后的价格”：到官网结算页输入后，只看最终付款金额，以结算页为准。
            </li>
            <li>
              “年付优惠”“长周期优惠”是官网标价本身的折扣，由价格表计算（省多少 = 1 −（长周期实付 ÷（同名套餐月付 × 月数））），与优惠码无关；两者能不能叠加，以结算页为准。
            </li>
            {historicalDeals.length > 0 && (
              <li>
                {historicalDeals.map((d) => d.brandName).join('、')}在站内标为“历史资料”：价格只是整理时的历史参考，不代表当前在售
                {noAffiliateDeals.length > 0
                  ? `；${noAffiliateDeals.map((d) => d.brandName).join('、')}没有本站的推广链接，只提供资料页`
                  : ''}
                。
              </li>
            )}
            <li>
              表中“官网（推广）”是本站的推广（邀请）链接，通过它注册或购买，本站可能获得佣金，不影响你支付的价格。详见
              <Link href="/disclosure" className="whitespace-nowrap text-[#7C3AED] hover:underline">推广合作与资料说明</Link>。
            </li>
          </ul>
        </section>

        {/* 其余品牌的优惠码 */}
        <section aria-labelledby="codes-heading" className="space-y-3">
          <h2 id="codes-heading" className="text-xl sm:text-2xl font-bold text-[#0F172A]">
            其余 {otherBrands.length} 家的优惠码
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            按本站品牌资料库的顺序排列，不是折扣或价格排名。优惠码由站长提供（清单日期 {PROMO_CODES_DATE}），站长说明都是 {PROMO_TERMS}，未逐项核验；每家下面的价格来自价格表，待核验。
          </p>
          <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {otherBrands.map((b) => {
              const promo = getPromoCode(b.id);
              return (
                <li key={b.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-3.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Link href={`/brands/${b.slug}`} className="inline-flex min-h-8 items-center text-sm font-bold text-[#0F172A] hover:text-[#7C3AED]">
                      {b.name}
                    </Link>
                    {b.aliases?.[0] && <span className="text-[12px] text-slate-500">{b.aliases[0]}</span>}
                    {b.isHistorical && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">历史资料</span>
                    )}
                  </div>
                  <div className="mt-1.5">
                    <PromoCodeView brandId={b.id} brandName={b.name} />
                  </div>
                  {promo?.note ? (
                    <p className="mt-1 text-[11px] leading-snug text-amber-800">{promo.note}</p>
                  ) : (
                    <p className="mt-1 text-[12px] font-semibold text-[#6955E8]">{PROMO_TERMS}</p>
                  )}
                  <p className="mt-1.5 flex-1 text-[12px] leading-snug text-slate-500">{priceLine(b.id)}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link
                      href={`/brands/${b.slug}`}
                      className="inline-flex min-h-8 items-center justify-center rounded-lg bg-[#7C3AED] px-3 text-xs font-semibold text-white hover:bg-[#6D28D9]"
                    >
                      资料页
                    </Link>
                    {b.affiliateUrl && (
                      <a
                        href={b.affiliateUrl}
                        target="_blank"
                        rel="sponsored nofollow noopener"
                        className="inline-flex min-h-8 items-center justify-center whitespace-nowrap rounded-lg border border-pink-200 bg-pink-50/60 px-3 text-xs font-semibold text-[#7C3AED] hover:bg-pink-50"
                      >
                        官网（推广）↗
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* 价格表算出来的结论：只看折扣 */}
        <section className="rounded-3xl border border-pink-100 bg-[#FFF9FD] p-5 sm:p-7 space-y-3">
          <h2 className="text-xl font-bold text-[#0F172A]">按价格表算出来的优惠之最（只看折扣，不是推荐）</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            这三项都由价格表算出，不含优惠码。按资料日 {dataDateRange} 的价格表：
          </p>
          <ul className="grid gap-3 sm:grid-cols-3 text-sm">
            <li className="rounded-2xl border border-pink-100 bg-white p-4">
              <span className="block text-[12px] font-bold uppercase tracking-wider text-[#7C3AED]">年付较月付省得最多</span>
              <span className="mt-1 block text-lg font-bold text-[#0F172A]">
                {topDiscount.brandName} <span className="text-base font-semibold text-[#6955E8]">省 {fmtPercent(topDiscount.saved)}</span>
              </span>
              <span className="block text-xs text-slate-500">
                {topDiscount.planName}：月付 {yuan(topDiscount.monthlyPrice)} × 12，年付 {yuan(topDiscount.price)}（{fmtZhe(topDiscount.saved)}）
              </span>
            </li>
            <li className="rounded-2xl border border-pink-100 bg-white p-4">
              <span className="block text-[12px] font-bold uppercase tracking-wider text-[#7C3AED]">长周期省得最多</span>
              <span className="mt-1 block text-lg font-bold text-[#0F172A]">
                {topBest.brandName} <span className="text-base font-semibold text-[#6955E8]">省 {fmtPercent(topBest.saved)}</span>
              </span>
              <span className="block text-xs text-slate-500">
                {topBest.planName} {topBest.cycleLabel} {yuan(topBest.price)} 一次付清（{fmtZhe(topBest.saved)}），折合 {perMonth(topBest.perMonth)}/月
              </span>
            </li>
            <li className="rounded-2xl border border-pink-100 bg-white p-4">
              <span className="block text-[12px] font-bold uppercase tracking-wider text-[#7C3AED]">¥120 以内的年付小包</span>
              <span className="mt-1 block text-lg font-bold text-[#0F172A]">
                {miniPacks.length} 个 <span className="text-base font-semibold text-[#6955E8]">{yuan(miniPacks[0].price)} 起</span>
              </span>
              <span className="block text-xs text-slate-500">
                最低 {miniPacks[0].brandName} {miniPacks[0].planName}，每月 {miniPacks[0].monthlyGB} GB；另有 {specials.length} 个学生版 / 限时 / 体验套餐
              </span>
            </li>
          </ul>
        </section>

        {/* 一、年付折扣 */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">一、年付优惠：{yearlyDiscounts.length} 家年付较月付省多少（从高到低）</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            每家取年付较同名套餐月付 × 12 省得最多的一档。这是官网标价本身的折扣，不需要优惠码；前提是用满一年，且要一次付清。
          </p>
          <DiscountTable rows={yearlyDiscounts} />
        </section>

        {/* 二、长周期 */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">二、长周期优惠：季付、半年付、两年付、三年付里省得最多的（前 15）</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            每家所有周期里较月付省得最多的一档。两年付、三年付折扣更大，但预付越久风险越大；只有少数品牌有两年付以上。
          </p>
          <DiscountTable rows={bestDiscounts} limit={15} />
        </section>

        {/* 三、年付小包 */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">三、¥120 以内的年付小包：{miniPacks.length} 个（从低到高）</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            年付小包多在 ¥79–¥120，每月 30–70 GB，折合每月几块钱，适合用量小、一年付一次的人；每 GB 并不便宜，不能和大流量档位直接比。
          </p>
          <PlanTable rows={miniPacks} priceLabel="年付实付" />
        </section>

        {/* 四、学生 / 限时 / 体验 */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">四、学生版、限时与体验套餐：资料标注的 {specials.length} 个</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            套餐名或备注里带“学生”“限时”“活动”“体验”“试用”的档位。是否仍在售、有没有附加条件（学生认证、限购一次），本站未核验，以官网为准。
          </p>
          <PlanTable rows={specials} priceLabel="实付" />
        </section>

        {/* 五、优惠码怎么用 */}
        <section className="rounded-3xl border border-amber-200 bg-amber-50/60 p-5 sm:p-7 space-y-3">
          <h2 className="text-xl font-bold text-[#0F172A] flex items-center">
            <ShieldAlert className="mr-2 h-5 w-5 text-amber-600" />
            五、机场优惠码怎么用，以及怎么判断优惠可不可信
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            优惠码有有效期、有适用档位、有首购与续费的区别，随时可能失效。本站收录的是站长提供的优惠码（清单日期 {PROMO_CODES_DATE}），站长说明折扣是 {PROMO_DISCOUNT_LABEL}、有效期{PROMO_VALIDITY_LABEL}；适用哪些套餐和周期、能不能和年付折扣叠加，站长没有说明，本站也没有逐项核验。用的时候这样核对：
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-sm text-slate-700 leading-relaxed">
            <li>在官网选好套餐和周期，进入结算页，输入优惠码。</li>
            <li>看结算页显示的最终付款金额，只比这个数字：是不是真的 {PROMO_DISCOUNT_LABEL}、对你选的套餐和周期有没有生效，以结算页为准。</li>
            <li>有效期是“{PROMO_VALIDITY_LABEL}”（站长说明），可以理解为只优惠一次；同一个账号用过之后还能不能再用，以结算页提示为准。</li>
            <li>码不被接受时，先核对大小写、套餐和周期；还不行就看官网公告或问客服。第三方页面贴出来的“独家优惠码”，先到结算页试一下再决定。</li>
            <li>首购价和续费价分开算：续费按原价的话，全年支出要重新算。</li>
            <li>
              页面有没有说明推广关系？本站的推广链接都标注了“推广”，见
              <Link href="/disclosure" className="whitespace-nowrap text-[#7C3AED] hover:underline">推广合作与资料说明</Link>。
            </li>
          </ol>
          <p className="text-sm text-slate-700 leading-relaxed">
            八折和减免怎么比、首购价和续费价怎么分开算，见
            <Link href="/blog/renewal-cost" className="text-[#7C3AED] hover:underline">《机场续费价与优惠怎么算？实际付款、适用条件与全年支出》</Link>；
            想按价格从低到高直接挑，见<Link href="/pianyi-jichang" className="text-[#7C3AED] hover:underline">便宜机场推荐</Link>。
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link href="/calculator" className="inline-flex items-center rounded-xl bg-[#7C3AED] px-4 py-2 text-xs font-semibold text-white hover:bg-[#6D28D9] transition-colors">
              把优惠价和续费价代进计算器
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">关于机场优惠的常见问题</h2>
          <FAQAccordion faqs={FAQS} />
        </section>

        {/* 数据说明 */}
        <section className="text-xs text-slate-500 leading-relaxed space-y-1 border-t border-pink-100 pt-6">
          <p>
            <strong className="text-slate-700">数据说明：</strong>本页的折扣和名次由本站价格表计算：省多少 = 1 −（长周期实付 ÷（同名套餐月付 × 月数）），只在同名套餐同时有月付和长周期价格时计算。资料日 {dataDateRange}，尚未在各官网结算页逐项核验。优惠码由站长提供（清单日期 {PROMO_CODES_DATE}），站长说明折扣为 {PROMO_DISCOUNT_LABEL}、有效期{PROMO_VALIDITY_LABEL}；适用套餐和周期没有说明，本站没有逐项核验，以官网结算页为准。只比较价格，不代表线路质量。
          </p>
          <p>
            <strong className="text-slate-700">推广说明：</strong>表中“官网（推广）”是本站的推广（邀请）链接，通过它注册或购买本站可能获得佣金，不影响你支付的价格；“本站优选”“本站推荐”和页首的“本站重点”是编辑推荐位，不等于优惠最大。
          </p>
        </section>
      </div>
    </div>
  );
}
