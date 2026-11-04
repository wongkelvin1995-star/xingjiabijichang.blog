'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, FileText, Heart, History as HistoryIcon, Pencil, Scale, SlidersHorizontal } from 'lucide-react';
import { COMPARE_MAX, COMPARE_MIN, HISTORY_MAX, useUserCenter } from '@/lib/userCenterStore';
import type { SectionProps } from '../types';
import { Avatar, Card, Pill, avatarLetterOf, btn, fmtRelative, useNow, yuan } from '../ui';
import { BILLING } from './Preferences';

/** 账户概览：资料卡、真实数量、最近收藏 / 阅读、对比与偏好的入口 */
export function Overview({ lookups, go }: SectionProps) {
  const uc = useUserCenter();
  const now = useNow();
  const { brandById, articleBySlug, planById } = lookups;
  const favCount = uc.favBrands.length + uc.favArticles.length;
  const nothingYet = favCount === 0 && uc.compare.length === 0 && uc.history.length === 0 && !uc.prefs;

  const resolve = (kind: 'brand' | 'article', key: string): { title: string; href: string } | null => {
    if (kind === 'brand') {
      const b = brandById.get(key);
      return b ? { title: b.name, href: `/brands/${b.slug}` } : null;
    }
    const a = articleBySlug.get(key);
    return a ? { title: a.title, href: `/blog/${a.slug}` } : null;
  };

  const recentFavs = [
    ...uc.favBrands.map((f) => ({ kind: 'brand' as const, key: f.id, at: f.at })),
    ...uc.favArticles.map((f) => ({ kind: 'article' as const, key: f.slug, at: f.at })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 4);
  const recentReads = uc.history.slice(0, 4);

  return (
    <div className="space-y-5">
      {/* 资料卡 */}
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar letter={avatarLetterOf(uc)} color={uc.avatarColor} size="xl" />
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-[#0F172A]">{uc.nickname || '访客'}</p>
            <p className="truncate text-xs text-slate-500">{uc.email || '未填写邮箱（可选）'}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Pill tone="amber">仅保存在当前浏览器</Pill>
              <Pill tone="slate">无账号 · 不上传</Pill>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <button type="button" onClick={() => go('account')} className={btn.secondary}>
            <Pencil className="h-3.5 w-3.5" /> 编辑资料
          </button>
          <button type="button" onClick={() => go('favorites')} className={btn.secondary}>
            <Heart className="h-3.5 w-3.5" /> 查看收藏
          </button>
          <button type="button" onClick={() => go('compare')} className={btn.primary}>
            <Scale className="h-3.5 w-3.5" /> 继续对比{uc.compare.length > 0 ? `（${uc.compare.length}/${COMPARE_MAX}）` : ''}
          </button>
        </div>
      </Card>

      {/* 真实数量 */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon={Building2} label="收藏的机场" value={String(uc.favBrands.length)} hint="点击查看" onClick={() => go('favorites')} />
        <Stat icon={FileText} label="收藏的文章" value={String(uc.favArticles.length)} hint="点击查看" onClick={() => go('favorites')} />
        <Stat
          icon={Scale}
          label="对比中的套餐"
          value={`${uc.compare.length} / ${COMPARE_MAX}`}
          hint={uc.compare.length >= COMPARE_MIN ? '可以开始对比' : `至少 ${COMPARE_MIN} 个才能对比`}
          onClick={() => go('compare')}
        />
        <Stat
          icon={HistoryIcon}
          label="阅读记录"
          value={uc.historyEnabled ? String(uc.history.length) : '已关闭'}
          hint={uc.historyEnabled ? `最多保留 ${HISTORY_MAX} 条` : '不再记录新的浏览'}
          onClick={() => go('history')}
        />
      </div>

      {nothingYet ? (
        <Card tone="info" className="space-y-3 text-sm text-slate-700">
          <p className="font-semibold text-[#0F172A]">这个浏览器里还没有任何资料，可以从这几步开始：</p>
          <ol className="list-decimal space-y-1.5 pl-5 text-xs leading-relaxed">
            <li>
              到
              <Link href="/brands" className="text-[#7C3AED] hover:underline">
                品牌资料库
              </Link>
              或品牌页点“收藏”，把想看的机场存起来。
            </li>
            <li>
              在品牌页的套餐表或首页
              <Link href="/#comparison-table" className="text-[#7C3AED] hover:underline">
                对比表
              </Link>
              里点“对比”，选 {COMPARE_MIN}–{COMPARE_MAX} 个套餐放在一起看。
            </li>
            <li>读几篇选购指南；浏览过的品牌页和文章会出现在“阅读记录”里，方便回来接着看。</li>
          </ol>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link href="/brands" className={btn.primary}>
              浏览机场
            </Link>
            <Link href="/guide" className={btn.secondary}>
              阅读指南
            </Link>
            <Link href="/blog" className={btn.secondary}>
              文章专栏
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <h3 className="text-sm font-bold text-[#0F172A]">最近收藏</h3>
            {recentFavs.length === 0 ? (
              <p className="mt-1 text-xs text-slate-500">
                还没有收藏。到
                <Link href="/brands" className="text-[#7C3AED] hover:underline">
                  品牌资料库
                </Link>
                看看。
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-slate-100">
                {recentFavs.map((r) => {
                  const item = resolve(r.kind, r.key);
                  return (
                    <li key={`${r.kind}-${r.key}`} className="flex items-center justify-between gap-3 py-2 text-xs">
                      {item ? (
                        <Link href={item.href} className="min-w-0 truncate py-1 font-semibold text-[#0F172A] hover:text-[#7C3AED]">
                          {item.title}
                        </Link>
                      ) : (
                        <span className="min-w-0 truncate text-slate-400">资料已不存在（{r.key}）</span>
                      )}
                      <span className="shrink-0 whitespace-nowrap text-[10px] text-slate-500">{fmtRelative(r.at, now)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
            <button type="button" onClick={() => go('favorites')} className={`${btn.link} mt-3`}>
              查看全部收藏 →
            </button>
          </Card>

          <Card>
            <h3 className="text-sm font-bold text-[#0F172A]">最近阅读</h3>
            {!uc.historyEnabled && uc.history.length === 0 ? (
              <p className="mt-1 text-xs text-slate-500">阅读记录已关闭，不再记录新的浏览。</p>
            ) : recentReads.length === 0 ? (
              <p className="mt-1 text-xs text-slate-500">还没有记录。打开品牌页或文章后会出现在这里。</p>
            ) : (
              <ul className="mt-2 divide-y divide-slate-100">
                {recentReads.map((h) => {
                  const item = resolve(h.kind, h.key);
                  return (
                    <li key={`${h.kind}-${h.key}`} className="flex items-center justify-between gap-3 py-2 text-xs">
                      {item ? (
                        <Link href={item.href} className="min-w-0 truncate py-1 font-semibold text-[#0F172A] hover:text-[#7C3AED]">
                          {item.title}
                        </Link>
                      ) : (
                        <span className="min-w-0 truncate text-slate-400">内容已不存在（{h.key}）</span>
                      )}
                      <span className="shrink-0 whitespace-nowrap text-[10px] text-slate-500">{fmtRelative(h.at, now)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
            <button type="button" onClick={() => go('history')} className={`${btn.link} mt-3`}>
              管理阅读记录 →
            </button>
          </Card>

          <Card>
            <h3 className="text-sm font-bold text-[#0F172A]">对比中的套餐</h3>
            {uc.compare.length === 0 ? (
              <p className="mt-1 text-xs text-slate-500">对比里还没有套餐。</p>
            ) : (
              <ul className="mt-2 space-y-1 text-xs">
                {uc.compare.map((id) => {
                  const p = planById.get(id);
                  return (
                    <li key={id} className="truncate text-slate-700">
                      {p ? `${p.brandName} · ${p.planName} · ${p.cycleLabel} ${yuan(p.price)}` : <span className="text-slate-400">套餐已失效（{id}）</span>}
                    </li>
                  );
                })}
              </ul>
            )}
            <button type="button" onClick={() => go('compare')} className={`mt-3 ${uc.compare.length >= COMPARE_MIN ? btn.primary : btn.secondary}`}>
              {uc.compare.length >= COMPARE_MIN ? '打开对比表' : '去选套餐'}
            </button>
          </Card>

          <Card>
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#0F172A]">
              <SlidersHorizontal className="h-4 w-4 text-[#7C3AED]" /> 需求偏好
            </h3>
            {uc.prefs ? (
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                预算 {uc.prefs.budgetMin !== null || uc.prefs.budgetMax !== null ? `${uc.prefs.budgetMin ?? 0}–${uc.prefs.budgetMax ?? '不限'} 元/月` : '未设置'}
                {' · '}预计流量 {uc.prefs.monthlyGB !== null ? `${uc.prefs.monthlyGB} GB/月` : '未设置'}
                {' · '}设备 {uc.prefs.devices !== null ? `${uc.prefs.devices} 台` : '未设置'}
                {' · '}计费 {uc.prefs.billing.length ? uc.prefs.billing.map((b) => BILLING.find((x) => x.id === b)?.label).join(' / ') : '未设置'}
                <span className="block text-[11px] text-slate-500">更新于 {fmtRelative(uc.prefsUpdatedAt ?? '', now)}</span>
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">还没有设置。填好预算和用量后可以按条件过滤套餐。</p>
            )}
            <button type="button" onClick={() => go('prefs')} className={`${btn.secondary} mt-3`}>
              {uc.prefs ? '修改偏好' : '去设置偏好'}
            </button>
          </Card>
        </div>
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-w-0 cursor-pointer rounded-2xl border border-pink-100 bg-white p-4 text-left shadow-xs transition-colors hover:border-pink-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED]"
    >
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
        <Icon className="h-3.5 w-3.5 shrink-0 text-[#7C3AED]" />
        <span className="whitespace-nowrap">{label}</span>
      </div>
      <div className="mt-0.5 truncate text-xl font-bold text-[#0F172A]">{value}</div>
      <div className="truncate text-[11px] text-slate-500">{hint}</div>
    </button>
  );
}
