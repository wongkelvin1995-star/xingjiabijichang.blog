'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, FileText, History as HistoryIcon, Trash2, X } from 'lucide-react';
import { HISTORY_MAX, type HistoryEntry, type HistoryKind, clearHistory, getStatus, removeHistory, setHistoryEnabled, useUserCenter } from '@/lib/userCenterStore';
import type { SectionProps } from '../types';
import { Card, Empty, FlashLine, InlineConfirm, Pill, Switch, btn, dayLabel, fmtRelative, useFlash, useNow } from '../ui';

type Filter = 'all' | HistoryKind;

const chip = (active: boolean) =>
  `inline-flex min-h-8 items-center whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold cursor-pointer transition-colors ${
    active ? 'bg-[#7C3AED] text-white' : 'border border-pink-200 bg-white text-slate-700 hover:bg-pink-50'
  }`;

/** 阅读记录：按最近阅读时间列出浏览过的品牌页 / 文章；可继续阅读、删除单条、清空、关闭记录 */
export function History({ lookups }: SectionProps) {
  const uc = useUserCenter();
  const now = useNow();
  const { flash, ok, err, info } = useFlash();
  const [filter, setFilter] = useState<Filter>('all');
  const { brandById, articleBySlug } = lookups;

  const brandCount = uc.history.filter((h) => h.kind === 'brand').length;
  const articleCount = uc.history.length - brandCount;
  const entries = uc.history
    .filter((h) => filter === 'all' || h.kind === filter)
    .slice()
    .sort((a, b) => b.at.localeCompare(a.at));

  // 按天分组
  const groups = entries.reduce<{ label: string; items: HistoryEntry[] }[]>((acc, h) => {
    const label = dayLabel(h.at, now);
    const last = acc[acc.length - 1];
    if (last && last.label === label) last.items.push(h);
    else acc.push({ label, items: [h] });
    return acc;
  }, []);

  const resolve = (h: HistoryEntry): { title: string; href: string; sub: string } | null => {
    if (h.kind === 'brand') {
      const b = brandById.get(h.key);
      return b ? { title: b.name, href: `/brands/${b.slug}`, sub: `${b.tagline}${b.dataDate ? ` · 价格资料更新于 ${b.dataDate}` : ''}` } : null;
    }
    const a = articleBySlug.get(h.key);
    return a ? { title: a.title, href: `/blog/${a.slug}`, sub: `${a.category} · 更新于 ${a.modifiedDate}` } : null;
  };

  const toggle = (next: boolean) => {
    if (!setHistoryEnabled(next)) {
      err(getStatus().lastError ?? '保存失败，设置没有生效');
      return;
    }
    if (next) ok('已开启阅读记录：之后打开品牌页和文章会记在这里');
    else info('已关闭阅读记录：之后的浏览不再写入；已有记录保留，可随时清空');
  };
  const remove = (h: HistoryEntry, title: string) => (removeHistory(h.kind, h.key) ? ok(`已删除记录：${title}`) : err(getStatus().lastError ?? '删除失败，请重试'));
  const clear = () => (clearHistory() ? ok('已清空阅读记录') : err(getStatus().lastError ?? '清空失败，请重试'));

  return (
    <div className="space-y-4">
      {/* 开关 + 清空 */}
      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 text-xs leading-relaxed text-slate-600">
          <p className="text-sm font-semibold text-[#0F172A]">记录开关</p>
          <p>
            {uc.historyEnabled
              ? `打开品牌页或文章时记一条，同一内容只保留最近一次，最多 ${HISTORY_MAX} 条；仅保存在当前浏览器，不上传。`
              : '已关闭：之后打开品牌页和文章不会再写入记录。下面保留的是关闭前的记录，可以逐条删除或清空。'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Switch id="history-switch" checked={uc.historyEnabled} onChange={toggle} label={uc.historyEnabled ? '正在记录' : '已关闭记录'} />
          {uc.history.length > 0 && (
            <InlineConfirm
              label="清空记录"
              confirmLabel={`确认清空 ${uc.history.length} 条`}
              hint="不可恢复"
              onConfirm={clear}
              icon={<Trash2 className="h-3.5 w-3.5" />}
            />
          )}
        </div>
      </Card>

      {/* 类型筛选 */}
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="记录类型">
        <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')} className={chip(filter === 'all')}>
          全部（{uc.history.length}）
        </button>
        <button type="button" aria-pressed={filter === 'brand'} onClick={() => setFilter('brand')} className={chip(filter === 'brand')}>
          机场（{brandCount}）
        </button>
        <button type="button" aria-pressed={filter === 'article'} onClick={() => setFilter('article')} className={chip(filter === 'article')}>
          文章（{articleCount}）
        </button>
      </div>

      <FlashLine flash={flash} />

      {entries.length === 0 ? (
        uc.history.length === 0 ? (
          <Empty
            icon={<HistoryIcon className="h-5 w-5" />}
            title={uc.historyEnabled ? '还没有阅读记录' : '没有阅读记录，且记录已关闭'}
            text={uc.historyEnabled ? '打开品牌页或文章后，这里会按最近阅读时间列出，方便回来接着看。' : '打开上方开关后，之后的浏览才会记在这里。'}
            links={[
              { href: '/brands', label: '浏览机场' },
              { href: '/guide', label: '阅读指南' },
              { href: '/blog', label: '文章专栏' },
            ]}
          />
        ) : (
          <Empty title="这一类还没有记录" text="切换到“全部”查看其他记录。" />
        )
      ) : (
        <div className="space-y-4">
          {groups.map((g) => (
            <section key={g.label} aria-label={g.label}>
              <h3 className="mb-1.5 px-1 text-[11px] font-semibold tracking-wider text-slate-500">{g.label}</h3>
              <ul className="divide-y divide-slate-100 rounded-2xl border border-pink-100 bg-white shadow-xs">
                {g.items.map((h) => {
                  const item = resolve(h);
                  const Icon = h.kind === 'brand' ? Building2 : FileText;
                  return (
                    <li key={`${h.kind}-${h.key}`} className="flex items-start gap-3 px-3 py-3">
                      <span className="mt-0.5 shrink-0 rounded-lg bg-purple-50 p-1.5 text-[#7C3AED]">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        {item ? (
                          <>
                            <Link href={item.href} className="block truncate py-1 text-sm font-semibold text-[#0F172A] hover:text-[#7C3AED]">
                              {item.title}
                            </Link>
                            <p className="truncate text-[11px] text-slate-500">{item.sub}</p>
                          </>
                        ) : (
                          <p className="break-all text-xs text-amber-800">这条记录对应的内容（{h.key}）已不在本站。</p>
                        )}
                        <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                          <Pill tone={h.kind === 'brand' ? 'purple' : 'pink'}>{h.kind === 'brand' ? '机场' : '文章'}</Pill>
                          <span className="whitespace-nowrap">{fmtRelative(h.at, now)}</span>
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center">
                        {item && (
                          <Link href={item.href} className={btn.secondary}>
                            继续阅读
                          </Link>
                        )}
                        <button type="button" onClick={() => remove(h, item?.title ?? h.key)} aria-label={`删除记录：${item?.title ?? h.key}`} className={btn.danger}>
                          <X className="h-3.5 w-3.5" /> 删除
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
