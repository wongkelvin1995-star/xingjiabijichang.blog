'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Scale, Check, UserCircle } from 'lucide-react';
import {
  COMPARE_MAX,
  addToCompare,
  getStatus,
  removeFromCompare,
  toggleFavArticle,
  toggleFavBrand,
  useUserCenter,
} from '@/lib/userCenterStore';

interface FlashMsg {
  text: string;
  ok: boolean;
}

/** 操作后的短提示（成功 2.5 秒、失败 5 秒后消失） */
function useFlash(): [FlashMsg | null, (text: string, ok?: boolean) => void] {
  const [msg, setMsg] = useState<FlashMsg | null>(null);
  useEffect(() => {
    if (!msg) return;
    const t = window.setTimeout(() => setMsg(null), msg.ok ? 2500 : 5000);
    return () => window.clearTimeout(t);
  }, [msg]);
  return [msg, (text, ok = true) => setMsg({ text, ok })];
}

/** 写入失败的原因：读数据层的最新状态（hook 里的快照要等下一次渲染才会更新） */
const saveFailed = () => getStatus().lastError ?? '保存失败，请重试';

const baseBtn =
  'inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED]';

/** 按钮旁边的提示：成功是灰字，失败是红字并用 alert 播报 */
function FlashText({ flash }: { flash: FlashMsg }) {
  return (
    <span role={flash.ok ? 'status' : 'alert'} className={`text-[11px] ${flash.ok ? 'text-slate-500' : 'text-rose-700'}`}>
      {flash.text}
    </span>
  );
}

/** 收藏品牌（品牌页、品牌卡片用） */
export function FavoriteBrandButton({ brandId, compact = false }: { brandId: string; compact?: boolean }) {
  const d = useUserCenter();
  const [flash, setFlash] = useFlash();
  const on = d.favBrands.some((x) => x.id === brandId);
  const click = () => {
    if (toggleFavBrand(brandId)) setFlash(on ? '已取消收藏' : '已收藏到本浏览器');
    else setFlash(saveFailed(), false);
  };
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={click}
        aria-pressed={on}
        aria-label={on ? '取消收藏该品牌' : '收藏该品牌'}
        className={`${baseBtn} ${compact ? 'px-2.5' : ''} ${
          on ? 'border-pink-300 bg-pink-50 text-[#DB2777]' : 'border-slate-200 bg-white text-slate-700 hover:border-pink-300 hover:text-[#DB2777]'
        }`}
      >
        <Heart className={`h-3.5 w-3.5 ${on ? 'fill-current' : ''}`} />
        <span>{on ? '已收藏' : '收藏'}</span>
      </button>
      {flash &&
        (compact ? (
          // 品牌卡片里空间小：成功只给读屏软件播报，失败显示短提示（详细原因放在 title 里）
          flash.ok ? (
            <span role="status" className="sr-only">
              {flash.text}
            </span>
          ) : (
            <span role="alert" title={flash.text} className="whitespace-nowrap text-[11px] text-rose-700">
              保存失败
            </span>
          )
        ) : (
          <FlashText flash={flash} />
        ))}
    </span>
  );
}

/** 收藏文章（文章页用） */
export function FavoriteArticleButton({ slug }: { slug: string }) {
  const d = useUserCenter();
  const [flash, setFlash] = useFlash();
  const on = d.favArticles.some((x) => x.slug === slug);
  const click = () => {
    if (toggleFavArticle(slug)) setFlash(on ? '已取消收藏' : '已收藏到本浏览器');
    else setFlash(saveFailed(), false);
  };
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={click}
        aria-pressed={on}
        aria-label={on ? '取消收藏这篇文章' : '收藏这篇文章'}
        className={`${baseBtn} ${on ? 'border-pink-300 bg-pink-50 text-[#DB2777]' : 'border-slate-200 bg-white text-slate-700 hover:border-pink-300 hover:text-[#DB2777]'}`}
      >
        <Heart className={`h-3.5 w-3.5 ${on ? 'fill-current' : ''}`} />
        <span>{on ? '已收藏' : '收藏文章'}</span>
      </button>
      {flash && <FlashText flash={flash} />}
    </span>
  );
}

/** 加入 / 移出套餐对比（套餐表每行用） */
export function CompareToggleButton({ planId, label = '对比' }: { planId: string; label?: string }) {
  const d = useUserCenter();
  const [flash, setFlash] = useFlash();
  const on = d.compare.includes(planId);
  const click = () => {
    if (on) {
      if (removeFromCompare(planId)) setFlash('已移出对比');
      else setFlash('保存失败', false);
      return;
    }
    const r = addToCompare(planId);
    if (r === 'added') setFlash(`已加入对比（${d.compare.length + 1}/${COMPARE_MAX}）`);
    else if (r === 'full') setFlash(`最多对比 ${COMPARE_MAX} 个，先在个人中心移除一个`);
    else if (r === 'error') setFlash('保存失败', false);
  };
  return (
    <span className="inline-flex flex-col items-start gap-0.5">
      <button
        type="button"
        onClick={click}
        aria-pressed={on}
        aria-label={on ? '移出套餐对比' : '加入套餐对比'}
        className={`${baseBtn} px-2.5 ${on ? 'border-[#7C3AED] bg-purple-50 text-[#6D28D9]' : 'border-slate-200 bg-white text-slate-700 hover:border-purple-300 hover:text-[#6D28D9]'}`}
      >
        {on ? <Check className="h-3.5 w-3.5" /> : <Scale className="h-3.5 w-3.5" />}
        <span>{on ? '已加入' : label}</span>
      </button>
      {flash && (
        // 表格单元格里空间小：失败只写“保存失败”，详细原因放在 title 里
        <span
          role={flash.ok ? 'status' : 'alert'}
          title={flash.ok ? undefined : saveFailed()}
          className={`text-[10px] whitespace-nowrap ${flash.ok ? 'text-slate-500' : 'text-rose-700'}`}
        >
          {flash.text}
        </span>
      )}
    </span>
  );
}

/** 顶部导航里的“个人中心”入口，带本浏览器里的收藏 + 对比数量 */
export function UserCenterNavLink({ variant = 'desktop', onNavigate }: { variant?: 'desktop' | 'mobile'; onNavigate?: () => void }) {
  const d = useUserCenter();
  const count = d.favBrands.length + d.favArticles.length + d.compare.length;
  if (variant === 'mobile') {
    return (
      <Link href="/me" onClick={onNavigate} className="flex items-center rounded-lg px-3 py-2.5 hover:bg-pink-500/10">
        <UserCircle className="mr-3 h-4 w-4 text-pink-400" />
        个人中心
        {count > 0 && <span className="ml-2 rounded-full bg-pink-500/20 px-1.5 text-[10px] text-pink-200">{count}</span>}
      </Link>
    );
  }
  return (
    <Link
      href="/me"
      className="relative inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-pink-500/20 hover:text-white transition-all"
      aria-label="个人中心：收藏、套餐对比与偏好"
    >
      <UserCircle className="h-4 w-4" />
      <span className="hidden md:inline">个人中心</span>
      {count > 0 && (
        <span className="rounded-full bg-pink-500 px-1.5 text-[10px] font-bold text-white" aria-label={`${count} 项`}>
          {count}
        </span>
      )}
    </Link>
  );
}

/** 对比栏里的“去对比”链接：对比里有套餐时显示 */
export function CompareBarLink() {
  const d = useUserCenter();
  if (d.compare.length === 0) return null;
  return (
    <Link
      href="/me#compare"
      className="inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#7C3AED] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#6D28D9]"
    >
      <Scale className="h-3.5 w-3.5" />
      <span>
        去对比（{d.compare.length}/{COMPARE_MAX}）
      </span>
    </Link>
  );
}
