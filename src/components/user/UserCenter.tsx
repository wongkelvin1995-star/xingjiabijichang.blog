'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { AlertTriangle, Bell, Heart, History as HistoryIcon, LayoutDashboard, Lock, MessageSquare, Pencil, Scale, Settings, SlidersHorizontal } from 'lucide-react';
import { COMPARE_MAX, COMPARE_MIN, useUserCenter, useUserCenterStatus } from '@/lib/userCenterStore';
import type { Lookups, MeData, MePlan, Tab } from './types';
import { Avatar, Skeleton, avatarLetterOf, btn } from './ui';
import { Overview } from './sections/Overview';
import { Favorites } from './sections/Favorites';
import { Compare } from './sections/Compare';
import { Preferences } from './sections/Preferences';
import { History } from './sections/History';
import { Feedback } from './sections/Feedback';
import { Messages } from './sections/Messages';
import { Account } from './sections/Account';

/**
 * 个人中心（/me）的客户端外壳：
 * - 桌面端（lg 及以上）左侧账户卡 + 竖排栏目导航，整列吸顶；右侧内容。
 * - 手机 / 平板顶部账户卡，下面是吸附在站点页头正下方的横向胶囊导航：滚动时始终可见，切换栏目后可以直接再切。
 *   导航和账户卡同在 <aside> 里，手机端 aside 用 display: contents，让它们成为外层 flex 列的直接子项：
 *   sticky 元素的包含块是它的父容器（grid 子项则只是自己所在的网格区域，无法吸顶），所以手机端必须是 flex 列，桌面端才用 grid。
 * - 所有个人数据来自 lib/userCenterStore（仅当前浏览器的 localStorage）；data 只是公开资料快照，用来把 id 还原成名字。
 * - 栏目用 URL hash 深链接（/me#compare 等），切换时 replaceState，不产生历史记录。
 */

const TABS: { id: Tab; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: '账户概览', desc: '本浏览器里保存的资料、收藏、对比与阅读记录一览。', icon: LayoutDashboard },
  { id: 'favorites', label: '我的收藏', desc: '收藏的机场与文章，可筛选、查看详情、取消收藏。', icon: Heart },
  { id: 'compare', label: '机场对比', desc: `把 ${COMPARE_MIN}–${COMPARE_MAX} 个套餐放在同一口径下逐项对比，缺的资料写“待核验”。`, icon: Scale },
  { id: 'prefs', label: '需求偏好', desc: '记录预算、用量等条件，按条件过滤套餐；不生成匹配分。', icon: SlidersHorizontal },
  { id: 'history', label: '阅读记录', desc: '最近浏览过的机场与文章，可继续阅读、删除或关闭记录。', icon: HistoryIcon },
  { id: 'feedback', label: '评论与反馈', desc: '本站没有评论系统；纠错和建议请走邮件或 Telegram 群。', icon: MessageSquare },
  { id: 'messages', label: '消息与订阅', desc: '本站没有站内消息和邮件提醒；这里只列公开的更新动态。', icon: Bell },
  { id: 'account', label: '账户设置', desc: '昵称、头像、本地邮箱，以及本浏览器数据的导出、导入与清除。', icon: Settings },
];
const TAB_IDS = TABS.map((t) => t.id);

/** 站点页头（sticky top-0）的实测高度，取不到时用 65px */
const DEFAULT_HEADER_H = 65;

/* ---------- 当前栏目 = URL hash（外部存储，不用 effect 里 setState） ---------- */
const hashListeners = new Set<() => void>();
let fallbackTab: Tab | null = null; // replaceState 被禁止时的内存兜底
function subscribeHash(cb: () => void): () => void {
  hashListeners.add(cb);
  window.addEventListener('hashchange', cb);
  window.addEventListener('popstate', cb);
  // 站内 <Link> 跳转（例如点顶部的“个人中心”从 /me#history 回到 /me）用 pushState，不会触发上面两个事件；
  // 支持 Navigation API 的浏览器用 currententrychange 补上，这样地址栏和当前栏目始终一致。不支持的浏览器保持当前栏目。
  const navApi = (window as unknown as { navigation?: EventTarget }).navigation;
  navApi?.addEventListener('currententrychange', cb);
  return () => {
    hashListeners.delete(cb);
    window.removeEventListener('hashchange', cb);
    window.removeEventListener('popstate', cb);
    navApi?.removeEventListener('currententrychange', cb);
  };
}
function readTab(): Tab {
  if (fallbackTab) return fallbackTab;
  const h = window.location.hash.replace('#', '');
  return TAB_IDS.includes(h as Tab) ? (h as Tab) : 'overview';
}
function useTab(): [Tab, (t: Tab) => void] {
  const tab = useSyncExternalStore<Tab>(subscribeHash, readTab, () => 'overview');
  const go = (t: Tab) => {
    try {
      window.history.replaceState(null, '', `#${t}`);
      fallbackTab = null;
    } catch {
      fallbackTab = t;
    }
    for (const l of hashListeners) l();
  };
  return [tab, go];
}

/** 站点页头的高度：手机上栏目导航吸附在它的正下方；页头高度变化（例如展开手机菜单）时跟着变。 */
function useSiteHeaderHeight(): number {
  const [h, setH] = useState(DEFAULT_HEADER_H);
  useEffect(() => {
    // 页面里第一个 <header> 就是站点页头（本组件自己的 <header> 在它后面）
    const el = document.querySelector('header');
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setH(Math.round(el.getBoundingClientRect().height) || DEFAULT_HEADER_H));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return h;
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function UserCenter({ data }: { data: MeData }) {
  const uc = useUserCenter();
  const st = useUserCenterStatus();
  const [tab, setTab] = useTab();
  const headerH = useSiteHeaderHeight();
  const contentRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const pillsRef = useRef<HTMLUListElement>(null);
  // 用户点过栏目之后，胶囊居中才带动画；页面刚打开（包括水合时栏目从默认值变成 hash 指定的栏目）直接就位，不要滑一下
  const userMoved = useRef(false);

  /**
   * 把内容区滚到“标题刚好露在页头（和手机上的吸顶导航）下面”。
   * 只在需要时滚：标题被页头 / 吸顶导航挡住，或位于视口 60% 以下；已经看得见就不动，避免页面无谓跳动。
   */
  const scrollToContent = useCallback((behavior: ScrollBehavior) => {
    const el = contentRef.current;
    if (!el) return;
    const siteHeader = document.querySelector('header');
    const nav = navRef.current;
    const navSticky = !!nav && window.getComputedStyle(nav).position === 'sticky';
    const covered = (siteHeader ? siteHeader.getBoundingClientRect().bottom : 0) + (navSticky && nav ? nav.getBoundingClientRect().height : 0);
    const top = el.getBoundingClientRect().top;
    if (top < covered || top > window.innerHeight * 0.6) {
      // 注意：<html> 带 scroll-smooth，behavior: 'auto' 会变成平滑滚动，所以“不要动画”必须明确写 'instant'
      window.scrollTo({ top: Math.max(0, window.scrollY + top - covered - 12), behavior: prefersReducedMotion() ? 'instant' : behavior });
    }
  }, []);

  const go = (t: Tab) => {
    userMoved.current = true;
    setTab(t);
    // 用定时器而不是 requestAnimationFrame：标签页在后台时 rAF 不会触发，定时器会
    window.setTimeout(() => scrollToContent('smooth'), 0);
  };

  // 带 hash 进入（/me#compare、/me#favorites……站内“去对比”和品牌页的链接都在用）：页面停在顶部时，把内容区滚到可见位置一次。
  // 稍等一下再判断：站内跳转时 Next 会先把页面滚回顶部，再轮到这里。
  useEffect(() => {
    const h = window.location.hash.replace('#', '');
    if (!TAB_IDS.includes(h as Tab)) return;
    const id = window.setTimeout(() => {
      if (window.scrollY < 100) scrollToContent('instant');
    }, 80);
    return () => window.clearTimeout(id);
  }, [scrollToContent]);

  // 横向导航：当前栏目的胶囊滚到居中。用容器自己的 scrollTo 算偏移，不用 scrollIntoView，避免带动页面纵向滚动。
  useEffect(() => {
    const ul = pillsRef.current;
    const btnEl = ul?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!ul || !btnEl || ul.scrollWidth <= ul.clientWidth + 1) return; // 桌面端竖排，不需要
    const u = ul.getBoundingClientRect();
    const b = btnEl.getBoundingClientRect();
    const target = ul.scrollLeft + (b.left - u.left) - (u.width - b.width) / 2;
    ul.scrollTo({
      left: Math.max(0, Math.min(target, ul.scrollWidth - ul.clientWidth)),
      behavior: userMoved.current && !prefersReducedMotion() ? 'smooth' : 'instant',
    });
  }, [tab]);

  const lookups = useMemo<Lookups>(() => {
    const plansByBrand = new Map<string, MePlan[]>();
    for (const p of data.plans) {
      const arr = plansByBrand.get(p.brandId);
      if (arr) arr.push(p);
      else plansByBrand.set(p.brandId, [p]);
    }
    return {
      planById: new Map(data.plans.map((p) => [p.id, p])),
      brandById: new Map(data.brands.map((b) => [b.id, b])),
      articleBySlug: new Map(data.articles.map((a) => [a.slug, a])),
      plansByBrand,
    };
  }, [data]);

  const current = TABS.find((t) => t.id === tab) ?? TABS[0];
  const favCount = uc.favBrands.length + uc.favArticles.length;
  const badges: Partial<Record<Tab, number>> = {
    favorites: favCount,
    compare: uc.compare.length,
    history: uc.history.length,
  };
  const sectionProps = { data, lookups, go };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* 本地存储提示 + 读写失败 */}
      <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-2.5 text-[12px] text-amber-900">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
        <span className="min-w-0">
          本站没有账号系统：这里的资料、收藏、对比、偏好和阅读记录<strong>仅保存在当前浏览器</strong>，不会上传，也不会同步到其他设备；清除浏览器数据会一并清除。
          {st.ready && !st.storageOk && (
            <strong role="alert" className="mt-1 block text-red-700">
              {st.lastError ?? '当前浏览器不允许保存数据'}。页面仍可使用，但本次的修改在刷新后会丢失。
            </strong>
          )}
          {st.ready && st.recovered && (
            <strong role="status" className="mt-1 block text-amber-900">
              {st.recovered}
            </strong>
          )}
        </span>
      </div>

      <noscript>
        <p className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs leading-relaxed text-slate-700">
          个人中心需要开启浏览器的 JavaScript：收藏、对比、偏好和阅读记录都保存在浏览器本地，没有 JavaScript 就无法读取，下面的“正在读取”不会结束。
        </p>
      </noscript>

      {/* 手机 / 平板：flex 列（导航才能吸顶）；桌面：两列 grid */}
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-6">
        {/* 左侧：账户卡 + 导航。手机端 aside 不生成盒子（contents），两个子元素直接排在 flex 列里。 */}
        {/* 桌面端侧栏吸顶；视口矮于侧栏时侧栏自己滚动，避免底部栏目够不到（-m-1 / p-1 给焦点框留出空间） */}
        <aside className="contents min-w-0 lg:block lg:sticky lg:top-24 lg:-m-1 lg:max-h-[calc(100vh-7rem)] lg:space-y-3 lg:self-start lg:overflow-y-auto lg:p-1">
          <div className="rounded-3xl border border-pink-100 bg-white p-4 shadow-xs">
            <div className="flex items-center gap-3 lg:flex-col lg:items-start">
              {st.ready ? (
                <Avatar letter={avatarLetterOf(uc)} color={uc.avatarColor} size="lg" />
              ) : (
                <span aria-hidden="true" className="h-14 w-14 shrink-0 animate-pulse rounded-2xl bg-slate-100" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-bold text-[#0F172A]">{st.ready ? uc.nickname || '访客' : '读取中…'}</p>
                <p className="truncate text-[11px] text-slate-500">{st.ready ? uc.email || '未填写邮箱' : ' '}</p>
              </div>
              <button type="button" onClick={() => go('account')} className={`${btn.secondary} shrink-0 lg:w-full`}>
                <Pencil className="h-3.5 w-3.5" /> 编辑资料
              </button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {(
                [
                  ['收藏', st.ready ? String(favCount) : '–', 'favorites'],
                  ['对比', st.ready ? `${uc.compare.length}/${COMPARE_MAX}` : '–', 'compare'],
                  ['记录', st.ready ? (uc.historyEnabled ? String(uc.history.length) : '关') : '–', 'history'],
                ] as [string, string, Tab][]
              ).map(([label, value, target]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(target)}
                  aria-label={`${label}：${value}，点击查看`}
                  className="min-w-0 cursor-pointer rounded-xl bg-[#F5F7FB] px-1 py-1.5 hover:bg-pink-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED]"
                >
                  <span className="block whitespace-nowrap text-[10px] text-slate-500">{label}</span>
                  <span className="block truncate text-sm font-bold text-[#0F172A]">{value}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 flex items-center gap-1 text-[10px] text-slate-500">
              <Lock className="h-3 w-3 shrink-0" /> 仅保存在当前浏览器，不上传
            </p>
          </div>

          {/*
            栏目导航（只有这一份 DOM）：
            手机 / 平板：sticky，top 等于站点页头高度；通栏（负外边距抵消容器的左右内边距）；横向滚动的胶囊，两侧用 mask 渐隐。
              渐隐宽度等于左右内边距：停在最左 / 最右时渐隐区里没有内容，看不出来；只有还能继续滑动时，被渐隐的胶囊才露出来，
              所以“还能滑”的提示不需要任何 JS。
            桌面（lg）：恢复成侧栏里的竖排列表，不吸顶、不滚动。
          */}
          <nav
            ref={navRef}
            aria-label="个人中心栏目"
            style={{ top: headerH }}
            className="sticky z-30 -mx-4 border-y border-pink-100 bg-[#FFF9FD]/95 backdrop-blur sm:-mx-6 lg:static lg:z-auto lg:mx-0 lg:border-0 lg:bg-transparent lg:backdrop-blur-none"
          >
            <ul
              ref={pillsRef}
              className="flex gap-1.5 overflow-x-auto overscroll-x-contain px-4 py-2 [mask-image:linear-gradient(to_right,transparent,#000_16px,#000_calc(100%_-_16px),transparent)] [scrollbar-width:none] sm:px-6 sm:[mask-image:linear-gradient(to_right,transparent,#000_24px,#000_calc(100%_-_24px),transparent)] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-1 lg:gap-1 lg:overflow-visible lg:p-0 lg:[mask-image:none]"
            >
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = t.id === tab;
                const badge = st.ready ? (badges[t.id] ?? 0) : 0;
                return (
                  <li key={t.id} className="shrink-0 lg:min-w-0">
                    <button
                      type="button"
                      onClick={() => go(t.id)}
                      aria-current={active ? 'page' : undefined}
                      className={`flex min-h-10 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED] lg:w-full lg:gap-2 lg:rounded-xl lg:text-sm ${
                        active ? 'border-[#0F172A] bg-[#0F172A] text-white' : 'border-pink-100 bg-white text-slate-700 hover:bg-pink-50'
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-pink-300' : 'text-[#7C3AED]'}`} />
                      <span>{t.label}</span>
                      {badge > 0 && (
                        <span className={`rounded-full px-1.5 text-[10px] font-bold lg:ml-auto ${active ? 'bg-white/20 text-white' : 'bg-pink-100 text-[#BE185D]'}`}>
                          {badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* 右侧内容 */}
        <section ref={contentRef} className="min-w-0 space-y-5" aria-labelledby="me-section-title">
          <header className="border-b border-pink-100 pb-3">
            <h2 id="me-section-title" className="text-xl font-bold tracking-tight text-[#0F172A] sm:text-2xl">
              {current.label}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{current.desc}</p>
          </header>

          {!st.ready ? (
            <Skeleton rows={3} />
          ) : tab === 'overview' ? (
            <Overview {...sectionProps} />
          ) : tab === 'favorites' ? (
            <Favorites {...sectionProps} />
          ) : tab === 'compare' ? (
            <Compare {...sectionProps} />
          ) : tab === 'prefs' ? (
            <Preferences {...sectionProps} />
          ) : tab === 'history' ? (
            <History {...sectionProps} />
          ) : tab === 'feedback' ? (
            <Feedback {...sectionProps} />
          ) : tab === 'messages' ? (
            <Messages {...sectionProps} />
          ) : (
            <Account {...sectionProps} />
          )}
        </section>
      </div>
    </div>
  );
}
