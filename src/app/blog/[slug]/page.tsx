import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getArticleBySlug, getAllArticles } from '@/data/articles';
import { Breadcrumb } from '@/components/Breadcrumb';
import { FavoriteArticleButton } from '@/components/user/UserActions';
import { VisitRecorder } from '@/components/user/VisitRecorder';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { ArticleCard } from '@/components/ArticleCard';
import { getArticleCover } from '@/data/articleCovers';
import {
  Calendar,
  List,
  Calculator,
} from 'lucide-react';
import { absoluteUrl } from '@/data/site';
import { SITE_STATS } from '@/data/siteStats';

interface Props {
  params: Promise<{ slug: string }>;
}

// 静态导出：只生成 generateStaticParams 列出的文章页；没有列出的网址（不存在的文章）没有对应文件，
// 托管平台会返回 out/404.html 和 404 状态码，不会出现“软 404”。
export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllArticles().map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  // 不存在的文章：标题沿用 404 文案，并明确 noindex，和服务器返回的 404 页保持一致
  if (!article) return { title: '文章未找到', robots: { index: false, follow: true } };

  const cover = getArticleCover(article);
  const url = absoluteUrl(`/blog/${article.slug}`);
  const image = {
    url: cover.src,
    alt: cover.alt,
    ...(cover.width && cover.height ? { width: cover.width, height: cover.height } : {}),
  };

  return {
    // 直接使用文章自己的 SEO 标题（absolute：不再追加站点后缀，避免标题过长被截断）
    title: { absolute: article.seoTitle },
    description: article.metaDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: article.seoTitle,
      description: article.metaDescription,
      url,
      siteName: '性价比机场',
      locale: 'zh_CN',
      type: 'article',
      publishedTime: `${article.publishDate}T00:00:00+08:00`,
      modifiedTime: `${article.modifiedDate}T00:00:00+08:00`,
      authors: [article.author.name],
      tags: article.tags,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.seoTitle,
      description: article.metaDescription,
      images: [cover.src],
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  // 延伸阅读：按标签重合度 + 同分类优先，只推荐内容确实相关的文章
  const relatedArticles = getAllArticles()
    .filter((a) => a.slug !== article.slug)
    .map((a, index) => ({
      a,
      index,
      score:
        a.tags.filter((t) => article.tags.includes(t)).length * 2 + (a.category === article.category ? 1 : 0),
    }))
    .sort((x, y) => y.score - x.score || x.index - y.index)
    .slice(0, 4)
    .map((x) => x.a);
  const cover = getArticleCover(article);
  const HUB_SLUG = 'airport-plan-price-comparison';

  // Article JSON-LD Schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.h1,
    name: article.title,
    description: article.metaDescription,
    url: absoluteUrl(`/blog/${article.slug}`),
    datePublished: `${article.publishDate}T00:00:00+08:00`,
    dateModified: `${article.modifiedDate}T00:00:00+08:00`,
    inLanguage: 'zh-CN',
    articleSection: article.category,
    keywords: article.tags.join('，'),
    image: [absoluteUrl(cover.src)],
    // 作者是站长本人（署名“凯文”，网名 wongkelvin1995，介绍见关于页），不编造职称和资历
    author: {
      '@type': 'Person',
      name: article.author.name,
      alternateName: 'wongkelvin1995',
      url: absoluteUrl('/about#author'),
    },
    publisher: {
      '@type': 'Organization',
      name: '性价比机场',
      url: absoluteUrl('/'),
      logo: { '@type': 'ImageObject', url: absoluteUrl('/icon.svg') },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(`/blog/${article.slug}`),
    },
    wordCount: article.wordCount,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {/* 个人中心的阅读记录：纯客户端写入本浏览器，不渲染内容，不影响静态输出 */}
      <VisitRecorder kind="article" id={article.slug} />

      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: '文章专栏', href: '/blog' },
          { label: article.title },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-6">
        {/* Main Article Body (8 cols) */}
        <article className="lg:col-span-8 space-y-6">
          {/* Header */}
          <header className="space-y-4 pb-6 border-b border-pink-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-purple-50 px-3 py-1 text-xs font-semibold text-[#7C3AED] border border-purple-100">
                {article.category}
              </span>
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                字数：约 {article.wordCount} 汉字
              </span>
              <span className="rounded-lg bg-pink-50 px-2.5 py-1 text-xs font-medium text-pink-700 border border-pink-100">
                阅读时长：约 {article.readTimeMinutes} 分钟
              </span>
            </div>

            {/* H1 Title */}
            <h1 className="text-2xl sm:text-4xl font-black text-[#0F172A] tracking-tight leading-[1.25]">
              {article.h1}
            </h1>

            {/* Summary Callout */}
            <div className="rounded-2xl border border-pink-100 bg-[#FFF9FD] p-4 text-xs sm:text-sm text-slate-700 leading-relaxed shadow-xs">
              <strong className="text-[#7C3AED] font-semibold block mb-1">
                本文导读：
              </strong>
              {article.summary}
            </div>

            {/* Author info & Dates */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-slate-500">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F172A] text-white font-bold text-xs">
                  {article.author.name.slice(0, 1)}
                </div>
                <div>
                  <Link href="/about#author" className="font-semibold text-slate-800 block py-1 hover:text-[#7C3AED]">
                    {article.author.name}
                  </Link>
                  <span className="text-[12px] text-slate-500">
                    {article.author.role}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-slate-500">
                <span className="flex items-center">
                  <Calendar className="mr-1 h-3.5 w-3.5" />
                  发布于 <time dateTime={article.publishDate} className="ml-1">{article.publishDate}</time>
                </span>
                <span className="flex items-center text-slate-600 font-medium">
                  更新于 <time dateTime={article.modifiedDate} className="ml-1">{article.modifiedDate}</time>
                </span>
                <FavoriteArticleButton slug={article.slug} />
              </div>
            </div>
          </header>

          {/* Mobile TOC Accordion */}
          <div className="lg:hidden rounded-2xl border border-slate-200 bg-[#F5F7FB] p-4 text-xs">
            <details>
              <summary className="font-bold text-[#18243B] cursor-pointer flex min-h-10 items-center justify-between">
                <span className="flex items-center">
                  <List className="mr-1.5 h-4 w-4 text-[#6955E8]" />
                  展开本篇目录（共 {article.toc.length} 节）
                </span>
                <span className="text-[#6955E8]">查看</span>
              </summary>
              <ul className="mt-3 space-y-1.5 pt-2 border-t border-slate-200">
                {article.toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="inline-block py-1 text-slate-600 hover:text-[#6955E8] hover:underline"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          </div>

          {/* Article Main Markdown Content */}
          <div className="prose prose-slate max-w-none">
            <MarkdownRenderer content={article.content} />
          </div>

          {/* Tags */}
          <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              主题标签:
            </span>
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Action Callout inside article */}
          <div className="rounded-3xl border border-purple-200 bg-gradient-to-r from-purple-50 via-white to-blue-50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#6955E8] uppercase tracking-wider block">
                性价比机场 · 成本计算器
              </span>
              <p className="text-sm sm:text-base font-bold text-[#18243B]">
                把你手头的套餐代入计算器，看看折算后的每 GB 成本
              </p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <Link
                href="/calculator"
                className="inline-flex items-center rounded-xl bg-[#6955E8] px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-[#5642D8] transition-colors"
              >
                <Calculator className="mr-1.5 h-3.5 w-3.5" />
                立即计算
              </Link>
              <Link
                href="/#comparison-table"
                className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                查看比较表
              </Link>
            </div>
          </div>
        </article>

        {/* Sidebar (4 cols) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Desktop Sticky Table of Contents */}
          <div className="hidden lg:block sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <List className="h-4 w-4 text-[#6955E8]" />
              <h3 className="text-sm font-bold text-[#18243B]">
                本文目录
              </h3>
            </div>
            <nav className="space-y-2 text-xs">
              {article.toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block text-slate-600 hover:text-[#6955E8] hover:translate-x-1 transition-all leading-snug py-1"
                >
                  {item.title}
                </a>
              ))}
            </nav>
          </div>

          {/* 相关工具与专题（对所有文章都适用的三个入口） */}
          <div className="rounded-2xl border border-slate-200 bg-[#F5F7FB] p-5 space-y-3 text-xs">
            <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider block">
              配套工具与专题
            </span>
            <Link
              href="/calculator"
              className="block p-3 rounded-xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-xs transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#18243B] group-hover:text-[#6955E8]">
                  套餐成本计算器
                </span>
                <span className="text-slate-500 group-hover:text-[#6955E8]">→</span>
              </div>
              <p className="text-[12px] text-slate-500 mt-1">
                输入付款金额、标称流量与倍率，算出折算后的每 GB 成本
              </p>
            </Link>

            <Link
              href="/pianyi-jichang"
              className="block p-3 rounded-xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-xs transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#18243B] group-hover:text-[#6955E8]">
                  便宜机场榜单
                </span>
                <span className="text-slate-500 group-hover:text-[#6955E8]">→</span>
              </div>
              <p className="text-[12px] text-slate-500 mt-1">
                {SITE_STATS.brandCount} 家机场按月付、每 GB、年付价格从低到高排序
              </p>
            </Link>

            {article.slug !== HUB_SLUG && (
              <Link
                href={`/blog/${HUB_SLUG}`}
                className="block p-3 rounded-xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-xs transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#18243B] group-hover:text-[#6955E8]">
                    机场套餐价格怎么比
                  </span>
                  <span className="text-slate-500 group-hover:text-[#6955E8]">→</span>
                </div>
                <p className="text-[12px] text-slate-500 mt-1">
                  月付、年付、每 GB 成本与续费价格的统一比较方法
                </p>
              </Link>
            )}

            <Link
              href="/brands"
              className="block p-3 rounded-xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-xs transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#18243B] group-hover:text-[#6955E8]">
                  品牌套餐资料
                </span>
                <span className="text-slate-500 group-hover:text-[#6955E8]">→</span>
              </div>
              <p className="text-[12px] text-slate-500 mt-1">
                已收录品牌的公开套餐信息（价格待核验，以官网为准）
              </p>
            </Link>
          </div>
        </aside>
      </div>

      {/* Related Articles Footer */}
      <section className="mt-16 pt-12 border-t border-pink-100 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#0F172A]">
            延伸阅读
          </h2>
          <Link
            href="/blog"
            className="inline-flex min-h-9 items-center text-xs font-semibold text-[#7C3AED] hover:underline"
          >
            查看全部 {getAllArticles().length} 篇文章 →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {relatedArticles.map((ra) => (
            <ArticleCard key={ra.slug} article={ra} />
          ))}
        </div>
      </section>
    </div>
  );
}
