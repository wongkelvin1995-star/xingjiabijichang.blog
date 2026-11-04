'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, ArrowRight } from 'lucide-react';
import { ARTICLES } from '@/data/articles';
import { BRANDS } from '@/data/brands';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');

  // Handle ESC and Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const normalizedQuery = query.trim().toLowerCase();

  const filteredArticles = normalizedQuery
    ? ARTICLES.filter(
        (a) =>
          a.title.toLowerCase().includes(normalizedQuery) ||
          a.summary.toLowerCase().includes(normalizedQuery) ||
          a.tags.some((t) => t.toLowerCase().includes(normalizedQuery)) ||
          a.content.toLowerCase().includes(normalizedQuery)
      )
    : ARTICLES.slice(0, 3);

  const filteredBrands = normalizedQuery
    ? BRANDS.filter(
        (b) =>
          b.name.toLowerCase().includes(normalizedQuery) ||
          b.pinyin.includes(normalizedQuery) ||
          (b.aliases ?? []).some((a) => a.toLowerCase().includes(normalizedQuery)) ||
          b.tagline.toLowerCase().includes(normalizedQuery) ||
          b.description.toLowerCase().includes(normalizedQuery)
      )
    : BRANDS;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-slate-900/60 backdrop-blur-xs modal-backdrop-in">
      <div
        className="modal-panel-in w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-slate-200 px-4 py-3">
          <Search className="h-5 w-5 text-[#6955E8]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索品牌名（中文/英文/拼音）或文章..."
            className="w-full bg-transparent px-3 text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-hidden"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-500 hover:text-slate-600 rounded-md"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-500 hover:bg-slate-200"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[65vh] overflow-y-auto p-4 space-y-6">
          {/* Quick Shortcuts when empty */}
          {!normalizedQuery && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                常用检索词与工具
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '套餐成本计算器', href: '/calculator' },
                  { label: 'IEPL 专线解析', href: '/blog/iepl-iplc-relay-direct-line-guide' },
                  { label: 'ChatGPT 节点选择', href: '/blog/nodes-for-chatgpt-youtube-streaming' },
                  { label: '月付 vs 年付', href: '/blog/monthly-vs-yearly-vs-pay-as-you-go' },
                  { label: '灵动云套餐资料', href: '/brands/lingdongyun' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className="inline-flex items-center rounded-lg bg-[#EAF3FF] px-2.5 py-1 text-xs font-medium text-[#6955E8] hover:bg-purple-100 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Brands Section */}
          {filteredBrands.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>收录品牌资料 ({filteredBrands.length})</span>
                <Link
                  href="/brands"
                  onClick={onClose}
                  className="text-xs text-[#6955E8] hover:underline"
                >
                  查看全部
                </Link>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredBrands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/brands/${brand.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/40 transition-all group"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-[#18243B] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {brand.name.slice(0, 1)}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-sm font-semibold text-slate-900 group-hover:text-[#6955E8]">
                            {brand.name}
                          </span>
                          {(brand.badge || brand.isHistorical) && (
                            <span className="text-[11px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                              {brand.badge || '历史资料'}
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-slate-500 truncate">
                          {brand.tagline}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#6955E8] shrink-0 ml-1" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Articles Section */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>{normalizedQuery ? `匹配文章 (${filteredArticles.length})` : '精选深度专栏'}</span>
              <Link
                href="/blog"
                onClick={onClose}
                className="text-xs text-[#6955E8] hover:underline"
              >
                全部专栏
              </Link>
            </p>
            {filteredArticles.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-500">
                未找到与 “{query}” 相关的文章或技术解析。
              </div>
            ) : (
              <div className="space-y-2">
                {filteredArticles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/blog/${article.slug}`}
                    onClick={onClose}
                    className="block p-3 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/40 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium text-[#6955E8] bg-purple-50 px-2 py-0.5 rounded">
                            {article.category}
                          </span>
                          <span className="text-xs text-slate-500">
                            {article.readTimeMinutes} 分钟阅读
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-900 group-hover:text-[#6955E8] transition-colors">
                          {article.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {article.summary}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#6955E8] shrink-0 ml-3 mt-1" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer info in modal */}
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-xs text-slate-500 flex items-center justify-between">
          <span>性价比机场·站内文章与品牌检索</span>
          <span className="text-[12px] text-slate-500">按 ESC 即可关闭搜索窗口</span>
        </div>
      </div>
    </div>
  );
}
