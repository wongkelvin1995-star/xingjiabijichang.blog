import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar } from 'lucide-react';
import { Article } from '@/types';
import { getArticleCover } from '@/data/articleCovers';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  // 封面、alt 与标签统一在 data/articleCovers.ts 维护；不展示任何浏览量数字
  const cover = getArticleCover(article);

  return (
    <article className="reveal group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-pink-100/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-pink-300 hover:shadow-xl hover:shadow-pink-500/10">
      {/* Anime Scenic Illustration */}
      <div className="relative w-full h-36 bg-[#0F172A] overflow-hidden">
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-108"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        
        {/* Category Pill Tag */}
        <div className="absolute top-2.5 left-2.5">
          <span className="rounded-md bg-white/95 backdrop-blur-md px-2 py-0.5 text-[11px] font-bold text-[#7C3AED] shadow-xs">
            {cover.tag}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Title */}
          <h3 className="text-sm sm:text-base font-bold text-[#0F172A] group-hover:text-[#7C3AED] transition-colors leading-snug line-clamp-2">
            <Link href={`/blog/${article.slug}`}>
              <span className="absolute inset-0" />
              {article.title}
            </Link>
          </h3>

          {/* Short Excerpt */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {article.summary}
          </p>
        </div>

        {/* Date, Read Time, and Read Full Link */}
        <div className="pt-2 border-t border-pink-50 flex items-center justify-between text-[12px] text-slate-500">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3 text-pink-400" />
            <span>{article.publishDate}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>约 {article.readTimeMinutes} 分钟</span>
            <span className="text-[#7C3AED] font-semibold flex items-center group-hover:translate-x-0.5 transition-transform">
              阅读全文 →
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
