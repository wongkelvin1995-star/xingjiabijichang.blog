'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { COMPARE_MIN, getStatus, toggleFavArticle, toggleFavBrand, useUserCenter } from '@/lib/userCenterStore';
import { CompareToggleButton } from '../UserActions';
import type { SectionProps } from '../types';
import { Empty, FlashLine, Invalid, Pill, btn, fmtDate, inputCls, useFlash, yuan } from '../ui';

type Kind = 'brand' | 'article';
type BrandFilter = 'all' | 'current' | 'historical';

const chip = (active: boolean) =>
  `inline-flex min-h-8 items-center whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold cursor-pointer transition-colors ${
    active ? 'bg-[#7C3AED] text-white' : 'border border-pink-200 bg-white text-slate-700 hover:bg-pink-50'
  }`;

const BRAND_FILTERS: { id: BrandFilter; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'current', label: '现行资料' },
  { id: 'historical', label: '历史资料' },
];

/** 我的收藏：收藏的机场 / 文章，支持分类筛选、查找、排序、查看详情、取消收藏 */
export function Favorites({ data, lookups, go }: SectionProps) {
  const uc = useUserCenter();
  const { flash, ok, err } = useFlash();
  const [kind, setKind] = useState<Kind>('brand');
  const [brandFilter, setBrandFilter] = useState<BrandFilter>('all');
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');
  const { brandById, articleBySlug, planById } = lookups;

  const needle = q.trim().toLowerCase();
  const byTime = (a: { at: string }, b: { at: string }) => (order === 'desc' ? b.at.localeCompare(a.at) : a.at.localeCompare(b.at));

  const brands = uc.favBrands
    .map((f) => ({ f, b: brandById.get(f.id) }))
    .filter(({ b }) => brandFilter === 'all' || (b ? (brandFilter === 'historical') === b.isHistorical : false))
    .filter(({ b }) => !needle || (b ? b.name.toLowerCase().includes(needle) || b.tagline.toLowerCase().includes(needle) : true))
    .sort((x, y) => byTime(x.f, y.f));

  // 文章分类只列出收藏里实际出现过的
  const cats = useMemo(() => {
    const s = new Set<string>();
    for (const f of uc.favArticles) {
      const a = articleBySlug.get(f.slug);
      if (a) s.add(a.category);
    }
    return [...s];
  }, [uc.favArticles, articleBySlug]);
  const activeCat = cats.includes(cat) ? cat : 'all';

  const articles = uc.favArticles
    .map((f) => ({ f, a: articleBySlug.get(f.slug) }))
    .filter(({ a }) => activeCat === 'all' || (a ? a.category === activeCat : false))
    .filter(({ a }) => !needle || (a ? a.title.toLowerCase().includes(needle) : true))
    .sort((x, y) => byTime(x.f, y.f));

  const unfavBrand = (id: string, name: string) => (toggleFavBrand(id) ? ok(`已取消收藏 ${name}`) : err(getStatus().lastError ?? '保存失败，请重试'));
  const unfavArticle = (slug: string) => (toggleFavArticle(slug) ? ok('已取消收藏这篇文章') : err(getStatus().lastError ?? '保存失败，请重试'));
  const filtering = needle !== '' || (kind === 'brand' ? brandFilter !== 'all' : activeCat !== 'all');

  return (
    <div className="space-y-4">
      {/* 类型切换 + 查找 / 排序 */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="收藏类型">
          <button type="button" role="tab" aria-selected={kind === 'brand'} onClick={() => setKind('brand')} className={chip(kind === 'brand')}>
            收藏的机场（{uc.favBrands.length}）
          </button>
          <button type="button" role="tab" aria-selected={kind === 'article'} onClick={() => setKind('article')} className={chip(kind === 'article')}>
            收藏的文章（{uc.favArticles.length}）
          </button>
        </div>
        <div className="flex min-w-0 gap-2">
          <label className="sr-only" htmlFor="fav-q">
            按名称查找
          </label>
          <input
            id="fav-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="按名称查找"
            className={`${inputCls} min-h-9 flex-1 text-xs md:w-44 md:flex-none`}
          />
          <label className="sr-only" htmlFor="fav-order">
            排序
          </label>
          <select
            id="fav-order"
            value={order}
            onChange={(e) => setOrder(e.target.value as 'desc' | 'asc')}
            className="min-h-9 shrink-0 rounded-xl border border-slate-200 bg-white px-2 text-xs text-slate-800"
          >
            <option value="desc">最近收藏在前</option>
            <option value="asc">最早收藏在前</option>
          </select>
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="分类筛选">
        <span className="whitespace-nowrap text-[11px] text-slate-500">筛选：</span>
        {kind === 'brand'
          ? BRAND_FILTERS.map((f) => (
              <button key={f.id} type="button" aria-pressed={brandFilter === f.id} onClick={() => setBrandFilter(f.id)} className={chip(brandFilter === f.id)}>
                {f.label}
              </button>
            ))
          : ['all', ...cats].map((c) => (
              <button key={c} type="button" aria-pressed={activeCat === c} onClick={() => setCat(c)} className={chip(activeCat === c)}>
                {c === 'all' ? '全部' : c}
              </button>
            ))}
      </div>

      <FlashLine flash={flash} />

      {kind === 'brand' ? (
        brands.length === 0 ? (
          filtering ? (
            <Empty title="没有符合筛选条件的收藏" text="换一个筛选条件，或清空查找词。" />
          ) : (
            <Empty
              icon={<Heart className="h-5 w-5" />}
              title="还没有收藏任何机场"
              text="在品牌资料库或品牌页点“收藏”，它们会出现在这里；收藏只保存在当前浏览器。"
              links={[
                { href: '/brands', label: '浏览机场' },
                { href: '/pianyi-jichang', label: '便宜机场榜单' },
              ]}
            />
          )
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {brands.map(({ f, b }) => {
              if (!b) {
                return (
                  <li key={f.id} className="min-w-0 rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                    <Invalid text={`这条收藏对应的品牌（${f.id}）已不在本站资料里，可能已下线。`} onRemove={() => unfavBrand(f.id, f.id)} removeLabel="移除这条收藏" />
                  </li>
                );
              }
              const entry = b.entryPlanId ? planById.get(b.entryPlanId) : undefined;
              return (
                <li key={f.id} className="flex min-w-0 flex-col gap-2 rounded-2xl border border-pink-100 bg-white p-4 shadow-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Link href={`/brands/${b.slug}`} className="text-sm font-bold text-[#0F172A] hover:text-[#7C3AED]">
                      {b.name}
                    </Link>
                    {b.id === data.featuredBrandId && <Pill tone="night">本站优选</Pill>}
                    {b.isHistorical && <Pill tone="slate">历史资料·不代表在售</Pill>}
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500">{b.tagline}</p>
                  <div className="rounded-xl bg-[#F5F7FB] px-3 py-2 text-xs">
                    {entry ? (
                      <>
                        <span className="text-slate-500">入门月付 </span>
                        <strong className="text-[#6D28D9]">{yuan(entry.price)}</strong>
                        <span className="text-slate-500"> · {entry.monthlyGB !== null ? `每月 ${entry.monthlyGB} GB` : `共 ${entry.totalGB} GB`}</span>
                        <span className="block text-[10px] text-slate-500">价格资料更新于 {entry.dataDate}，购买前以官网为准</span>
                      </>
                    ) : (
                      <span className="text-slate-500">暂无月付档价格资料{b.dataDate ? `（资料日 ${b.dataDate}）` : ''}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500">收藏于 {fmtDate(f.at)}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Link href={`/brands/${b.slug}`} className={btn.primary}>
                      查看详情
                    </Link>
                    {b.entryPlanId && <CompareToggleButton planId={b.entryPlanId} label="入门月付加入对比" />}
                    <button type="button" onClick={() => unfavBrand(f.id, b.name)} className={btn.danger}>
                      取消收藏
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )
      ) : articles.length === 0 ? (
        filtering ? (
          <Empty title="没有符合筛选条件的收藏" text="换一个分类，或清空查找词。" />
        ) : (
          <Empty
            icon={<Heart className="h-5 w-5" />}
            title="还没有收藏任何文章"
            text="在文章页点“收藏文章”，它们会出现在这里；收藏只保存在当前浏览器。"
            links={[
              { href: '/guide', label: '阅读指南' },
              { href: '/blog', label: '文章专栏' },
            ]}
          />
        )
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {articles.map(({ f, a }) => (
            <li key={f.slug} className={`flex min-w-0 flex-col gap-2 rounded-2xl border p-4 ${a ? 'border-pink-100 bg-white shadow-xs' : 'border-amber-200 bg-amber-50/60'}`}>
              {a ? (
                <>
                  <Link href={`/blog/${a.slug}`} className="text-sm font-bold leading-snug text-[#0F172A] hover:text-[#7C3AED]">
                    {a.title}
                  </Link>
                  <p className="line-clamp-2 text-[11px] text-slate-500">{a.summary}</p>
                  <p className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                    <Pill tone="purple">{a.category}</Pill>
                    <span>更新于 {a.modifiedDate}</span>
                    <span>· 收藏于 {fmtDate(f.at)}</span>
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Link href={`/blog/${a.slug}`} className={btn.primary}>
                      阅读
                    </Link>
                    <button type="button" onClick={() => unfavArticle(f.slug)} className={btn.danger}>
                      取消收藏
                    </button>
                  </div>
                </>
              ) : (
                <Invalid text={`这条收藏对应的文章（${f.slug}）已不存在。`} onRemove={() => unfavArticle(f.slug)} removeLabel="移除这条收藏" />
              )}
            </li>
          ))}
        </ul>
      )}

      {uc.compare.length >= COMPARE_MIN && (
        <button type="button" onClick={() => go('compare')} className={btn.link}>
          对比里已有 {uc.compare.length} 个套餐，去对比 →
        </button>
      )}
    </div>
  );
}
