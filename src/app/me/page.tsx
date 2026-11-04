import React from 'react';
import type { Metadata } from 'next';
import { BRANDS, FEATURED_BRAND_ID } from '@/data/brands';
import { getPlansByBrand } from '@/data/plans';
import { ARTICLES } from '@/data/articles';
import { getSheetStats } from '@/data/priceStats';
import { SITE_STATS } from '@/data/siteStats';
import { SOCIAL_LINKS } from '@/data/site';
import { PageHeroBanner } from '@/components/PageHeroBanner';
import { UserCenter } from '@/components/user/UserCenter';
import type { MeData } from '@/components/user/types';
import { UserCircle } from 'lucide-react';

/**
 * 个人中心：没有账号系统，所有数据只保存在访客自己的浏览器里（见 lib/userCenterStore.ts）。
 * - 私人页面：noindex/nofollow，不进 sitemap（sitemap.ts 里没有列出它）。
 * - 这里只把公开的品牌/套餐/文章快照和真实的联系渠道传给客户端组件，用来把浏览器里保存的 ID 还原成可读信息。
 */
export const metadata: Metadata = {
  title: '个人中心：收藏、机场对比、阅读记录与设置',
  description: '保存在本浏览器里的机场收藏、套餐对比、需求偏好与阅读记录；本站没有账号系统，数据不上传。',
  robots: { index: false, follow: false },
};

const CYCLE_MONTHS: Record<string, number> = { monthly: 1, quarterly: 3, semiannual: 6, yearly: 12, biennial: 24, triennial: 36, unlimited: 0 };

function buildData(): MeData {
  const brands = BRANDS.map((b) => {
    const plans = getPlansByBrand(b.id);
    const entry = plans.find((p) => p.isEntryPlan) ?? null;
    return {
      id: b.id,
      slug: b.slug,
      name: b.name,
      tagline: b.tagline,
      isHistorical: !!b.isHistorical,
      dataDate: getSheetStats(b.id)?.dataDate ?? '',
      entryPlanId: entry?.id ?? null,
    };
  });
  const plans = BRANDS.flatMap((b) =>
    getPlansByBrand(b.id).map((p) => ({
      id: p.id,
      brandId: p.brandId,
      brandName: p.brandName,
      brandSlug: b.slug,
      planName: p.planName,
      cycle: p.billingCycle,
      cycleLabel: p.billingCycleLabel,
      price: p.actualPrice,
      monthlyGB: p.monthlyGB,
      totalGB: p.trafficGB,
      perMonthLabel: p.perMonthLabel,
      savingsLabel: p.savingsLabel,
      resetRule: p.trafficResetRule,
      deviceLimit: p.deviceLimit,
      multiplier: p.trafficMultiplier,
      lineInfo: p.lineInfo,
      dataDate: p.dataDate,
      nominalPerGB: p.nominalPerGB,
      months: CYCLE_MONTHS[p.billingCycle] ?? 0,
    })),
  );
  const articles = ARTICLES.map((a) => ({
    slug: a.slug,
    title: a.title,
    category: a.category,
    publishDate: a.publishDate,
    modifiedDate: a.modifiedDate,
    summary: a.summary,
  }));
  const dataDateRange =
    SITE_STATS.earliestDataDate === SITE_STATS.latestDataDate
      ? SITE_STATS.latestDataDate
      : `${SITE_STATS.earliestDataDate} 至 ${SITE_STATS.latestDataDate}`;
  return {
    brands,
    plans,
    articles,
    featuredBrandId: FEATURED_BRAND_ID,
    dataDateRange,
    contact: { email: SOCIAL_LINKS.email, telegram: SOCIAL_LINKS.telegram },
  };
}

export default function MePage() {
  const data = buildData();
  return (
    <div className="pb-16">
      <PageHeroBanner
        bgImageSrc="/images/backgrounds/bg-canal-lanterns.jpg"
        badgeText="个人中心 · 仅保存在当前浏览器"
        badgeIcon={<UserCircle className="h-3.5 w-3.5 text-pink-400" />}
        h1Title="个人中心：收藏、机场对比、阅读记录与设置"
        subtitle="把想看的机场和文章收藏起来，挑 2–4 个套餐放在同一口径下对比，回头从阅读记录接着看。本站没有账号系统，这里的数据只保存在你的浏览器里，不会上传。"
        breadcrumbs={[{ label: '个人中心' }]}
        scenicCaption="运河灯笼 · 夜色水巷"
      />
      <UserCenter data={data} />
    </div>
  );
}
