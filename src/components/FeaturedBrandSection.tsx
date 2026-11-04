import React from 'react';
import Link from 'next/link';
import { ArrowRight, ExternalLink, Star } from 'lucide-react';
import { getFeaturedBrand } from '@/data/brands';
import { buildFeaturedBlock } from '@/data/brandFacts';
import { getSheetStats, fmtYuan } from '@/data/priceStats';

/**
 * 首页“本站优选”独立推荐区（服务端组件）。
 * 适合谁 / 推荐依据 / 购买前限制 / 来源与核对日期全部由价格表现算（brandFacts.ts），不手写数字；
 * 购买入口放在依据和限制之后，并写明推广关系。
 */
export function FeaturedBrandSection() {
  const brand = getFeaturedBrand();
  if (!brand) return null;
  const block = buildFeaturedBlock(brand);
  const stats = getSheetStats(brand.id);

  return (
    <section id="featured" aria-labelledby="featured-heading" className="scroll-mt-20">
      <div className="reveal rounded-3xl border border-purple-200 bg-gradient-to-br from-white via-[#FBF7FF] to-[#FFF1F7] p-5 sm:p-8 shadow-md shadow-purple-500/5 space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-[#0F172A] px-3 py-0.5 text-xs font-semibold text-white">
              <Star className="h-3.5 w-3.5 text-pink-300" />
              <span>本站优选 · 推广合作</span>
            </p>
            <h2 id="featured-heading" className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
              本站优选：{brand.name}套餐与适用条件
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">{brand.tagline}</p>
          </div>
          <p className="text-[12px] text-slate-500 sm:text-right">
            价格资料日 {block.dataDate} · 待核验
            {stats?.entryMonthly && (
              <span className="block">入门月付 {fmtYuan(stats.entryMonthly.price)} / {stats.entryMonthly.totalGB}GB</span>
            )}
          </p>
        </div>

        {/* 只放“适合谁”和“为什么”，购买前的限制在资料页的核对清单里 */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 space-y-1.5">
            <h3 className="text-sm font-bold text-emerald-800">适合这些用户</h3>
            <ul className="list-disc pl-4 space-y-1 text-xs leading-relaxed text-slate-700">
              {block.fitFor.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-purple-100 bg-white p-4 space-y-1.5">
            <h3 className="text-sm font-bold text-[#18243B]">推荐依据（由价格表计算）</h3>
            <ul className="space-y-1.5 text-xs leading-relaxed text-slate-700">
              {block.reasons.map((r) => (
                <li key={r.title}>
                  <strong className="text-[#18243B]">{r.title}：</strong>
                  {r.detail}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-purple-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-slate-500 sm:max-w-xl">
            {block.sourceLine}。“优选”是推荐位，不等于价格最低；本站使用{brand.name}的推广链接，可能获得佣金，不影响你的价格。
            详见<Link href="/disclosure" className="whitespace-nowrap text-[#7C3AED] hover:underline">推广合作与资料说明</Link>。
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/brands/${brand.slug}#plans`}
              className="inline-flex items-center justify-center rounded-xl bg-[#7C3AED] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#6D28D9] transition-colors"
            >
              <span>查看{brand.name}套餐</span>
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
            <Link
              href={`/brands/${brand.slug}`}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 hover:border-pink-300 hover:bg-pink-50/40 transition-colors"
            >
              查看完整资料
            </Link>
            {brand.affiliateUrl && (
              <a
                href={brand.affiliateUrl}
                target="_blank"
                rel="sponsored nofollow noopener"
                className="inline-flex items-center justify-center rounded-xl border border-pink-200 bg-pink-50/60 px-4 py-2.5 text-xs font-semibold text-[#7C3AED] hover:bg-pink-100 transition-colors"
              >
                <span>官网注册（推广链接）</span>
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
