'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { COMPARE_MAX, type BillingPref, type Prefs, addToCompare, getStatus, savePrefs, useUserCenter } from '@/lib/userCenterStore';
import type { MePlan, SectionProps } from '../types';
import { Card, Field, FlashLine, Pill, type Tone, btn, fmtDate, inputCls, useFlash, yuan } from '../ui';

export const REGIONS = ['香港', '台湾', '日本', '新加坡', '美国', '韩国', '欧洲', '其他'];
export const BILLING: { id: BillingPref; label: string }[] = [
  { id: 'm', label: '月付' },
  { id: 'q', label: '季付 / 半年付' },
  { id: 'y', label: '年付' },
  { id: 'o', label: '不限时流量包' },
];

/** 需求偏好：记录预算 / 用量等条件，按条件过滤套餐（只做过滤，不生成匹配分） */
export function Preferences({ data }: SectionProps) {
  const uc = useUserCenter();
  const { flash, ok, err, info } = useFlash();
  const onMessage = (text: string, tone: Tone) => (tone === 'ok' ? ok(text) : tone === 'err' ? err(text) : info(text));

  // 按已保存的偏好筛选（只用本站有资料的条件）
  const saved = uc.prefs;
  const matches = useMemo(() => {
    if (!saved) return null;
    const billing = saved.billing.length ? saved.billing : (['m'] as BillingPref[]);
    const cycleOk = (p: MePlan) =>
      (billing.includes('m') && p.cycle === 'monthly') ||
      (billing.includes('q') && (p.cycle === 'quarterly' || p.cycle === 'semiannual')) ||
      (billing.includes('y') && p.cycle === 'yearly') ||
      (billing.includes('o') && p.cycle === 'unlimited');
    const monthlyCost = (p: MePlan) => (p.months > 0 ? p.price / p.months : p.price);
    const list = data.plans.filter((p) => {
      if (!cycleOk(p)) return false;
      const brand = data.brands.find((b) => b.id === p.brandId);
      if (brand?.isHistorical) return false;
      const mc = monthlyCost(p);
      if (saved.budgetMax !== null && mc > saved.budgetMax) return false;
      if (saved.budgetMin !== null && mc < saved.budgetMin) return false;
      if (saved.monthlyGB !== null) {
        if (p.monthlyGB !== null && p.monthlyGB < saved.monthlyGB) return false;
        if (p.monthlyGB === null && p.totalGB < saved.monthlyGB) return false;
      }
      return true;
    });
    // 每家一档：每 GB 最低；优选品牌固定第一
    const best = new Map<string, MePlan>();
    for (const p of list) {
      const cur = best.get(p.brandId);
      if (!cur || p.nominalPerGB < cur.nominalPerGB) best.set(p.brandId, p);
    }
    const arr = [...best.values()].sort((a, b) => a.nominalPerGB - b.nominalPerGB);
    const featured = arr.find((p) => p.brandId === data.featuredBrandId);
    const rest = arr.filter((p) => p.brandId !== data.featuredBrandId).slice(0, featured ? 5 : 6);
    return { total: list.length, picks: featured ? [featured, ...rest] : rest };
  }, [saved, data]);

  const add = (p: MePlan) => {
    const r = addToCompare(p.id);
    if (r === 'added') ok(`已加入对比：${p.brandName} · ${p.planName}`);
    else if (r === 'full') info(`最多对比 ${COMPARE_MAX} 个，先移除一个`);
    else if (r === 'exists') info('这档套餐已在对比里');
    else err(getStatus().lastError ?? '保存失败，请重试');
  };

  return (
    <div className="space-y-5">
      {/* key：保存 / 重置 / 导入后用存储里的值重新初始化表单 */}
      <PrefsForm key={uc.prefsUpdatedAt ?? 'blank'} initial={uc.prefs} updatedAt={uc.prefsUpdatedAt} onMessage={onMessage} flash={flash} />

      {saved && matches && (
        <Card className="space-y-3">
          <h3 className="text-sm font-bold text-[#0F172A]">按你的偏好筛出的套餐</h3>
          <p className="text-[11px] leading-relaxed text-slate-500">
            规则：计费周期 ∈ {(saved.billing.length ? saved.billing : ['m']).map((b) => BILLING.find((x) => x.id === b)?.label).join(' / ')}
            {saved.budgetMax !== null || saved.budgetMin !== null ? `；折算月价在 ${saved.budgetMin ?? 0}–${saved.budgetMax ?? '不限'} 元` : ''}
            {saved.monthlyGB !== null ? `；每月额度 ≥ ${saved.monthlyGB} GB（流量包按包内总量）` : ''}
            ；每家只取每 GB 最低的一档，按每 GB 从低到高，最多 6 家；历史资料品牌不参与。本站优选品牌若符合条件则固定第一（推荐位，不是价格第一）。地区、设备数本站没有资料，未参与筛选；这不是“匹配度”，只是条件过滤。
          </p>
          {matches.picks.length === 0 ? (
            <p className="text-xs text-slate-600">没有符合全部条件的套餐（共筛过 {data.plans.length} 个价格选项）。可以放宽预算或用量，或在首页对比表里手动看。</p>
          ) : (
            <ol className="divide-y divide-slate-100 rounded-xl border border-slate-100">
              {matches.picks.map((p) => (
                <li key={p.id} className="flex items-start justify-between gap-3 px-3 py-2.5 text-xs">
                  <div className="min-w-0">
                    <Link href={`/brands/${p.brandSlug}`} className="font-bold text-[#0F172A] hover:text-[#7C3AED]">
                      {p.brandName}
                    </Link>
                    {p.brandId === data.featuredBrandId && (
                      <span className="ml-1.5 align-middle">
                        <Pill tone="night">本站优选</Pill>
                      </span>
                    )}
                    <span className="ml-1.5 text-slate-500">
                      {p.planName} · {p.cycleLabel}
                    </span>
                    <div className="text-[11px] text-slate-500">
                      {p.monthlyGB !== null ? `每月 ${p.monthlyGB} GB` : `共 ${p.totalGB} GB，用完为止`}
                      {p.cycle !== 'monthly' && p.cycle !== 'unlimited' ? ` · ${p.perMonthLabel}` : ''} · 资料更新 {p.dataDate}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-bold text-[#6D28D9]">{yuan(p.price)}</div>
                    <div className="text-[10px] text-slate-500">¥{p.nominalPerGB.toFixed(3)}/GB</div>
                    <button type="button" onClick={() => add(p)} className={`${btn.link} mt-1 text-[11px]`}>
                      加入对比
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
          <p className="text-[11px] text-slate-500">
            符合条件的价格选项共 {matches.total} 个；价格为站长按官网公开页面整理（资料日 {data.dataDateRange}），购买前以官网为准。
          </p>
        </Card>
      )}
    </div>
  );
}

function PrefsForm({
  initial,
  updatedAt,
  onMessage,
  flash,
}: {
  initial: Prefs | null;
  updatedAt: string | null;
  onMessage: (text: string, tone: Tone) => void;
  flash: ReturnType<typeof useFlash>['flash'];
}) {
  const blank: Prefs = { budgetMin: null, budgetMax: null, monthlyGB: null, regions: [], devices: null, billing: [] };
  const [form, setForm] = useState<Prefs>(initial ?? blank);

  const setNum = (k: 'budgetMin' | 'budgetMax' | 'monthlyGB' | 'devices') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value === '' ? null : Math.max(0, Number(e.target.value));
    setForm((f) => ({ ...f, [k]: v === null || Number.isNaN(v) ? null : v }));
  };
  const toggleIn = (k: 'regions' | 'billing', v: string) => {
    setForm((f) => {
      const arr = f[k] as string[];
      const next = arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
      return { ...f, [k]: next } as Prefs;
    });
  };
  const save = () => {
    if (form.budgetMin !== null && form.budgetMax !== null && form.budgetMin > form.budgetMax) {
      onMessage('预算下限不能大于上限', 'err');
      return;
    }
    const saved = savePrefs(form);
    onMessage(saved ? '偏好已保存到本浏览器' : (getStatus().lastError ?? '保存失败，请重试'), saved ? 'ok' : 'err');
  };
  const reset = () => {
    const saved = savePrefs(null);
    onMessage(saved ? '已重置偏好' : (getStatus().lastError ?? '重置失败，请重试'), saved ? 'ok' : 'err');
  };

  const chipCls = (on: boolean) =>
    `inline-flex min-h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs ${
      on ? 'border-[#7C3AED] bg-purple-50 text-[#6D28D9]' : 'border-slate-200 bg-white text-slate-700'
    }`;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="space-y-4 rounded-2xl border border-pink-100 bg-white p-4 shadow-xs sm:p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="每月预算下限（元）" id="pref-bmin">
          <input id="pref-bmin" type="number" min={0} step={1} inputMode="decimal" value={form.budgetMin ?? ''} onChange={setNum('budgetMin')} className={inputCls} placeholder="可留空" />
        </Field>
        <Field label="每月预算上限（元）" id="pref-bmax">
          <input id="pref-bmax" type="number" min={0} step={1} inputMode="decimal" value={form.budgetMax ?? ''} onChange={setNum('budgetMax')} className={inputCls} placeholder="例如 30" />
        </Field>
        <Field label="预计每月流量（GB）" id="pref-gb" hint="不知道用多少？看《100GB 够不够用》里的七天记录法">
          <input id="pref-gb" type="number" min={0} step={10} inputMode="decimal" value={form.monthlyGB ?? ''} onChange={setNum('monthlyGB')} className={inputCls} placeholder="例如 100" />
        </Field>
        <Field label="设备数量（台）" id="pref-dev" hint="本站只有少数品牌的资料写明设备数，其余无法按此筛选">
          <input id="pref-dev" type="number" min={1} step={1} inputMode="numeric" value={form.devices ?? ''} onChange={setNum('devices')} className={inputCls} placeholder="例如 2" />
        </Field>
      </div>
      <fieldset>
        <legend className="text-xs font-semibold text-slate-700">常用地区（可多选）</legend>
        <p className="mb-1.5 text-[11px] text-slate-500">本站价格表没有线路地区字段，这一项只做记录，不参与筛选。</p>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((r) => (
            <label key={r} className={chipCls(form.regions.includes(r))}>
              <input type="checkbox" className="sr-only" checked={form.regions.includes(r)} onChange={() => toggleIn('regions', r)} />
              {form.regions.includes(r) && <Check className="h-3 w-3" />}
              {r}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-xs font-semibold text-slate-700">计费偏好（可多选；不选默认看月付）</legend>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {BILLING.map((b) => (
            <label key={b.id} className={chipCls(form.billing.includes(b.id))}>
              <input type="checkbox" className="sr-only" checked={form.billing.includes(b.id)} onChange={() => toggleIn('billing', b.id)} />
              {form.billing.includes(b.id) && <Check className="h-3 w-3" />}
              {b.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button type="submit" className={btn.primary}>
          保存偏好
        </button>
        <button type="button" onClick={reset} className={btn.secondary}>
          重置
        </button>
        {flash ? <FlashLine flash={flash} /> : updatedAt ? <span className="text-[11px] text-slate-500">上次保存：{fmtDate(updatedAt)}</span> : null}
      </div>
      <p className="text-[11px] text-slate-500">只收集这些筛选需要的信息；全部保存在本浏览器，不上传。</p>
    </form>
  );
}
