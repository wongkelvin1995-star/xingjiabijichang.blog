import React from 'react';
import Link from 'next/link';
import { ArrowRight, Users } from 'lucide-react';
import { buildFitGroups } from '@/data/userFit';
import { BRANDS, RECOMMENDED_BRAND_IDS } from '@/data/brands';
import { SITE_STATS } from '@/data/siteStats';
import { spotlightEntryMonthly } from '@/data/cheapRankings';

/** 推荐品牌名称，按推荐顺序，例如“灵动云、暮光加速、微风网络、飞猫云” */
const RECOMMENDED_NAMES = RECOMMENDED_BRAND_IDS.map((id) => BRANDS.find((b) => b.id === id)?.name)
  .filter(Boolean)
  .join('、');

function yuan(n: number): string {
  return Number.isInteger(n) ? `¥${n}` : `¥${n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}`;
}

/**
 * “用户注册”：本站的推广（邀请）链接，新窗口打开；同一页有很多个，所以 aria-label 里带上品牌名。
 * 没有推广链接的品牌留一个同宽的空位，保证每行的价格和按钮都对齐。
 */
function RegisterLink({ brandName, href }: { brandName: string; href: string | null }) {
  if (!href) return <span aria-hidden className="w-[4.25rem] shrink-0" />;
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored nofollow noopener"
      aria-label={`${brandName} 用户注册（推广链接，新窗口打开）`}
      className="inline-flex min-h-8 w-[4.25rem] shrink-0 items-center justify-center rounded-lg border border-purple-200 bg-purple-50 text-[12px] font-semibold text-[#6D28D9] transition-colors hover:border-purple-300 hover:bg-purple-100"
    >
      用户注册
    </a>
  );
}

/**
 * “不在这几类里”卡片里的“本站重点”品牌：取每家实付最低的月付档，按价格从低到高排，同价按本站顺序。
 * 顺序由价格算出来（见 data/cheapRankings.ts 的 spotlightEntryMonthly），不是手写的名次。
 */
const SPOTLIGHT = spotlightEntryMonthly();

/**
 * 首页核心板块：什么样的用户适合什么价位的机场（服务端组件）。
 * 每组：适合谁 → 挑选规则 → 候选套餐（优选品牌固定第一并标注，其余按价格表实时排序）→ 注意事项。
 */
export function UserFitSection() {
  const groups = buildFitGroups();
  const dateRange =
    SITE_STATS.earliestDataDate === SITE_STATS.latestDataDate
      ? SITE_STATS.latestDataDate
      : `${SITE_STATS.earliestDataDate} 至 ${SITE_STATS.latestDataDate}`;

  return (
    <section id="fit" aria-labelledby="fit-heading" className="space-y-4 scroll-mt-20">
      <div className="flex items-center justify-between pb-2 border-b border-pink-100">
        <div>
          <h2 id="fit-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] flex items-center">
            <Users className="mr-2 h-5 w-5 text-[#7C3AED]" />
            <span>什么样的用户，适合什么价位的机场</span>
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            先对号入座，再看候选。每组前几行是本站推荐品牌（{RECOMMENDED_NAMES}）的档位，其余按价格表排序（资料日 {dateRange}，待核验）；只比较价格，不代表线路质量。
          </p>
        </div>
        <Link
          href="/blog/100gb-traffic-guide"
          className="ml-3 hidden sm:inline-flex min-h-9 shrink-0 items-center whitespace-nowrap text-xs font-semibold text-[#7C3AED] hover:text-[#EC4899] transition-colors"
        >
          <span>不知道自己用多少？</span>
          <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((g) => (
          <article key={g.id} className="reveal flex flex-col rounded-2xl border border-pink-100/90 bg-white p-4 sm:p-5 shadow-xs">
            <h3 className="text-base font-bold text-[#0F172A]">{g.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{g.who}</p>
            <p className="mt-2 text-[12px] text-slate-500">
              <span className="font-semibold text-slate-700">挑选规则：</span>
              {g.rule}
            </p>

            <ol className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-100">
              {g.picks.map((p) => (
                <li key={`${p.brandId}-${p.planName}-${p.cycle}`} className="flex items-center gap-3 px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                      <Link href={`/brands/${p.brandSlug}`} className="inline-flex min-h-7 items-center text-sm font-bold text-[#0F172A] hover:text-[#7C3AED]">
                        {p.brandName}
                      </Link>
                      {p.featured ? (
                        <span className="rounded bg-[#0F172A] px-1.5 py-0.5 text-[11px] font-bold text-white">本站优选</span>
                      ) : p.recommended ? (
                        <span className="rounded bg-[#7C3AED] px-1.5 py-0.5 text-[11px] font-bold text-white">本站推荐</span>
                      ) : null}
                      <span className="text-[12px] text-slate-500">{p.planName} · {p.cycleLabel}</span>
                    </div>
                    <div className="mt-0.5 text-[12px] text-slate-500">
                      {p.monthlyGB !== null
                        ? `每月 ${p.monthlyGB} GB${p.cycle !== 'm' ? `（周期共 ${p.totalGB} GB）` : ''}`
                        : `共 ${p.totalGB} GB，用完为止`}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-bold text-[#6955E8]">{yuan(p.price)}</div>
                    <div className="text-[11px] text-slate-500">¥{p.perGB.toFixed(3)}/GB</div>
                  </div>
                  <RegisterLink brandName={p.brandName} href={p.affiliateUrl} />
                </li>
              ))}
            </ol>

            {/* 提醒贴在卡片底部：同一行的几张卡片，“注意”对齐 */}
            <div className="mt-auto space-y-2 pt-3">
              {g.featuredNote && <p className="text-[12px] leading-relaxed text-amber-800">{g.featuredNote}</p>}
              <p className="text-[12px] leading-relaxed text-slate-500">
                <span className="font-semibold text-slate-700">注意：</span>
                {g.caution}
              </p>
            </div>
          </article>
        ))}

        {/* 第六格：导向目录与计算器。中间放“本站重点 8 家”：入门月付从低到高，卡片被网格拉高时也不会留一大块空白 */}
        <div className="reveal flex flex-col justify-between gap-4 rounded-2xl border border-dashed border-purple-200 bg-purple-50/40 p-4 sm:p-5">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">不在这几类里？</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                到目录按“月付 ≤ ¥20 / 大流量 / 有流量包 / 有年付”筛选，或先用计算器代入自己的用量和倍率。推荐位不等于价格最低，真实位次见各资料页。
              </p>
            </div>

            <div>
              <h4 className="text-[12px] font-semibold text-slate-700">
                本站重点 {SPOTLIGHT.length} 家：入门月付从低到高（同价按本站顺序）
              </h4>
              <ol className="mt-1 divide-y divide-purple-100 rounded-lg bg-white/70">
                {SPOTLIGHT.map((p, i) => (
                  <li key={p.brandId} className="flex items-center justify-between gap-2.5 px-2.5">
                    <span className="flex min-w-0 flex-wrap items-center gap-x-1.5">
                      <span className="w-4 text-[12px] tabular-nums text-slate-500">{i + 1}.</span>
                      <Link href={`/brands/${p.brandSlug}`} className="inline-flex min-h-7 items-center text-sm font-bold text-[#0F172A] hover:text-[#7C3AED]">
                        {p.brandName}
                      </Link>
                      {p.featured ? (
                        <span className="rounded bg-[#0F172A] px-1.5 py-0.5 text-[11px] font-bold text-white">本站优选</span>
                      ) : p.recommended ? (
                        <span className="rounded bg-[#7C3AED] px-1.5 py-0.5 text-[11px] font-bold text-white">本站推荐</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-right text-[12px] tabular-nums text-slate-600">
                      <strong className="text-sm font-bold text-[#6955E8]">{yuan(p.price)}</strong>
                      /月{p.monthlyGB !== null ? ` · ${p.monthlyGB}GB` : ''}
                    </span>
                    <RegisterLink brandName={p.brandName} href={p.affiliateUrl} />
                  </li>
                ))}
              </ol>
              <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
                顺序由价格算出，不是手写名次。资料日 {dateRange}，待核验。完整榜单：
                <Link href="/pianyi-jichang" className="mx-1 font-semibold text-[#7C3AED] hover:underline">便宜机场榜单</Link>
                <Link href="/jichang-youhui" className="mx-1 font-semibold text-[#7C3AED] hover:underline">机场优惠汇总</Link>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="#brands" className="inline-flex min-h-9 items-center rounded-xl bg-[#7C3AED] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#6D28D9] transition-colors">
              按需求筛选目录
            </a>
            <Link href="/calculator" className="inline-flex min-h-9 items-center rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 hover:border-pink-300 transition-colors">
              算算我的每 GB 成本
            </Link>
          </div>
        </div>
      </div>

      <p className="text-[12px] leading-relaxed text-slate-500">
        表中“用户注册”是本站的推广（邀请）链接，通过它注册或购买，本站可能获得佣金，不影响你支付的价格；没有显示“用户注册”的品牌，本站没有它的推广链接。详见
        <Link href="/disclosure" className="whitespace-nowrap text-[#7C3AED] hover:underline">推广合作与资料说明</Link>。
      </p>
    </section>
  );
}
