'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Article } from '@/types';
import { ArticleCard } from '@/components/ArticleCard';
import { Search } from 'lucide-react';

interface BlogIndexClientProps {
  articles: Article[];
}

interface BlogIndexViewProps extends BlogIndexClientProps {
  initialKeyword?: string;
}

function BlogIndexView({ articles, initialKeyword = '' }: BlogIndexViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [keyword, setKeyword] = useState<string>(initialKeyword);

  const categories = [
    'all',
    '深度横评',
    '品牌评测',
    '选购指南',
    '成本分析',
    '技术科普',
    '流媒体与AI',
    '测速与风控',
  ];

  const filteredArticles = articles.filter((article) => {
    if (selectedCategory !== 'all' && article.category !== selectedCategory) {
      return false;
    }
    if (keyword.trim()) {
      const q = keyword.toLowerCase();
      const match =
        article.title.toLowerCase().includes(q) ||
        article.summary.toLowerCase().includes(q) ||
        article.tags.some((t) => t.toLowerCase().includes(q)) ||
        article.content.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#18243B] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat === 'all' ? '全部专栏' : cat}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索文章标题、关键词..."
              className="w-full sm:w-64 rounded-xl border border-slate-200 bg-[#F5F7FB] pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-[#6955E8]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            共筛选出 <strong className="text-[#18243B]">{filteredArticles.length}</strong> 篇原创深度文章
          </span>
          <span className="text-[12px] text-slate-500">
            文章整理自公开资料，购买前请以品牌官网当前页面为准
          </span>
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center text-slate-500">
          未检索到与当前关键词匹配的文章。
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 读取 URL 中的 ?q=，让 /blog?q=关键词 能直接显示搜索结果
 * （与 layout 中 WebSite 结构化数据的 SearchAction 保持一致）。
 */
function BlogIndexWithQuery({ articles }: BlogIndexClientProps) {
  const searchParams = useSearchParams();
  const q = searchParams?.get('q') ?? '';
  return <BlogIndexView key={q} articles={articles} initialKeyword={q} />;
}

export function BlogIndexClient({ articles }: BlogIndexClientProps) {
  // fallback 直接渲染完整文章列表，保证静态 HTML 中文章链接可被抓取
  return (
    <Suspense fallback={<BlogIndexView articles={articles} />}>
      <BlogIndexWithQuery articles={articles} />
    </Suspense>
  );
}
