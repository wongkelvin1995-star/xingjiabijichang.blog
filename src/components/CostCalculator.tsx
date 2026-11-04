'use client';

import React, { useMemo, useState } from 'react';
import { Calculator, AlertTriangle, Info, RotateCcw } from 'lucide-react';
import { computeCost, type CalcCycle, type CalcInput } from '@/lib/costMath';

interface Preset extends CalcInput {
  name: string;
}

/** 示例数值只是演示输入，不代表任何品牌的真实套餐。 */
const PRESETS: Preset[] = [
  { name: '示例·月付 ¥28 / 280GB', price: 28, cycle: 'monthly', traffic: 280, yearlyMode: 'total', multiplier: 1, monthlyUsage: 80 },
  { name: '示例·倍率 2 的月付', price: 20, cycle: 'monthly', traffic: 100, yearlyMode: 'total', multiplier: 2, monthlyUsage: 50 },
  { name: '示例·年付每月重置', price: 99, cycle: 'yearly', traffic: 70, yearlyMode: 'monthlyReset', multiplier: 1, monthlyUsage: 50 },
  { name: '示例·年付总量', price: 198, cycle: 'yearly', traffic: 3000, yearlyMode: 'total', multiplier: 1, monthlyUsage: 120 },
  { name: '示例·不限时流量包', price: 199, cycle: 'unlimited', traffic: 150, yearlyMode: 'total', multiplier: 1, monthlyUsage: 30 },
];

const CYCLES: { id: CalcCycle; label: string }[] = [
  { id: 'monthly', label: '月付' },
  { id: 'yearly', label: '年付（一次付清）' },
  { id: 'unlimited', label: '不限时流量包' },
];

function yuan(n: number, d = 2): string {
  return `¥${n.toFixed(d)}`;
}
function gb(n: number): string {
  return Number.isInteger(n) ? `${n} GB` : `${n.toFixed(1)} GB`;
}

export function CostCalculator() {
  const [input, setInput] = useState<CalcInput>({ ...PRESETS[0] });
  const set = <K extends keyof CalcInput>(k: K, v: CalcInput[K]) => setInput((s) => ({ ...s, [k]: v }));
  const applyPreset = (p: Preset) => setInput({ price: p.price, cycle: p.cycle, traffic: p.traffic, yearlyMode: p.yearlyMode, multiplier: p.multiplier, monthlyUsage: p.monthlyUsage });

  const r = useMemo(() => computeCost(input), [input]);
  const isYearly = input.cycle === 'yearly';
  const isPack = input.cycle === 'unlimited';
  const trafficLabel = isPack ? '流量包总流量（GB）' : isYearly && input.yearlyMode === 'total' ? '全年共计流量（GB）' : '每月标称流量（GB）';

  const numInput = (k: 'price' | 'traffic' | 'monthlyUsage', props: Partial<React.InputHTMLAttributes<HTMLInputElement>> = {}) => (
    <input
      type="number"
      inputMode="decimal"
      value={Number.isFinite(input[k]) ? input[k] : ''}
      onChange={(e) => {
        const v = e.target.value === '' ? NaN : parseFloat(e.target.value);
        set(k, Number.isNaN(v) ? 0 : v);
      }}
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#6955E8]"
      {...props}
    />
  );

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6955E8] text-white">
              <Calculator className="h-4 w-4" />
            </span>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#18243B]">输入套餐信息，实时计算</p>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            三个结果：可用额度 = 标称流量 ÷ 倍率；额度单价 = 周期费用 ÷ 可用额度；实际用量单价 = 周期费用 ÷ 实际用量。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 font-medium mr-1">示例输入：</span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p)}
              className="min-h-8 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 hover:border-purple-300 hover:bg-purple-50 hover:text-[#6955E8] transition-colors cursor-pointer"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* 输入 */}
        <div className="lg:col-span-7 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">1. 付款周期</label>
            <div className="grid grid-cols-3 gap-2">
              {CYCLES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => set('cycle', c.id)}
                  className={`min-h-10 rounded-xl border py-2 px-1 text-xs font-semibold transition-all cursor-pointer ${
                    input.cycle === c.id
                      ? 'border-[#6955E8] bg-purple-50/50 text-[#6955E8] ring-1 ring-[#6955E8]/30'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            {isYearly && (
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="text-slate-500 self-center">年付流量规则：</span>
                {(
                  [
                    ['monthlyReset', '每月 N GB，按月重置'],
                    ['total', '全年共 N GB'],
                  ] as const
                ).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => set('yearlyMode', mode)}
                    className={`min-h-8 rounded-lg border px-3 py-1 font-medium cursor-pointer ${
                      input.yearlyMode === mode ? 'border-[#6955E8] bg-purple-50 text-[#6955E8]' : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              2. 本周期实际付款金额（元）{isYearly ? '：年付一次付清的总额' : isPack ? '：流量包一次性价格' : ''}
            </label>
            {numInput('price', { min: 0, step: 1 })}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">3. {trafficLabel}</label>
            {numInput('traffic', { min: 0, step: 10 })}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">4. 流量倍率（1 = 用多少扣多少）</label>
              <span className="text-xs font-bold text-[#6955E8]">{input.multiplier.toFixed(1)}×</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={3}
              step={0.1}
              value={input.multiplier}
              onChange={(e) => set('multiplier', parseFloat(e.target.value))}
              className="h-6 w-full accent-[#6955E8] cursor-pointer"
              aria-label="流量倍率"
            />
            <div className="mt-1 flex justify-between text-[12px] text-slate-500">
              <span>0.2×</span>
              <span className="text-[#6955E8]">1.0× 基准</span>
              <span>2.0× 用 1GB 扣 2GB</span>
              <span>3.0×</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">5. 你每月实际用量（GB，可填 0）</label>
              <span className="text-xs font-bold text-slate-700">{gb(input.monthlyUsage)} / 月</span>
            </div>
            {numInput('monthlyUsage', { min: 0, step: 5 })}
          </div>
        </div>

        {/* 结果 */}
        <div className="lg:col-span-5 rounded-2xl border border-purple-100 bg-gradient-to-br from-[#F5F7FB] to-[#EAF3FF]/40 p-5 sm:p-6 flex flex-col justify-between space-y-6">
          {!r.valid ? (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <span>{r.error}</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-purple-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">计算结果</span>
                <span className="rounded-full bg-[#6955E8]/10 px-2 py-0.5 text-[11px] font-bold text-[#6955E8]">随输入实时计算</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-white p-3 border border-slate-100">
                  <span className="text-slate-500 block text-[12px]">可用额度（本周期）</span>
                  <span className="text-lg font-bold text-slate-900 mt-0.5 block">{gb(r.usableQuota)}</span>
                  <span className="text-[11px] text-slate-500">
                    {isYearly && input.yearlyMode === 'monthlyReset' ? `${input.traffic} × 12` : input.traffic} ÷ {input.multiplier}×
                    {r.usableMonthly !== null && isYearly ? ` ≈ 每月 ${gb(r.usableMonthly)}` : ''}
                  </span>
                </div>
                <div className="rounded-xl bg-white p-3 border border-slate-100">
                  <span className="text-slate-500 block text-[12px]">额度单价（全用完）</span>
                  <span className="text-lg font-bold text-[#6955E8] mt-0.5 block">{yuan(r.quotaPerGB, 3)}/GB</span>
                  <span className="text-[11px] text-slate-500">标称单价 {yuan(r.nominalPerGB, 3)}/GB</span>
                </div>
              </div>

              <div className="rounded-xl bg-white p-4 border border-purple-100 shadow-xs">
                <span className="text-xs text-slate-500 block mb-1">按实际用量折算的单价</span>
                {isPack ? (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    流量包用完为止、不会到期清零，最终单价就是额度单价 <strong className="text-[#6955E8]">{yuan(r.quotaPerGB, 3)}/GB</strong>。
                    {r.packMonths !== null ? ` 按每月 ${gb(input.monthlyUsage)} 估算，这包大约能用 ${r.packMonths.toFixed(1)} 个月（是否有有效期以官网为准）。` : ' 填入每月用量可估算能用几个月。'}
                  </p>
                ) : r.usagePerGB === null ? (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    每月用量为 0 时无法计算“实际用量单价”（没有分母）。这意味着整份额度都没用上，费用全部闲置：{yuan(input.price)}/周期。
                  </p>
                ) : (
                  <>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-extrabold text-[#6955E8]">{yuan(r.usagePerGB, 3)}</span>
                      <span className="text-xs text-slate-500">/ GB</span>
                    </div>
                    <p className="mt-1.5 text-[12px] text-slate-500">
                      {yuan(input.price)} ÷ {gb(r.periodUsage)}
                      {isYearly ? `（每月 ${gb(input.monthlyUsage)} × 12）` : ''}
                      {r.monthlyOutlay !== null && isYearly ? ` · 折合月支出 ${yuan(r.monthlyOutlay)}` : ''}
                    </p>
                  </>
                )}
              </div>

              {r.overQuota && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-800 space-y-1">
                  <div className="flex items-center font-bold text-red-900">
                    <AlertTriangle className="mr-1.5 h-4 w-4 text-red-600" />
                    用量超出可用额度
                  </div>
                  <p className="text-[12px] leading-relaxed">
                    你的用量比这份套餐在 {input.multiplier}× 倍率下的可用额度多 {gb(r.overBy)}（{isYearly && input.yearlyMode === 'monthlyReset' ? '全年合计' : '本周期'}）。
                    上面的“实际用量单价”已经超出套餐范围，超出部分要么无法使用，要么需要另外购买，按实际用量折算的单价不再成立，请换更大额度或更低倍率的套餐再算。
                  </p>
                </div>
              )}

              {!r.overQuota && r.idleRatio !== null && r.idleRatio > 0.1 && r.idleCost !== null && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-800 space-y-1">
                  <div className="flex items-center font-bold text-amber-900">
                    <Info className="mr-1.5 h-4 w-4 text-amber-600" />
                    闲置费用估算（费用分摊，不是保证节省）
                  </div>
                  <p className="text-[12px] leading-relaxed">
                    按每月 {gb(input.monthlyUsage)} 计算，大约 {(r.idleRatio * 100).toFixed(0)}% 的可用额度没用上，分摊到这部分额度的费用约 {yuan(r.idleCost)}/周期。
                    这只是费用分摊的估算：换小档不一定省这么多，额度能结转的套餐也不算浪费。
                  </p>
                </div>
              )}

              {input.multiplier >= 1.5 && (
                <div className="rounded-xl bg-purple-50 border border-purple-200 p-3.5 text-xs text-purple-900 space-y-1">
                  <div className="flex items-center font-bold">
                    <AlertTriangle className="mr-1.5 h-4 w-4 text-purple-600" />
                    高倍率提醒
                  </div>
                  <p className="text-[12px] leading-relaxed">
                    {input.multiplier}× 倍率下，标称 {gb(input.traffic)} 只能用 {gb(input.traffic / input.multiplier)}，额度单价从 {yuan(r.nominalPerGB, 3)} 上升到 {yuan(r.quotaPerGB, 3)}/GB。
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="pt-3 border-t border-purple-100 flex items-center justify-between text-xs text-slate-500 gap-2">
            <span>只计算价格，不评价线路质量</span>
            <button
              type="button"
              onClick={() => applyPreset(PRESETS[0])}
              className="inline-flex items-center text-xs font-medium text-[#6955E8] hover:underline cursor-pointer"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              恢复示例
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
