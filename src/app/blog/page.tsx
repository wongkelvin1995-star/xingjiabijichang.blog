import React from 'react';
import { Metadata } from 'next';
import { ARTICLES } from '@/data/articles';
import { BlogIndexClient } from '@/components/BlogIndexClient';
import { PageHeroBanner } from '@/components/PageHeroBanner';
import { BookOpen } from 'lucide-react';
import { absoluteUrl } from '@/data/site';

export const metadata: Metadata = {
  title: '文章专栏｜机场套餐价格、流量倍率与选购指南',
  description:
    `性价比机场专栏收录 ${ARTICLES.length} 篇中文原创文章：价格对比、流量倍率与每 GB 成本、优惠与续费、100GB 流量估算、购买前核对、预算与线路科普。`,
  alternates: {
    canonical: absoluteUrl('/blog'),
  },
};

export default function BlogPage() {
  return (
    <div className="space-y-8 pb-20">
      {/* 1. Dramatic Scenic Anime Hero Banner with Canal Lanterns Theme */}
      <PageHeroBanner
        bgImageSrc="/images/backgrounds/bg-canal-lanterns.jpg"
        badgeText="性价比机场 · 原创选购知识库"
        badgeIcon={<BookOpen className="h-3.5 w-3.5 text-pink-400" />}
        h1Title="性价比机场专栏：套餐价格、流量倍率与选购指南"
        subtitle="套餐价格、流量倍率、续费成本、用量估算和线路科普：机场选购时要核对的关键信息。内容为公开资料整理，购买前以官网为准。"
        breadcrumbs={[{ label: '原创专栏' }]}
        scenicCaption="江户水乡与暖光灯街 · 石拱古桥与柳絮拂水"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Interactive Blog List Component */}
        <BlogIndexClient articles={ARTICLES} />
      </div>
    </div>
  );
}
