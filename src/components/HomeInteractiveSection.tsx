'use client';

import React, { useState } from 'react';
import { BudgetSelector, BudgetTier } from './BudgetSelector';
import { PlanComparisonTable } from './PlanComparisonTable';
import { Plan } from '@/types';
import { ShieldCheck } from 'lucide-react';

interface HomeInteractiveSectionProps {
  plans: Plan[];
}

export function HomeInteractiveSection({ plans }: HomeInteractiveSectionProps) {
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('all');

  // Filter plans count for selector badge
  const matchingCount = plans.filter((plan) => {
    if (budgetTier === 'all') return true;
    if (budgetTier === 'unlimited') return plan.billingCycle === 'unlimited';

    const monthlyCost =
      plan.billingCycle === 'monthly'
        ? plan.actualPrice
        : plan.billingCycle === 'yearly'
        ? plan.actualPrice / 12
        : 999;

    if (budgetTier === 'entry') return monthlyCost >= 9 && monthlyCost <= 20;
    if (budgetTier === 'mainstream') return monthlyCost >= 20 && monthlyCost <= 35;
    if (budgetTier === 'pro') return monthlyCost > 35;
    return true;
  }).length;

  return (
    <div className="space-y-12">
      {/* 1. Interactive Budget Selector */}
      <section aria-labelledby="budget-selector-heading">
        <h2 id="budget-selector-heading" className="sr-only">
          预算选择与套餐筛选
        </h2>
        <BudgetSelector
          currentTier={budgetTier}
          onSelectTier={setBudgetTier}
          matchingCount={matchingCount}
        />
      </section>

      {/* 2. Comprehensive Plans Comparison Table */}
      <section id="comparison-table" aria-labelledby="table-heading" className="space-y-4 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-pink-100">
          <div>
            <div className="inline-flex items-center space-x-1.5 rounded-full bg-pink-100 px-3 py-0.5 text-xs font-semibold text-[#7C3AED] mb-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>公开资料对比</span>
            </div>
            <h2 id="table-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
              机场套餐价格对比表
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              每家一档“入门月付”，可按实际付款、每 GB 成本与付款周期排序筛选；优选品牌照常参与排序，不另占位。
            </p>
          </div>
        </div>

        <PlanComparisonTable
          plans={plans}
          budgetTier={budgetTier}
          onBudgetTierChange={setBudgetTier}
        />
      </section>

    </div>
  );
}
