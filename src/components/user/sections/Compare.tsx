'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { Plus, Scale, Trash2, X } from 'lucide-react';
import { COMPARE_MAX, COMPARE_MIN, addToCompare, clearCompare, getStatus, removeFromCompare, useUserCenter } from '@/lib/userCenterStore';
import type { MePlan, SectionProps } from '../types';
import { Card, Empty, FlashLine, btn, useFlash, yuan } from '../ui';

const selectCls =
  'min-h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-2 text-xs text-slate-800 focus:border-[#7C3AED] focus:outline-none disabled:opacity-60';

/** 机场对比：已选套餐、添加 / 移除、开始对比；对比表沿用 compare 列表（与站内 CompareToggleButton 共用） */
export function Compare({ data, lookups }: SectionProps) {
  const uc = useUserCenter();
  const { flash, ok, err, info } = useFlash();
  const tableRef = useRef<HTMLDivElement>(null);
  const { planById, brandById, plansByBrand } = lookups;

  const items = uc.compare.map((id) => ({ id, p: planById.get(id) }));
  const valid = items.filter((x): x is { id: string; p: MePlan } => !!x.p);
  const canStart = valid.length >= COMPARE_MIN;
  const slotsLeft = Math.max(0, COMPARE_MAX - uc.compare.length);

  // 添加：先选品牌，再选该品牌的套餐
  const [brandSel, setBrandSel] = useState('');
  const [planSel, setPlanSel] = useState('');
  const brandOptions = data.brands.filter((b) => (plansByBrand.get(b.id)?.length ?? 0) > 0);
  const planOptions = brandSel ? (plansByBrand.get(brandSel) ?? []) : [];

  const report = (r: ReturnType<typeof addToCompare>, name: string) => {
    if (r === 'added') ok(`已加入对比：${name}`);
    else if (r === 'exists') info('这档套餐已在对比里');
    else if (r === 'full') info(`最多对比 ${COMPARE_MAX} 个，先移除一个`);
    else err(getStatus().lastError ?? '保存失败，请重试');
  };
  const addSelected = () => {
    const p = planById.get(planSel);
    if (!p) {
      info('先选择品牌和套餐');
      return;
    }
    report(addToCompare(p.id), `${p.brandName} · ${p.planName}`);
  };
  const remove = (id: string, name: string) => (removeFromCompare(id) ? ok(`已移除 ${name}`) : err(getStatus().lastError ?? '保存失败，请重试'));
  const clear = () => (clearCompare() ? ok('已清空对比') : err(getStatus().lastError ?? '保存失败，请重试'));
  const start = () => {
    if (!canStart) {
      info(`至少 ${COMPARE_MIN} 个套餐才能开始对比，还差 ${COMPARE_MIN - valid.length} 个`);
      return;
    }
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // 快捷候选：收藏品牌的入门月付（还没在对比里的）
  const candidates = uc.favBrands
    .map((f) => brandById.get(f.id))
    .filter((b): b is NonNullable<typeof b> => !!b && !!b.entryPlanId && !uc.compare.includes(b.entryPlanId))
    .slice(0, 6);

  const rows: { label: string; note?: string; render: (p: MePlan) => React.ReactNode }[] = [
    {
      label: '服务商 · 套餐',
      render: (p) => (
        <>
          <Link href={`/brands/${p.brandSlug}`} className="font-bold text-[#0F172A] hover:text-[#7C3AED]">
            {p.brandName}
          </Link>
          <span className="block text-slate-600">{p.planName}</span>
        </>
      ),
    },
    { label: '计费周期', render: (p) => p.cycleLabel },
    { label: '实际付款（一次付清）', note: '本周期一次付清的金额；月付即每月实付', render: (p) => <strong className="text-[#6D28D9]">{yuan(p.price)}</strong> },
    {
      label: '折算月价',
      note: '一次付清 ÷ 月数，只作参考，不能按月购买',
      render: (p) => (p.cycle === 'monthly' ? '—（本身就是月付）' : p.cycle === 'unlimited' ? '—（一次性流量包）' : p.perMonthLabel),
    },
    { label: '较同名月付节省', render: (p) => p.savingsLabel || '—' },
    {
      label: '流量额度',
      note: '每月额度 / 周期合计；不限时包为包内总量',
      render: (p) => (p.monthlyGB !== null ? `每月 ${p.monthlyGB} GB${p.cycle !== 'monthly' ? `（周期共 ${p.totalGB} GB）` : ''}` : `共 ${p.totalGB} GB，用完为止`),
    },
    { label: '重置周期 / 有效期', render: (p) => p.resetRule || '待核验' },
    { label: '标称每 GB', note: '实际付款 ÷ 周期合计流量；按 1 倍率。辅助指标，不反映有效期和用不完的情况', render: (p) => `¥${p.nominalPerGB.toFixed(3)}/GB` },
    { label: '流量倍率', note: '资料写明的按资料显示；未标注的按 1 倍率计算，未逐家核实', render: (p) => p.multiplier },
    { label: '设备 / 并发限制', note: '资料写明“不限设备”“最多 N 台”的按资料显示；未标注的显示“设备数未标注”', render: (p) => p.deviceLimit },
    { label: '线路（资料标注）', render: (p) => p.lineInfo },
    { label: '首次优惠 / 适用条件', render: () => <span className="text-amber-700">待核验（本站未收录）</span> },
    { label: '续费价格', render: () => <span className="text-amber-700">待核验（本站未收录）</span> },
    { label: '退款条件', render: () => <span className="text-amber-700">待核验（本站未收录）</span> },
    { label: '信息来源 · 资料更新', render: (p) => `站长按官网公开页面整理 · 价格资料更新于 ${p.dataDate}` },
  ];

  return (
    <div className="space-y-4">
      {/* 已选套餐 */}
      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-[#0F172A]">
            已选套餐{' '}
            <span className="font-normal text-slate-500">
              {uc.compare.length} / {COMPARE_MAX}
            </span>
          </h3>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={start} aria-disabled={!canStart} className={canStart ? btn.primary : `${btn.secondary} opacity-70`}>
              <Scale className="h-3.5 w-3.5" /> 开始对比
            </button>
            {uc.compare.length > 0 && (
              <button type="button" onClick={clear} className={btn.danger}>
                <Trash2 className="h-3.5 w-3.5" /> 清空
              </button>
            )}
          </div>
        </div>

        {uc.compare.length === 0 ? (
          <Empty
            icon={<Scale className="h-5 w-5" />}
            title="对比里还没有套餐"
            text={`在下面选择品牌和套餐加入，或在品牌页、首页对比表里点“对比”；选 ${COMPARE_MIN}–${COMPARE_MAX} 个后就能开始对比。`}
            links={[
              { href: '/brands', label: '浏览机场' },
              { href: '/#comparison-table', label: '首页对比表' },
            ]}
          />
        ) : (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((x) => {
              const p = x.p;
              if (!p) {
                return (
                  <li key={x.id} className="min-w-0 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
                    <p className="break-all">套餐 {x.id} 已不在本站资料里（可能已下架或改名）。</p>
                    <button type="button" onClick={() => remove(x.id, x.id)} className={`${btn.link} mt-1`}>
                      移除
                    </button>
                  </li>
                );
              }
              return (
                <li key={x.id} className="min-w-0 rounded-xl border border-pink-100 bg-[#FFF9FD] p-3 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link href={`/brands/${p.brandSlug}`} className="block truncate font-bold text-[#0F172A] hover:text-[#7C3AED]">
                        {p.brandName}
                      </Link>
                      <p className="truncate text-slate-600">
                        {p.planName} · {p.cycleLabel}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(x.id, `${p.brandName} ${p.planName}`)}
                      aria-label={`移除 ${p.brandName} ${p.planName}`}
                      className="shrink-0 cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-1.5 font-bold text-[#6D28D9]">
                    {yuan(p.price)}{' '}
                    <span className="font-normal text-slate-500">
                      {p.cycle === 'monthly' ? '每月实付' : p.cycle === 'unlimited' ? '一次性流量包' : `一次付清 · ${p.perMonthLabel}`}
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-500">价格资料更新于 {p.dataDate}</p>
                </li>
              );
            })}
            {Array.from({ length: slotsLeft }).map((_, i) => (
              <li key={`slot-${i}`} className="flex min-h-[5.5rem] items-center justify-center rounded-xl border border-dashed border-slate-200 text-[11px] text-slate-500">
                空位 · 可再添加
              </li>
            ))}
          </ul>
        )}
        <FlashLine flash={flash} />
        {!canStart && uc.compare.length > 0 && <p className="text-xs text-slate-500">再加 {COMPARE_MIN - valid.length} 个套餐就能开始对比。</p>}
      </Card>

      {/* 添加套餐 */}
      <Card className="space-y-3">
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#0F172A]">
          <Plus className="h-4 w-4 text-[#7C3AED]" /> 添加套餐
        </h3>
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <label className="sr-only" htmlFor="cmp-brand">
            品牌
          </label>
          <select
            id="cmp-brand"
            value={brandSel}
            onChange={(e) => {
              setBrandSel(e.target.value);
              setPlanSel(plansByBrand.get(e.target.value)?.[0]?.id ?? '');
            }}
            className={selectCls}
          >
            <option value="">选择品牌…</option>
            {brandOptions.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
                {b.isHistorical ? '（历史资料）' : ''}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="cmp-plan">
            套餐
          </label>
          <select id="cmp-plan" value={planSel} onChange={(e) => setPlanSel(e.target.value)} disabled={!brandSel} className={selectCls}>
            {!brandSel && <option value="">先选品牌</option>}
            {planOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.planName} · {p.cycleLabel} {yuan(p.price)}
                {uc.compare.includes(p.id) ? '（已在对比）' : ''}
              </option>
            ))}
          </select>
          <button type="button" onClick={addSelected} disabled={!planSel} className={btn.primary}>
            加入对比
          </button>
        </div>
        {candidates.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[11px] text-slate-500">从收藏的机场快速加入入门月付档：</p>
            <div className="flex flex-wrap gap-2">
              {candidates.map((b) => {
                const entryId = b.entryPlanId as string;
                const p = planById.get(entryId);
                return (
                  <button key={b.id} type="button" onClick={() => report(addToCompare(entryId), `${b.name}${p ? ` · ${p.planName}` : ''}`)} className={btn.secondary}>
                    + {b.name} 入门月付
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <p className="text-[11px] leading-relaxed text-slate-500">
          也可以在品牌页的套餐表或首页
          <Link href="/#comparison-table" className="text-[#7C3AED] hover:underline">
            对比表
          </Link>
          里点“对比”加入；对比列表只保存在当前浏览器。
        </p>
      </Card>

      {/* 对比表 */}
      {canStart && (
        <div ref={tableRef} className="scroll-mt-24 space-y-3">
          <p className="text-xs text-slate-500">
            正在对比 {valid.length} 个套餐（最多 {COMPARE_MAX}）。周期、流量口径逐行标明；缺少的资料写“待核验”，不按零元或无限制处理。
          </p>
          <p className="text-[11px] text-slate-500 lg:hidden">← 表格较宽，可左右滑动查看全部 {valid.length} 个套餐 →</p>
          <div className="max-w-full overflow-x-auto rounded-2xl border border-pink-100 bg-white shadow-xs">
            <table className="w-full min-w-[640px] table-auto border-collapse text-xs">
              <thead>
                <tr className="bg-[#18243B] text-slate-100">
                  <th scope="col" className="sticky left-0 z-10 w-[8.5rem] min-w-[8.5rem] bg-[#18243B] px-3 py-2.5 text-left font-semibold">
                    对比项
                  </th>
                  {valid.map((x) => (
                    <th key={x.id} scope="col" className="min-w-[11rem] px-3 py-2.5 text-left font-semibold">
                      <span className="block">{x.p.brandName}</span>
                      <span className="block text-[11px] font-normal text-slate-300">
                        {x.p.planName} · {x.p.cycleLabel}
                      </span>
                      <span className="block text-[10px] font-normal text-slate-400">资料更新 {x.p.dataDate}</span>
                      <span className="mt-1.5 flex gap-2">
                        <Link href={`/brands/${x.p.brandSlug}#plans`} className="whitespace-nowrap rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-white/20">
                          返回详情
                        </Link>
                        <button
                          type="button"
                          onClick={() => remove(x.id, `${x.p.brandName} ${x.p.planName}`)}
                          className="inline-flex cursor-pointer items-center gap-0.5 whitespace-nowrap rounded-md bg-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-100 hover:bg-rose-500/40"
                        >
                          <X className="h-3 w-3" /> 移除
                        </button>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {rows.map((r) => (
                  <tr key={r.label} className="align-top">
                    <th scope="row" className="sticky left-0 z-10 w-[8.5rem] min-w-[8.5rem] bg-white px-3 py-2.5 text-left font-semibold text-slate-800">
                      {r.label}
                      {r.note && <span className="block text-[10px] font-normal leading-snug text-slate-400">{r.note}</span>}
                    </th>
                    {valid.map((x) => (
                      <td key={x.id} className="px-3 py-2.5">
                        {r.render(x.p)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CheaperNote plans={valid.map((x) => x.p)} />
          <p className="text-[11px] leading-relaxed text-slate-500">
            以上价格为站长按官网公开页面整理（资料日 {data.dataDateRange}），尚未在结算页逐项核对；购买前以官网当前页面为准。本站不提供线路质量、速度或解锁的测试数据。
          </p>
        </div>
      )}
    </div>
  );
}

/** 只在口径相同（同周期）时，说明哪一个一次付清更少、每 GB 更低；不说“全网最低” */
function CheaperNote({ plans }: { plans: MePlan[] }) {
  const cycles = new Set(plans.map((p) => p.cycle));
  if (cycles.size !== 1) {
    return (
      <p className="rounded-xl bg-[#F5F7FB] p-3 text-xs text-slate-600">
        这几个套餐的计费周期不同（{[...cycles].map((c) => plans.find((p) => p.cycle === c)!.cycleLabel).join(' / ')}），一次付清的金额不能直接比大小；“折算月价”和“标称每 GB”只能作参考，年付还要考虑预付一年的风险。
      </p>
    );
  }
  const cheapest = [...plans].sort((a, b) => a.price - b.price)[0];
  const bestGB = [...plans].sort((a, b) => a.nominalPerGB - b.nominalPerGB)[0];
  return (
    <p className="rounded-xl bg-[#F5F7FB] p-3 text-xs text-slate-600">
      同为{cheapest.cycleLabel}：一次付清最少的是 {cheapest.brandName} {cheapest.planName}（{yuan(cheapest.price)}）；标称每 GB 最低的是 {bestGB.brandName} {bestGB.planName}（¥
      {bestGB.nominalPerGB.toFixed(3)}/GB）。口径：按本周期实际付款和周期合计流量、1 倍率计算，不含优惠码和续费价；用不完的流量不计入节省。
    </p>
  );
}
