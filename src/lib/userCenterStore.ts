'use client';

import { useSyncExternalStore } from 'react';

/**
 * 个人中心的数据层：只保存在当前浏览器的 localStorage 里，没有账号、没有服务器同步。
 *
 * - 单一键 `xjb.userCenter.v1`，内容是一份 JSON；读写都包在 try/catch 里，隐私模式或被禁用时页面照常工作，只是不能保存。
 * - 组件通过 useUserCenter() 订阅；任何一次写入都会通知所有订阅者（收藏按钮、顶部计数、个人中心页同时更新）。
 * - 跨标签页：监听 storage 事件。
 * - 服务端渲染与首次水合用 EMPTY 快照，水合完成后再换成浏览器里的真实数据，避免水合不一致。
 * - 字段只增不改：旧版导出的 JSON（没有邮箱、头像、阅读记录）导入时由 sanitize() 补默认值，所以版本号仍是 1。
 */

export const STORAGE_KEY = 'xjb.userCenter.v1';
export const COMPARE_MAX = 4;
export const COMPARE_MIN = 2;
/** 阅读记录最多保留的条数（按内容去重，最近的在前） */
export const HISTORY_MAX = 60;
export const NICKNAME_MAX = 24;
export const EMAIL_MAX = 80;

export type BillingPref = 'm' | 'q' | 'y' | 'o';

export interface Prefs {
  budgetMin: number | null;
  budgetMax: number | null;
  monthlyGB: number | null;
  regions: string[];
  devices: number | null;
  billing: BillingPref[];
}

/** 头像配色：只存这个 id，颜色类名在组件里映射（Tailwind 需要静态类名） */
export const AVATAR_COLORS = ['violet', 'pink', 'sky', 'emerald', 'amber', 'rose', 'night', 'indigo'] as const;
export type AvatarColor = (typeof AVATAR_COLORS)[number];
export const DEFAULT_AVATAR_COLOR: AvatarColor = 'violet';

export type HistoryKind = 'brand' | 'article';

export interface HistoryEntry {
  kind: HistoryKind;
  /** 品牌 id 或文章 slug */
  key: string;
  /** 最近一次阅读时间（ISO） */
  at: string;
}

export interface Profile {
  nickname: string;
  /** 本地填写的邮箱，可留空；只用于显示，不会发送任何邮件 */
  email: string;
  /** 头像字母（最多 2 个字符）；为空时取昵称首字 */
  avatarLetter: string;
  avatarColor: AvatarColor;
}

export interface UserCenterData extends Profile {
  v: 1;
  favBrands: { id: string; at: string }[];
  favArticles: { slug: string; at: string }[];
  compare: string[];
  prefs: Prefs | null;
  prefsUpdatedAt: string | null;
  history: HistoryEntry[];
  /** 关闭后浏览品牌页 / 文章不再写入阅读记录（已有记录保留，可手动清空） */
  historyEnabled: boolean;
}

export const EMPTY: UserCenterData = Object.freeze({
  v: 1,
  nickname: '',
  email: '',
  avatarLetter: '',
  avatarColor: DEFAULT_AVATAR_COLOR,
  favBrands: [],
  favArticles: [],
  compare: [],
  prefs: null,
  prefsUpdatedAt: null,
  history: [],
  historyEnabled: true,
}) as UserCenterData;

export interface StoreStatus {
  /** 是否已从浏览器读过（水合完成） */
  ready: boolean;
  /** localStorage 可用（不可用时所有操作只在内存里生效，刷新后丢失） */
  storageOk: boolean;
  /** 最近一次读写失败的说明 */
  lastError: string | null;
  /** 读到了无法解析的旧数据，已按空白开始（浏览器存储本身可用，下一次保存会覆盖它） */
  recovered: string | null;
}

let data: UserCenterData = EMPTY;
let status: StoreStatus = { ready: false, storageOk: true, lastError: null, recovered: null };
let loaded = false;
const listeners = new Set<() => void>();

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function sanitize(raw: unknown): UserCenterData {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const str = (v: unknown, max = 40) => (typeof v === 'string' ? v.slice(0, max) : '');
  const list = <T,>(v: unknown, map: (x: Record<string, unknown>) => T | null): T[] =>
    Array.isArray(v) ? v.map((x) => (x && typeof x === 'object' ? map(x as Record<string, unknown>) : null)).filter((x): x is T => x !== null) : [];
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null);
  const prefsRaw = r.prefs && typeof r.prefs === 'object' ? (r.prefs as Record<string, unknown>) : null;
  const billingAll: BillingPref[] = ['m', 'q', 'y', 'o'];

  // 阅读记录：按 kind+key 去重（保留先出现的，也就是最近的一条），再截断
  const seen = new Set<string>();
  const history = list<HistoryEntry>(r.history, (x) => {
    if ((x.kind !== 'brand' && x.kind !== 'article') || typeof x.key !== 'string' || !x.key) return null;
    const k = `${x.kind}:${x.key}`;
    if (seen.has(k)) return null;
    seen.add(k);
    return { kind: x.kind, key: x.key.slice(0, 120), at: str(x.at, 40) };
  }).slice(0, HISTORY_MAX);

  return {
    v: 1,
    nickname: str(r.nickname, NICKNAME_MAX),
    email: str(r.email, EMAIL_MAX),
    avatarLetter: str(r.avatarLetter, 2),
    avatarColor: AVATAR_COLORS.includes(r.avatarColor as AvatarColor) ? (r.avatarColor as AvatarColor) : DEFAULT_AVATAR_COLOR,
    favBrands: list(r.favBrands, (x) => (typeof x.id === 'string' ? { id: x.id.slice(0, 40), at: str(x.at, 40) } : null)),
    favArticles: list(r.favArticles, (x) => (typeof x.slug === 'string' ? { slug: x.slug.slice(0, 120), at: str(x.at, 40) } : null)),
    compare: Array.isArray(r.compare) ? r.compare.filter((x): x is string => typeof x === 'string').slice(0, COMPARE_MAX) : [],
    prefs: prefsRaw
      ? {
          budgetMin: num(prefsRaw.budgetMin),
          budgetMax: num(prefsRaw.budgetMax),
          monthlyGB: num(prefsRaw.monthlyGB),
          regions: Array.isArray(prefsRaw.regions) ? prefsRaw.regions.filter((x): x is string => typeof x === 'string').slice(0, 12) : [],
          devices: num(prefsRaw.devices),
          billing: Array.isArray(prefsRaw.billing) ? prefsRaw.billing.filter((x): x is BillingPref => billingAll.includes(x as BillingPref)) : [],
        }
      : null,
    prefsUpdatedAt: typeof r.prefsUpdatedAt === 'string' ? r.prefsUpdatedAt : null,
    history,
    historyEnabled: typeof r.historyEnabled === 'boolean' ? r.historyEnabled : true,
  };
}

function load(): void {
  if (loaded || !isBrowser()) return;
  loaded = true;
  // 第一步：读取。getItem 抛错 = 浏览器不让用站点存储（隐私模式 / 已禁用），这次访问里的修改不会保留。
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
    status = { ready: true, storageOk: true, lastError: null, recovered: null };
  } catch {
    status = {
      ready: true,
      storageOk: false,
      lastError: '当前浏览器不允许读取或保存站点数据（可能是隐私模式或已禁用站点数据）',
      recovered: null,
    };
  }
  // 第二步：解析。存储可用但内容坏了 = 按空白开始，并告诉访客；原始内容在下一次保存前不会被动。
  data = EMPTY;
  if (raw) {
    try {
      data = sanitize(JSON.parse(raw));
    } catch {
      status = { ...status, recovered: '本浏览器里保存的个人数据无法读取（内容已损坏），已按空白开始；下一次保存会覆盖它。' };
    }
  }
  try {
    window.addEventListener('storage', (e) => {
      if (e.key !== STORAGE_KEY) return;
      try {
        data = e.newValue ? sanitize(JSON.parse(e.newValue)) : EMPTY;
        emit();
      } catch {
        /* 其他标签页写入了无法解析的内容：忽略 */
      }
    });
  } catch {
    /* ignore */
  }
}

function emit(): void {
  for (const l of listeners) l();
}

/** 写入：返回是否成功持久化。失败时内存里的数据仍会更新（本次会话内可用），并记录错误。 */
export function update(fn: (prev: UserCenterData) => UserCenterData): boolean {
  load();
  let ok = true;
  try {
    const next = sanitize(fn(data));
    data = next;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    status = { ...status, storageOk: true, lastError: null, recovered: null };
  } catch {
    ok = false;
    status = { ...status, storageOk: false, lastError: '保存失败：浏览器拒绝写入（可能是隐私模式、存储已满或已禁用站点数据）' };
  }
  emit();
  return ok;
}

export function clearAll(): boolean {
  load();
  data = EMPTY;
  let ok = true;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    status = { ...status, storageOk: true, lastError: null, recovered: null };
  } catch {
    ok = false;
    status = { ...status, lastError: '清除失败：浏览器拒绝访问存储' };
  }
  emit();
  return ok;
}

/** 导入一份导出的 JSON（会先做字段清洗）。 */
export function importJSON(text: string): { ok: boolean; message: string } {
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || (parsed as { v?: unknown }).v !== 1) {
      return { ok: false, message: '文件格式不对：需要本站导出的 JSON（v: 1）' };
    }
    const saved = update(() => sanitize(parsed));
    return saved ? { ok: true, message: '已导入到本浏览器' } : { ok: false, message: status.lastError ?? '导入后保存失败' };
  } catch {
    return { ok: false, message: '文件不是有效的 JSON' };
  }
}

export function exportJSON(): string {
  load();
  return JSON.stringify(data, null, 2);
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): UserCenterData {
  load();
  return data;
}

function getStatusSnapshot(): StoreStatus {
  load();
  return status;
}

/** 同步读取当前状态：写入失败后立刻拿到最新的 lastError（hook 里的快照要等下一次渲染才更新）。 */
export function getStatus(): StoreStatus {
  load();
  return status;
}

const SERVER_STATUS: StoreStatus = { ready: false, storageOk: true, lastError: null, recovered: null };

/** 订阅个人中心数据；服务端与首次水合返回空数据，之后返回浏览器里的真实数据。 */
export function useUserCenter(): UserCenterData {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

export function useUserCenterStatus(): StoreStatus {
  return useSyncExternalStore(subscribe, getStatusSnapshot, () => SERVER_STATUS);
}

// ---------- 便捷操作 ----------

const now = () => new Date().toISOString();

export function toggleFavBrand(id: string): boolean {
  return update((d) =>
    d.favBrands.some((x) => x.id === id)
      ? { ...d, favBrands: d.favBrands.filter((x) => x.id !== id) }
      : { ...d, favBrands: [{ id, at: now() }, ...d.favBrands] },
  );
}

export function toggleFavArticle(slug: string): boolean {
  return update((d) =>
    d.favArticles.some((x) => x.slug === slug)
      ? { ...d, favArticles: d.favArticles.filter((x) => x.slug !== slug) }
      : { ...d, favArticles: [{ slug, at: now() }, ...d.favArticles] },
  );
}

/** 加入对比；满了返回 'full'，已在对比里返回 'exists'。 */
export function addToCompare(planId: string): 'added' | 'full' | 'exists' | 'error' {
  const d = getSnapshot();
  if (d.compare.includes(planId)) return 'exists';
  if (d.compare.length >= COMPARE_MAX) return 'full';
  return update((p) => ({ ...p, compare: [...p.compare, planId] })) ? 'added' : 'error';
}

export function removeFromCompare(planId: string): boolean {
  return update((d) => ({ ...d, compare: d.compare.filter((x) => x !== planId) }));
}

export function clearCompare(): boolean {
  return update((d) => ({ ...d, compare: [] }));
}

export function savePrefs(prefs: Prefs | null): boolean {
  return update((d) => ({ ...d, prefs, prefsUpdatedAt: prefs ? now() : null }));
}

export function saveNickname(nickname: string): boolean {
  return update((d) => ({ ...d, nickname: nickname.trim().slice(0, NICKNAME_MAX) }));
}

/** 保存资料（昵称 / 本地邮箱 / 头像）；只改传入的字段。 */
export function saveProfile(p: Partial<Profile>): boolean {
  return update((d) => ({
    ...d,
    nickname: p.nickname !== undefined ? p.nickname.trim().slice(0, NICKNAME_MAX) : d.nickname,
    email: p.email !== undefined ? p.email.trim().slice(0, EMAIL_MAX) : d.email,
    avatarLetter: p.avatarLetter !== undefined ? p.avatarLetter.trim().slice(0, 2) : d.avatarLetter,
    avatarColor: p.avatarColor ?? d.avatarColor,
  }));
}

/** 宽松的邮箱格式检查：只用来提示拼写，邮箱本身只保存在本浏览器。 */
export function isEmailLike(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

// ---------- 阅读记录 ----------

/**
 * 记录一次阅读（品牌页 / 文章页挂载时调用）。
 * - 关闭记录时不写入，返回 'disabled'。
 * - 同一内容只保留一条，时间更新为最近一次；超过 HISTORY_MAX 条时丢弃最旧的。
 */
export function recordVisit(kind: HistoryKind, key: string): 'recorded' | 'disabled' | 'error' {
  if (!isBrowser() || !key) return 'error';
  const d = getSnapshot();
  if (!d.historyEnabled) return 'disabled';
  const ok = update((p) => ({
    ...p,
    history: [{ kind, key, at: now() }, ...p.history.filter((h) => !(h.kind === kind && h.key === key))].slice(0, HISTORY_MAX),
  }));
  return ok ? 'recorded' : 'error';
}

export function removeHistory(kind: HistoryKind, key: string): boolean {
  return update((d) => ({ ...d, history: d.history.filter((h) => !(h.kind === kind && h.key === key)) }));
}

export function clearHistory(): boolean {
  return update((d) => ({ ...d, history: [] }));
}

export function setHistoryEnabled(enabled: boolean): boolean {
  return update((d) => ({ ...d, historyEnabled: enabled }));
}
