'use client';

import React from 'react';
import { Wallet, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export type BudgetTier = 'all' | 'entry' | 'mainstream' | 'pro' | 'unlimited';

interface BudgetSelectorProps {
  currentTier: BudgetTier;
  onSelectTier: (tier: BudgetTier) => void;
  matchingCount: number;
}

export function BudgetSelector({
  currentTier,
  onSelectTier,
  matchingCount,
}: BudgetSelectorProps) {
  const tiers = [
    {
      id: 'all' as BudgetTier,
      label: '全部预算',
      sublabel: '查看所有收录方案',
      range: '全部',
      recommendedFor: '查看完整横向数据矩阵',
    },
    {
      id: 'entry' as BudgetTier,
      label: '10 - 20 元 / 月',
      sublabel: '经济轻量·入门尝鲜',
      range: '¥10 - ¥20',
      recommendedFor: '轻度浏览、查阅文献、学生党',
    },
    {
      id: 'mainstream' as BudgetTier,
      label: '20 - 35 元 / 月',
      sublabel: '主流甜品·个人主力',
      range: '¥20 - ¥35',
      recommendedFor: '看视频、使用 AI 工具、多设备同时在线',
    },
    {
      id: 'pro' as BudgetTier,
      label: '35 - 50 元 / 月',
      sublabel: '更高预算·专线类套餐',
      range: '¥35 - ¥50',
      recommendedFor: '远程办公、跨境办公等对稳定性要求更高的场景',
    },
    {
      id: 'unlimited' as BudgetTier,
      label: '不限时按量',
      sublabel: '按量付费·适合备用',
      range: '按需扣费',
      recommendedFor: '低频使用、防主力故障断连备用',
    },
  ];

  const handleSelectTier = (tierId: BudgetTier) => {
    onSelectTier(tierId);
    // Smooth scroll down to comparison table for immediate feedback
    const tableEl = document.getElementById('comparison-table');
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-[#6955E8]">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#18243B]">
              第一步：选定你的月度真实预算
            </h3>
            <p className="text-xs text-slate-500">
              按月度预算筛选符合该价格区间的收录套餐（价格待核验，以官网为准）
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center rounded-full bg-[#EAF3FF] px-3 py-1 text-xs font-semibold text-[#6955E8]">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            已匹配 {matchingCount} 款候选套餐
          </span>
        </div>
      </div>

      {/* Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {tiers.map((tier) => {
          const isActive = currentTier === tier.id;
          return (
            <button
              key={tier.id}
              onClick={() => handleSelectTier(tier.id)}
              className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                isActive
                  ? 'border-[#6955E8] bg-purple-50/50 shadow-xs ring-2 ring-[#6955E8]/20'
                  : 'border-slate-200 bg-[#F5F7FB]/60 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {isActive && (
                <div className="absolute top-2 right-2 text-[#6955E8]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}
              <span className="text-[12px] font-semibold text-slate-500 mb-0.5">
                {tier.range}
              </span>
              <span
                className={`text-sm font-bold tracking-tight mb-1 ${
                  isActive ? 'text-[#6955E8]' : 'text-[#18243B]'
                }`}
              >
                {tier.label}
              </span>
              <span className="text-[12px] text-slate-500 leading-tight">
                {tier.sublabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Tier Insight Note */}
      <div className="mt-4 rounded-xl bg-[#F5F7FB] px-4 py-3 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-slate-100">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-[#18243B]">选型参考：</span>
          <span>
            {tiers.find((t) => t.id === currentTier)?.recommendedFor}
          </span>
        </div>
        <a
          href="#comparison-table"
          className="inline-flex min-h-8 items-center text-xs font-medium text-[#6955E8] hover:underline shrink-0"
        >
          <span>查看对应比较表</span>
          <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
