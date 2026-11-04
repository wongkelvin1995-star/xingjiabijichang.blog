'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import type { AvatarColor } from '@/lib/userCenterStore';

/* ------------------------------------------------------------------ */
/* 格式化                                                              */
/* ------------------------------------------------------------------ */

export function yuan(n: number): string {
  return Number.isInteger(n) ? `¥${n}` : `¥${n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}`;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** ISO 时间 → “2026-11-04 10:23”（withTime=false 只到日期）；解析失败时原样返回 */
export function fmtDate(iso: string, withTime = true): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return withTime ? `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}` : date;
}

/** 相对时间：刚刚 / N 分钟前 / N 小时前 / N 天前；超过 7 天或拿不到当前时间时显示具体日期 */
export function fmtRelative(iso: string, now: number): string {
  const t = new Date(iso).getTime();
  if (!iso || Number.isNaN(t) || !now) return fmtDate(iso);
  const m = Math.floor((now - t) / 60000);
  if (m < 1) return '刚刚';
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} 天前`;
  return fmtDate(iso);
}

/** 阅读记录按天分组用的标题 */
export function dayLabel(iso: string, now: number): string {
  const t = new Date(iso).getTime();
  if (!iso || Number.isNaN(t) || !now) return '更早';
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const s = today.getTime();
  if (t >= s) return '今天';
  if (t >= s - 86400000) return '昨天';
  if (t >= s - 6 * 86400000) return '最近 7 天';
  return '更早';
}

/**
 * 当前时间（按分钟取整）。服务端与首次水合为 0，之后每分钟刷新一次；
 * 用 useSyncExternalStore 而不是在渲染里直接调 Date.now()，渲染保持纯函数。
 */
const MINUTE = 60000;
function subscribeMinute(cb: () => void): () => void {
  const t = window.setInterval(cb, MINUTE);
  return () => window.clearInterval(t);
}
const minuteNow = () => Math.floor(Date.now() / MINUTE) * MINUTE;
export function useNow(): number {
  return useSyncExternalStore(subscribeMinute, minuteNow, () => 0);
}

/* ------------------------------------------------------------------ */
/* 操作提示：成功 / 失败 / 说明，几秒后自动消失                           */
/* ------------------------------------------------------------------ */

export type Tone = 'ok' | 'err' | 'info';
export interface Flash {
  text: string;
  tone: Tone;
}

export function useFlash() {
  const [flash, setFlash] = useState<Flash | null>(null);
  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setFlash(null), flash.tone === 'err' ? 6000 : 3500);
    return () => window.clearTimeout(t);
  }, [flash]);
  return {
    flash,
    ok: (text: string) => setFlash({ text, tone: 'ok' }),
    err: (text: string) => setFlash({ text, tone: 'err' }),
    info: (text: string) => setFlash({ text, tone: 'info' }),
  };
}

export function FlashLine({ flash, className = '' }: { flash: Flash | null; className?: string }) {
  if (!flash) return null;
  const Icon = flash.tone === 'ok' ? CheckCircle2 : flash.tone === 'err' ? XCircle : Info;
  const cls = flash.tone === 'ok' ? 'text-emerald-700' : flash.tone === 'err' ? 'text-rose-700' : 'text-[#6D28D9]';
  return (
    <p role={flash.tone === 'err' ? 'alert' : 'status'} className={`flex min-w-0 items-start gap-1.5 text-xs break-words ${cls} ${className}`}>
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span className="min-w-0">{flash.text}</span>
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* 按钮 / 输入框样式（短文字按钮一律 whitespace-nowrap，靠父级 flex-wrap 换行） */
/* ------------------------------------------------------------------ */

const btnBase =
  'inline-flex min-h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED] disabled:cursor-not-allowed disabled:opacity-50';

export const btn = {
  primary: `${btnBase} bg-[#7C3AED] font-bold text-white hover:bg-[#6D28D9]`,
  secondary: `${btnBase} border border-slate-300 bg-white text-slate-800 hover:border-pink-300 hover:bg-pink-50/40`,
  danger: `${btnBase} border border-transparent text-rose-700 hover:bg-rose-50`,
  dangerSolid: `${btnBase} bg-rose-600 font-bold text-white hover:bg-rose-700`,
  ghost: `${btnBase} text-[#7C3AED] hover:bg-purple-50`,
  link: 'inline-flex min-h-8 items-center gap-1 text-xs font-semibold text-[#7C3AED] hover:underline cursor-pointer',
};

export const inputCls =
  'min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-[#7C3AED] focus:outline-none';

/** 表单项：标签 + 控件 + 说明 / 错误（错误用 role=alert，并由控件的 aria-describedby 指向 `${id}-err`） */
export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-slate-700">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-err`} role="alert" className="mt-1 text-[11px] text-rose-700">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-[11px] text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 小部件                                                              */
/* ------------------------------------------------------------------ */

export function Card({
  children,
  className = '',
  tone = 'white',
}: {
  children: React.ReactNode;
  className?: string;
  tone?: 'white' | 'muted' | 'danger' | 'info';
}) {
  const t =
    tone === 'muted'
      ? 'border-slate-200 bg-[#F5F7FB]'
      : tone === 'danger'
        ? 'border-rose-200 bg-rose-50/40'
        : tone === 'info'
          ? 'border-purple-200 bg-purple-50/40'
          : 'border-pink-100 bg-white shadow-xs';
  return <div className={`min-w-0 rounded-2xl border p-4 sm:p-5 ${t} ${className}`}>{children}</div>;
}

export function Pill({
  children,
  tone = 'slate',
}: {
  children: React.ReactNode;
  tone?: 'slate' | 'night' | 'purple' | 'pink' | 'amber' | 'emerald';
}) {
  const cls = {
    slate: 'bg-slate-100 text-slate-600',
    night: 'bg-[#0F172A] text-white',
    purple: 'border border-purple-100 bg-purple-50 text-[#6D28D9]',
    pink: 'border border-pink-100 bg-pink-50 text-[#BE185D]',
    amber: 'border border-amber-200 bg-amber-50 text-amber-800',
    emerald: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  }[tone];
  return <span className={`inline-flex items-center whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${cls}`}>{children}</span>;
}

/** 空数据：给真实入口，不留死按钮 */
export function Empty({
  icon,
  title,
  text,
  links,
}: {
  icon?: React.ReactNode;
  title: string;
  text?: string;
  links?: { href: string; label: string }[];
}) {
  return (
    <div className="rounded-2xl border border-dashed border-purple-200 bg-purple-50/40 p-5 text-center sm:p-6">
      {icon && <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#7C3AED] shadow-xs">{icon}</div>}
      <p className="text-sm font-semibold text-[#0F172A]">{title}</p>
      {text && <p className="mt-1 text-xs leading-relaxed text-slate-500">{text}</p>}
      {links && links.length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={btn.secondary}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/** 保存的 id 在本站资料里已不存在 */
export function Invalid({ text, onRemove, removeLabel = '移除这条' }: { text: string; onRemove: () => void; removeLabel?: string }) {
  return (
    <div className="space-y-2 text-xs text-amber-800">
      <p className="flex items-start gap-1.5 break-all">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>{text}</span>
      </p>
      <button type="button" onClick={onRemove} className={`${btn.secondary} border-amber-300 text-amber-900`}>
        {removeLabel}
      </button>
    </div>
  );
}

/** 读取本浏览器数据前的占位 */
export function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <p className="text-xs text-slate-500">正在读取本浏览器中保存的资料…</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl border border-pink-100 bg-white/70" />
        ))}
      </div>
      <div className="space-y-3" aria-hidden="true">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl border border-pink-100 bg-white/70" />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 头像：本地选择的字母 + 颜色                                           */
/* ------------------------------------------------------------------ */

export const AVATAR_COLOR_CLASS: Record<AvatarColor, string> = {
  violet: 'bg-[#7C3AED] text-white',
  pink: 'bg-[#EC4899] text-white',
  sky: 'bg-sky-500 text-white',
  emerald: 'bg-emerald-500 text-white',
  amber: 'bg-amber-400 text-[#0F172A]',
  rose: 'bg-rose-500 text-white',
  night: 'bg-[#0F172A] text-white',
  indigo: 'bg-indigo-500 text-white',
};

export const AVATAR_COLOR_LABEL: Record<AvatarColor, string> = {
  violet: '紫',
  pink: '樱粉',
  sky: '天蓝',
  emerald: '翠绿',
  amber: '琥珀',
  rose: '玫红',
  night: '夜蓝',
  indigo: '靛蓝',
};

/** 头像上显示的字：自定义 → 昵称首字 → “访” */
export function avatarLetterOf(d: { avatarLetter: string; nickname: string }): string {
  return d.avatarLetter.trim() || d.nickname.trim().slice(0, 1) || '访';
}

export function Avatar({
  letter,
  color,
  size = 'md',
  className = '',
}: {
  letter: string;
  color: AvatarColor;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sz = { sm: 'h-8 w-8 text-sm rounded-xl', md: 'h-10 w-10 text-base rounded-xl', lg: 'h-14 w-14 text-xl rounded-2xl', xl: 'h-20 w-20 text-3xl rounded-3xl' }[size];
  return (
    <span aria-hidden="true" className={`inline-flex shrink-0 select-none items-center justify-center font-black shadow-xs ${sz} ${AVATAR_COLOR_CLASS[color]} ${className}`}>
      {letter}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* 开关与二次确认                                                       */
/* ------------------------------------------------------------------ */

export function Switch({
  id,
  checked,
  onChange,
  label,
  disabled = false,
}: {
  id: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED] disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? 'border-[#7C3AED] bg-[#7C3AED]' : 'border-slate-300 bg-slate-200'
        }`}
      >
        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
      <span className="whitespace-nowrap text-xs font-semibold text-slate-800">{label}</span>
    </span>
  );
}

/** 两步确认：先点一次，再出现“确认 / 取消” */
export function InlineConfirm({
  label,
  confirmLabel = '确认',
  cancelLabel = '取消',
  hint,
  onConfirm,
  icon,
  className = '',
}: {
  label: string;
  confirmLabel?: string;
  cancelLabel?: string;
  hint?: string;
  onConfirm: () => void;
  icon?: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={`${btn.secondary} border-rose-300 text-rose-700 hover:bg-rose-50 ${className}`}>
        {icon}
        {label}
      </button>
    );
  }
  return (
    <span className="inline-flex min-w-0 flex-wrap items-center gap-2">
      {hint && <span className="text-xs text-rose-700">{hint}</span>}
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          onConfirm();
        }}
        className={btn.dangerSolid}
      >
        {confirmLabel}
      </button>
      <button type="button" onClick={() => setOpen(false)} className={btn.secondary}>
        {cancelLabel}
      </button>
    </span>
  );
}
