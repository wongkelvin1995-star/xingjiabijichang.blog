'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpDown, Info } from 'lucide-react';

/**
 * 首页品牌目录：全部收录品牌默认一次性可见（不折叠、不分页），每个名称都链接到对应资料页。
 * 数据由服务端从价格表算好后传入（见 brandDirectoryData.ts），这里只做排序与筛选，不手写任何数字。
 */
export interface DirectoryEntry {
  id: string;
  slug: string;
  name: string;
  pinyin: string;
  /** 编辑部展示顺序：价格相同时按它排先后 */
  editorialOrder: number;
  aliases: string[];
  badge?: string;
  isHistorical?: boolean;
  /** 入门月付：实付最低的月付档（没有月付档则为 null） */
  entryMonthly: { price: number; totalGB: number; perGB: number } | null;
  cheapestYearly: { price: number; totalGB: number } | null;
  hasUnlimitedPack: boolean;
  /** 月付档里最大的每月流量（GB） */
  maxMonthlyGB: number;
  schemeCount: number;
  optionCount: number;
}

type SortKey = 'editorial' | 'entryPrice' | 'entryPerGB' | 'yearly' | 'pinyin';
type NeedKey = 'all' | 'monthly' | 'bigTraffic' | 'pack' | 'yearly';

const SORT_LABELS: Record<SortKey, string> = {
  editorial: '本站推荐顺序',
  entryPrice: '入门月付价格 低→高',
  pinyin: '拼音顺序',
  entryPerGB: '入门月付每 GB 低→高',
  yearly: '最低年付 低→高',
};

const NEEDS: { key: NeedKey; label: string; hint: string }[] = [
  { key: 'all', label: '全部', hint: '' },
  { key: 'monthly', label: '月付 ≤ ¥20', hint: '入门月付实付不超过 20 元' },
  { key: 'bigTraffic', label: '大流量（月付 ≥ 500GB）', hint: '至少有一档月付套餐每月 500GB 以上' },
  { key: 'pack', label: '有不限时流量包', hint: '价格表里有一次性流量包' },
  { key: 'yearly', label: '有年付', hint: '价格表里有年付档' },
];

function fmt(n: number): string {
  return Number.isInteger(n) ? `¥${n}` : `¥${n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}`;
}

export function BrandDirectory({
  entries,
  dataDateRange,
  pinnedId,
}: {
  entries: DirectoryEntry[];
  dataDateRange: string;
  /** 固定排在第一位的品牌（本站优选）；它不参与排序，但仍受筛选条件约束 */
  pinnedId?: string;
}) {
  // 默认按站长指定的推荐顺序（editorialOrder）；优选品牌固定第一
  const [sortKey, setSortKey] = useState<SortKey>('editorial');
  const [need, setNeed] = useState<NeedKey>('all');

  const list = useMemo(() => {
    const filtered = entries.filter((e) => {
      switch (need) {
        case 'monthly':
          return e.entryMonthly !== null && e.entryMonthly.price <= 20;
        case 'bigTraffic':
          return e.maxMonthlyGB >= 500;
        case 'pack':
          return e.hasUnlimitedPack;
        case 'yearly':
          return e.cheapestYearly !== null;
        default:
          return true;
      }
    });
    const val = (e: DirectoryEntry): number => {
      if (sortKey === 'entryPrice') return e.entryMonthly?.price ?? Infinity;
      if (sortKey === 'entryPerGB') return e.entryMonthly?.perGB ?? Infinity;
      if (sortKey === 'yearly') return e.cheapestYearly?.price ?? Infinity;
      return 0;
    };
    const sorted = filtered
      .filter((e) => e.id !== pinnedId)
      .sort((a, b) => {
        if (sortKey === 'pinyin') return a.pinyin.localeCompare(b.pinyin);
        if (sortKey === 'editorial') return a.editorialOrder - b.editorialOrder;
        const d = val(a) - val(b);
        // 价格相同：按编辑部展示顺序，再按拼音
        return d !== 0 ? d : a.editorialOrder - b.editorialOrder || a.pinyin.localeCompare(b.pinyin);
      });
    const pinned = filtered.find((e) => e.id === pinnedId);
    return pinned ? [pinned, ...sorted] : sorted;
  }, [entries, sortKey, need, pinnedId]);

  const hasPinned = list.length > 0 && list[0].id === pinnedId;

  return (
    <div className="space-y-4">
      {/* 控件 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="按需求筛选">
          {NEEDS.map((n) => (
            <button
              key={n.key}
              type="button"
              title={n.hint}
              onClick={() => setNeed(n.key)}
              className={`min-h-9 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                need === n.key
                  ? 'border-[#7C3AED] bg-[#7C3AED] text-white'
                  : 'border-pink-200 bg-white text-slate-700 hover:bg-pink-50'
              }`}
            >
              {n.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-600">
          <ArrowUpDown className="h-3.5 w-3.5 text-[#7C3AED]" />
          <span className="whitespace-nowrap">排序</span>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="min-h-9 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-[#7C3AED] focus:outline-none"
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                {SORT_LABELS[k]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="flex items-start gap-1.5 text-[12px] text-slate-500">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7C3AED]" />
        <span>
          显示 <strong className="text-slate-800">{list.length}</strong> / {entries.length} 家{hasPinned ? '，本站优选固定第一' : ''}，按“{SORT_LABELS[sortKey]}”排列{sortKey === 'editorial' ? '（展示顺序，不是价格排名）' : ''}。
          价格待核验（资料日 {dataDateRange}），只比较价格，不代表线路质量。
        </span>
      </p>

      {/* 目录 */}
      <ol className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((e, i) => (
          <li key={e.id}>
            <Link
              href={`/brands/${e.slug}`}
              className={`group flex h-full items-start gap-3 rounded-2xl border bg-white p-3.5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md ${
                e.id === pinnedId ? 'border-pink-400 hover:border-pink-500' : 'border-pink-100/90 hover:border-pink-300'
              }`}
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F5F7FB] text-[12px] font-bold text-slate-500 group-hover:bg-purple-50 group-hover:text-[#7C3AED]">
                {e.id === pinnedId ? '优' : sortKey === 'editorial' ? e.editorialOrder : sortKey === 'pinyin' ? e.name.slice(0, 1) : hasPinned ? i : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                  <span className="text-sm font-bold text-[#0F172A] group-hover:text-[#7C3AED]">{e.name}</span>
                  {e.aliases.length > 0 && (
                    <span className="text-[12px] text-slate-500">{e.aliases[0]}</span>
                  )}
                  {e.badge && (
                    <span className="rounded bg-[#0F172A] px-1.5 py-0.5 text-[11px] font-bold text-white">{e.badge}</span>
                  )}
                  {e.isHistorical && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">历史资料</span>
                  )}
                </span>
                {/* 允许在空格处折行；“· 年付 ¥99 起”整段一起换行，不会在“¥99”和“起”之间断开。
                    两段之间的空格放在 nowrap 外面，这样它才是真正的换行点（空格在 nowrap 里面就换不了行，窄卡片会撑出页面） */}
                <span className="mt-1 block text-[12px] leading-snug text-slate-500">
                  {e.entryMonthly
                    ? `入门月付 ${fmt(e.entryMonthly.price)} / ${e.entryMonthly.totalGB}GB（¥${e.entryMonthly.perGB.toFixed(3)}/GB）`
                    : '无月付档'}
                  {e.cheapestYearly && (
                    <>
                      {' '}
                      <span className="whitespace-nowrap">· 年付 {fmt(e.cheapestYearly.price)} 起</span>
                    </>
                  )}
                </span>
                <span className="mt-0.5 block text-[11px] text-slate-500">
                  {e.schemeCount} 个套餐方案 · {e.optionCount} 个价格选项
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      {list.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
          没有符合这个条件的品牌，换一个筛选试试。
        </p>
      )}
    </div>
  );
}
