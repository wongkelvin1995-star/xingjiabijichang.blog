import React from 'react';
import { Metadata } from 'next';
import { BRANDS } from '@/data/brands';
import { SITE_STATS, describeBrandCoverage } from '@/data/siteStats';
import { BrandCard } from '@/components/BrandCard';
import { PageHeroBanner } from '@/components/PageHeroBanner';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { absoluteUrl } from '@/data/site';

export const metadata: Metadata = {
  title: `机场品牌资料库：${SITE_STATS.brandCount} 家套餐价格与资料（2026）`,
  // 描述里列出展示顺序最靠前的几家（顺序以 brands.ts 的 editorialOrder 为准）
  description: `收录 ${SITE_STATS.brandCount} 家机场的套餐价格资料，含${BRANDS.slice(0, 3)
    .map((brand) => brand.name)
    .join('、')}等；每家一页，有价格位次与购买前核对，价格以官网为准。`,
  alternates: {
    canonical: absoluteUrl('/brands'),
  },
};

export default function BrandsPage() {
  return (
    <div className="space-y-8 pb-20">
      {/* 1. Dramatic Scenic Anime Hero Banner with Palace Moon Theme */}
      <PageHeroBanner
        bgImageSrc="/images/backgrounds/bg-palace-moon.jpg"
        badgeText={`性价比机场 · ${SITE_STATS.brandCount} 家品牌资料库`}
        badgeIcon={<Sparkles className="h-3.5 w-3.5 text-pink-400" />}
        h1Title={`机场品牌资料库：${SITE_STATS.brandCount} 家机场的套餐价格与资料`}
        subtitle={`${describeBrandCoverage()}；价格按各品牌官网公开页面整理（资料日 ${SITE_STATS.earliestDataDate} 至 ${SITE_STATS.latestDataDate}），待核验。按编辑部顺序排列，不是价格排名。`}
        breadcrumbs={[{ label: '机场推荐与品牌库' }]}
        scenicCaption="月色殿宇与骨干网络 · 满月高悬下的多节点网络互联"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* 栏目标题 + 一句简介（站长指定文案） */}
        <div className="pb-2 border-b border-pink-100">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] flex items-center">
            <span className="mr-2">🌸</span>
            <span>性价比机场对比</span>
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
            整理套餐价格、流量额度与线路信息，帮你按预算和使用需求选择。
          </p>
        </div>

        {/* Transparency Alert */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-950 flex items-start space-x-3">
          <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <span className="font-bold">推广与价格说明：</span>
            <p className="text-amber-800 leading-relaxed">
              本站部分注册链接属于推广链接。您通过这些链接购买后，我们可能获得服务商支付的推广佣金，但您不会因此承担额外费用，套餐也不会因您从本站进入购买而加价。
            </p>
            <p className="text-amber-800 leading-relaxed">
              我们不虚构价格，也不夸大优惠。文中套餐价格与活动信息均依据整理时可核实的官方信息，后续如有调整，请以对应购买页面的实时信息为准。
            </p>
            <p className="text-amber-800 leading-relaxed">
              本站不把“最便宜”直接等同于“最好”，也不做脱离使用场景的绝对排名。我们希望通过清楚的价格、线路与使用条件介绍，帮助您按实际需求和预算作出选择。
            </p>
          </div>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4.5 pt-2">
          {BRANDS.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      </div>
    </div>
  );
}
