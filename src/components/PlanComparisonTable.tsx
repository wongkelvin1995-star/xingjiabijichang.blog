'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpDown, Info } from 'lucide-react';
import { CompareBarLink, CompareToggleButton } from './user/UserActions';
import { Plan, BillingCycle } from '@/types';
import { BudgetTier } from './BudgetSelector';

interface PlanComparisonTableProps {
  plans: Plan[];
  budgetTier?: BudgetTier;
  onBudgetTierChange?: (tier: BudgetTier) => void;
}

type SortField =
  | 'recommended'
  | 'actualPrice'
  | 'nominalPerGB'
  | 'trafficGB'
  | 'referenceCostPerEffectiveGB';
type SortOrder = 'asc' | 'desc';

const SORT_LABELS: Record<SortField, string> = {
  recommended: '编辑部展示顺序',
  actualPrice: '实际付款金额',
  trafficGB: '包含流量',
  nominalPerGB: '标称每GB成本',
  referenceCostPerEffectiveGB: '参考折算成本',
};

// 窗口变窄时逐步隐藏次要列，同时文字允许折行，保证表格始终完整显示、不出现左右滑动（宽度已留出浏览器滚动条的余量）：
// 1190px 以上显示 8 列核心信息，1480px 以上加上“折合月价与节省”和“线路架构”，1580px 以上显示全部 11 列
// （付款周期合并进“实际付款金额”，不再单独占一列）。1190px 以下改用下方的卡片列表。
const FROM_1480 = 'hidden min-[1480px]:table-cell';
const FROM_1580 = 'hidden min-[1580px]:table-cell';

// 小屏卡片列表一次展示的数量，其余点“显示更多”展开。
const CARDS_PER_PAGE = 12;

/** 预算筛选用的月成本：月付按原价，年付折成月价，其他周期不参与预算档位。 */
function monthlyCost(plan: Plan): number {
  if (plan.billingCycle === 'monthly') return plan.actualPrice;
  if (plan.billingCycle === 'yearly') return plan.actualPrice / 12;
  return Number.POSITIVE_INFINITY;
}

/** 价格排序用：年付先折成月价，保证月付和年付可以直接比较。 */
function comparablePrice(plan: Plan): number {
  return plan.billingCycle === 'yearly' ? plan.actualPrice / 12 : plan.actualPrice;
}

/** “1 倍率（资料标注）”拆成主文字和括号里的出处，分两行显示；没有括号就整句作主文字。 */
function splitNote(text: string): [string, string] {
  const m = text.match(/^(.*?)(（.*）)$/);
  return m ? [m[1], m[2]] : [text, ''];
}

function matchesBudget(plan: Plan, tier: BudgetTier): boolean {
  const cost = monthlyCost(plan);
  switch (tier) {
    case 'entry':
      return cost >= 9 && cost <= 20;
    case 'mainstream':
      return cost >= 20 && cost <= 35;
    case 'pro':
      return cost > 35;
    case 'unlimited':
      return plan.billingCycle === 'unlimited';
    default:
      return true;
  }
}

export function PlanComparisonTable({
  plans,
  budgetTier = 'all',
  onBudgetTierChange,
}: PlanComparisonTableProps) {
  const [cycleFilter, setCycleFilter] = useState<'all' | BillingCycle>('all');
  const [lineTypeFilter, setLineTypeFilter] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  // 默认按编辑部展示顺序：每家品牌的最低月付档按品牌顺序排在最前，其余档位随后。
  const [sortField, setSortField] = useState<SortField>('recommended');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [visibleCards, setVisibleCards] = useState(CARDS_PER_PAGE);

  const filteredPlans = useMemo(() => {
    const query = searchKeyword.trim().toLowerCase();
    const lineQuery = lineTypeFilter.toLowerCase();
    return plans.filter((plan) => {
      if (cycleFilter !== 'all' && plan.billingCycle !== cycleFilter) return false;
      if (!matchesBudget(plan, budgetTier)) return false;
      if (lineTypeFilter !== 'all' && !plan.lineInfo.toLowerCase().includes(lineQuery)) {
        return false;
      }
      if (query) {
        const haystack = [plan.brandName, plan.planName, plan.lineInfo, plan.recommendedTag ?? '']
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [plans, cycleFilter, budgetTier, lineTypeFilter, searchKeyword]);

  const sortedPlans = useMemo(() => {
    return [...filteredPlans].sort((a, b) => {
      if (sortField === 'recommended') {
        if (a.isEntryPlan !== b.isEntryPlan) return a.isEntryPlan ? -1 : 1;
        if (a.brandOrder !== b.brandOrder) return a.brandOrder - b.brandOrder;
        return a.actualPrice - b.actualPrice;
      }

      const valA = sortField === 'actualPrice' ? comparablePrice(a) : a[sortField];
      const valB = sortField === 'actualPrice' ? comparablePrice(b) : b[sortField];
      if (valA === valB) return 0;
      return (valA < valB ? -1 : 1) * (sortOrder === 'asc' ? 1 : -1);
    });
  }, [filteredPlans, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const restoreEditorialOrder = () => {
    setSortField('recommended');
    setSortOrder('asc');
  };

  const sortDirectionLabel =
    sortField === 'recommended'
      ? ''
      : sortField === 'trafficGB'
        ? sortOrder === 'asc'
          ? '（少到多）'
          : '（多到少）'
        : sortOrder === 'asc'
          ? '（低到高）'
          : '（高到低）';

  const hasActiveFilter =
    cycleFilter !== 'all' ||
    lineTypeFilter !== 'all' ||
    searchKeyword !== '' ||
    budgetTier !== 'all' ||
    sortField !== 'recommended';

  const resetFilters = () => {
    setCycleFilter('all');
    setLineTypeFilter('all');
    setSearchKeyword('');
    restoreEditorialOrder();
    setVisibleCards(CARDS_PER_PAGE);
    onBudgetTierChange?.('all');
  };

  const renderSortHeader = (field: SortField, label: string, className: string) => (
    <th
      className={`py-3 px-2.5 font-semibold whitespace-nowrap ${className}`}
      aria-sort={
        sortField === field ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'
      }
    >
      <button
        type="button"
        onClick={() => toggleSort(field)}
        className="flex items-center gap-1 cursor-pointer hover:text-white"
      >
        <span>{label}</span>
        <ArrowUpDown
          className={`h-3 w-3 ${sortField === field ? 'text-pink-300' : 'text-slate-500'}`}
        />
      </button>
    </th>
  );

  return (
    <div className="space-y-4 w-full">
      {/* 1. 筛选栏 */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-pink-100 shadow-xs">
        <p className="text-sm font-semibold text-slate-700">每家机场一个价格：该品牌最低价套餐</p>

        <div className="flex items-center gap-2">
          <select
            value={lineTypeFilter}
            onChange={(e) => setLineTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[13px] text-slate-700 focus:border-[#7C3AED] focus:outline-none cursor-pointer"
            aria-label="筛选线路架构"
          >
            <option value="all">所有线路架构</option>
            <option value="iepl">包含 IEPL 专线</option>
            <option value="iplc">包含 IPLC 专线</option>
            <option value="bgp">包含 BGP 中转</option>
          </select>

          <input
            type="text"
            placeholder="搜索品牌或套餐..."
            aria-label="搜索品牌或套餐"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[13px] text-slate-700 placeholder-slate-400 focus:border-[#7C3AED] focus:outline-none w-36 sm:w-48"
          />

          {hasActiveFilter && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-[13px] text-[#7C3AED] hover:underline font-semibold whitespace-nowrap cursor-pointer px-1"
            >
              重置
            </button>
          )}
        </div>
      </div>

      {/* 2. 信息栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[13px] text-slate-500 px-1 gap-1">
        <div className="flex items-center space-x-1.5">
          <Info className="h-3.5 w-3.5 text-[#7C3AED] shrink-0" />
          <span>
            当前展示 <strong className="text-slate-800 font-bold">{sortedPlans.length}</strong> 档收录套餐（价格待核验，以官网为准）。每家只列“入门月付”（实付最低的月付档），全部套餐见各品牌资料页。
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-500 text-xs sm:text-[13px]">
          <span>
            排序基准：
            <span className="text-slate-600 font-medium">
              {SORT_LABELS[sortField]}
              {sortDirectionLabel}
            </span>
          </span>
          <CompareBarLink />
        </div>
      </div>

      {/* 3. 桌面表格（1190px 以上）：不出现左右滑动——文字允许折行，列数随窗口变宽逐步增加 */}
      <div className="hidden min-[1190px]:block rounded-2xl border border-pink-100 bg-white shadow-xs overflow-hidden w-full">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead className="bg-[#0F172A] text-slate-200 text-xs">
              <tr>
                <th className="py-3 px-3 font-bold text-white whitespace-nowrap">
                  <button
                    type="button"
                    onClick={restoreEditorialOrder}
                    title="点击恢复编辑部展示顺序（灵动云第一）"
                    className="flex items-center space-x-1 cursor-pointer hover:text-pink-300"
                  >
                    <span>品牌与套餐</span>
                    {sortField === 'recommended' && (
                      <span className="text-pink-400 text-[12px] font-normal">★首推</span>
                    )}
                  </button>
                </th>
                {renderSortHeader('actualPrice', '实际付款金额', '')}
                {renderSortHeader('trafficGB', '包含流量与重置', '')}
                <th className="py-3 px-2.5 font-semibold whitespace-nowrap">流量倍率</th>
                {renderSortHeader('nominalPerGB', '标称每GB成本', '')}
                {renderSortHeader('referenceCostPerEffectiveGB', '参考折算成本', '')}
                <th className="py-3 px-2.5 font-semibold whitespace-nowrap">设备限制</th>
                <th className={`${FROM_1480} py-3 px-2.5 font-semibold whitespace-nowrap`}>折合月价与节省</th>
                <th className={`${FROM_1480} py-3 px-2.5 font-semibold whitespace-nowrap`}>线路架构</th>
                <th className={`${FROM_1580} py-3 px-2.5 font-semibold whitespace-nowrap`}>核验时间</th>
                <th className="py-3 px-3 font-semibold text-center whitespace-nowrap">操作</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sortedPlans.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    没有找到符合当前筛选条件的套餐。请尝试重置筛选或更改关键字。
                  </td>
                </tr>
              ) : (
                sortedPlans.map((plan, index) => {
                  const isTopPick = index === 0 && plan.brandOrder === 1;
                  const [multiplier, multiplierNote] = splitNote(plan.trafficMultiplier);
                  const [device, deviceNote] = splitNote(plan.deviceLimit);
                  return (
                    <tr
                      key={plan.id}
                      className={`align-top transition-colors ${
                        isTopPick
                          ? 'bg-[#FFF9FD]/95 hover:bg-pink-50/80 font-medium'
                          : 'hover:bg-slate-50/90'
                      }`}
                    >
                      {/* 品牌与套餐：名字 + 套餐名 + 入门月付角标 */}
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                          <Link
                            href={`/brands/${plan.brandId}`}
                            className="flex min-h-8 items-center whitespace-nowrap text-sm font-bold text-[#0F172A] transition-colors hover:text-[#7C3AED]"
                          >
                            {isTopPick && (
                              <span className="mr-1 text-pink-500 font-bold" title="编辑推荐第一位">
                                ★
                              </span>
                            )}
                            <span>{plan.brandName}</span>
                          </Link>
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-700">
                            {plan.planName}
                          </span>
                        </div>
                        {plan.recommendedTag && (
                          <div className="mt-0.5">
                            <span className="inline-flex items-center rounded-md border border-purple-100 bg-purple-50 px-1.5 py-0.5 text-[12px] font-semibold text-[#7C3AED] whitespace-nowrap">
                              {plan.recommendedTag}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* 实际付款：金额 + 付款周期（周期不再单独占一列） */}
                      <td className="py-3 px-2.5">
                        <span className="block whitespace-nowrap text-base font-black text-[#7C3AED]">
                          {plan.currency}
                          {plan.actualPrice.toFixed(2)}
                        </span>
                        <span className="mt-1 flex items-center gap-1 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded px-1.5 py-px text-[12px] font-bold ${
                              plan.billingCycle === 'monthly'
                                ? 'border border-blue-100 bg-blue-50 text-blue-700'
                                : plan.billingCycle === 'yearly'
                                  ? 'border border-purple-100 bg-purple-50 text-purple-700'
                                  : 'border border-emerald-100 bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {plan.billingCycleLabel}
                          </span>
                          <span className="text-[12px] text-slate-500">实际扣款</span>
                        </span>
                      </td>

                      {/* 包含流量与重置：完整写出重置规则，不再截断 */}
                      <td className="py-3 px-2.5">
                        <span className="block whitespace-nowrap font-bold text-slate-900">{plan.trafficGB} GB</span>
                        <span className="mt-0.5 block text-[12px] leading-snug text-slate-500">{plan.trafficResetRule}</span>
                      </td>

                      <td className="py-3 px-2.5">
                        <span className="block whitespace-nowrap font-medium text-slate-800">{multiplier}</span>
                        {multiplierNote && <span className="mt-0.5 block text-[12px] text-slate-500">{multiplierNote}</span>}
                      </td>

                      <td className="py-3 px-2.5">
                        <span className="block whitespace-nowrap font-bold text-slate-900">¥{plan.nominalPerGB.toFixed(3)}</span>
                        <span className="mt-0.5 block text-[12px] text-slate-500">/ GB</span>
                      </td>

                      <td className="py-3 px-2.5">
                        <span className="block whitespace-nowrap font-bold text-[#7C3AED]">
                          ¥{plan.referenceCostPerEffectiveGB.toFixed(3)}
                        </span>
                        <span className="mt-0.5 block text-[12px] text-slate-500">/ 有效GB</span>
                      </td>

                      <td className="py-3 px-2.5">
                        <span className="block font-medium text-slate-800">{device}</span>
                        {deviceNote && <span className="mt-0.5 block text-[12px] text-slate-500">{deviceNote}</span>}
                      </td>

                      <td className={`${FROM_1480} py-3 px-2.5`}>
                        <span className="block whitespace-nowrap font-medium text-slate-800">{plan.perMonthLabel}</span>
                        {plan.savingsLabel && (
                          <span className="mt-0.5 block text-[12px] text-emerald-700">{plan.savingsLabel}</span>
                        )}
                      </td>

                      <td className={`${FROM_1480} py-3 px-2.5`}>
                        <span className="block max-w-[12rem] font-medium leading-snug text-slate-800 line-clamp-3" title={plan.lineInfo}>
                          {plan.lineInfo}
                        </span>
                      </td>

                      <td className={`${FROM_1580} py-3 px-2.5`}>
                        <span className="block whitespace-nowrap font-medium text-amber-700">{plan.verifyStatus}</span>
                        <span className="mt-0.5 block whitespace-nowrap text-[12px] text-slate-500">资料日 {plan.dataDate}</span>
                      </td>

                      {/* 三个按钮上下排、等宽，文字不折行 */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col items-stretch gap-1.5">
                          <Link
                            href={`/brands/${plan.brandId}`}
                            className="inline-flex min-h-8 items-center justify-center whitespace-nowrap rounded-xl bg-[#7C3AED] px-3 text-[13px] font-bold text-white shadow-xs transition-colors hover:bg-[#6D28D9]"
                          >
                            套餐与资料
                          </Link>
                          {/* 第二行：对比 + 用户注册并排，整行比三个按钮竖着排矮 40px 左右 */}
                          <div className="flex items-start gap-1.5">
                            <CompareToggleButton planId={plan.id} />
                            {plan.affiliateUrl && (
                              <a
                                href={plan.affiliateUrl}
                                target="_blank"
                                rel="sponsored nofollow noopener"
                                aria-label={`${plan.brandName} 用户注册（推广链接，新窗口打开）`}
                                className="inline-flex min-h-8 flex-1 items-center justify-center whitespace-nowrap rounded-xl border border-purple-200 bg-purple-50 px-3 text-[13px] font-semibold text-[#6D28D9] transition-colors hover:border-purple-300 hover:bg-purple-100"
                              >
                                用户注册
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. 卡片列表（1190px 以下：手机、平板和窄窗口） */}
      <div className="min-[1190px]:hidden space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedPlans.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-500 bg-white rounded-xl border border-pink-100 p-4">
              没有找到符合筛选条件的套餐。
            </div>
          ) : (
            sortedPlans.slice(0, visibleCards).map((plan) => (
              <div
                key={plan.id}
                className="rounded-2xl border border-pink-100 bg-white p-4 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/brands/${plan.brandId}`}
                        className="inline-flex min-h-8 items-center text-base font-bold text-[#0F172A] hover:text-[#7C3AED]"
                      >
                        {plan.brandName}
                      </Link>
                      <span className="ml-2 text-[13px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {plan.planName}
                      </span>
                    </div>
                    <span className="text-sm font-black text-[#7C3AED] whitespace-nowrap">
                      {plan.currency}
                      {plan.actualPrice}
                      <span className="text-[12px] text-slate-500 font-normal">
                        /{plan.billingCycleLabel}
                      </span>
                    </span>
                  </div>

                  {plan.recommendedTag && (
                    <div className="mt-1">
                      <span className="inline-flex rounded-md bg-purple-50 px-2 py-0.5 text-[12px] font-semibold text-[#7C3AED] border border-purple-100">
                        {plan.recommendedTag}
                      </span>
                    </div>
                  )}

                  <p className="mt-2 text-xs text-slate-500">
                    {plan.perMonthLabel}
                    {plan.savingsLabel && (
                      <span className="text-emerald-600"> · {plan.savingsLabel}</span>
                    )}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[13px] border-t border-b border-slate-50 py-2">
                    <div>
                      <span className="text-slate-500 text-[12px] block">流量配额</span>
                      <span className="font-semibold text-slate-800">{plan.trafficGB} GB</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[12px] block">流量倍率</span>
                      <span className="font-semibold text-slate-800">{plan.trafficMultiplier}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[12px] block">标称单价</span>
                      <span className="font-semibold text-slate-800">
                        ¥{plan.nominalPerGB.toFixed(3)}/GB
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[12px] block">有效GB成本</span>
                      <span className="font-semibold text-[#7C3AED]">
                        ¥{plan.referenceCostPerEffectiveGB.toFixed(3)}/GB
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-slate-500 space-y-1">
                    <div>
                      <span className="text-slate-500">线路：</span>
                      {plan.lineInfo}
                    </div>
                    <div>
                      <span className="text-slate-500">设备：</span>
                      {plan.deviceLimit}
                    </div>
                  </div>
                </div>

                {/* 按钮文字不折行；放不下时整个按钮换行 */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                  <CompareToggleButton planId={plan.id} />
                  <Link
                    href={`/brands/${plan.brandId}`}
                    className="flex-1 whitespace-nowrap text-center py-1.5 px-2 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 hover:border-pink-300"
                  >
                    品牌资料
                  </Link>
                  {plan.affiliateUrl && (
                    <a
                      href={plan.affiliateUrl}
                      target="_blank"
                      rel="sponsored nofollow noopener"
                      aria-label={`${plan.brandName} 用户注册（推广链接，新窗口打开）`}
                      className="flex-1 whitespace-nowrap text-center py-1.5 px-2 rounded-xl border border-purple-200 bg-purple-50 text-[13px] font-semibold text-[#6D28D9]"
                    >
                      用户注册
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {sortedPlans.length > visibleCards && (
          <button
            type="button"
            onClick={() => setVisibleCards((count) => count + CARDS_PER_PAGE)}
            className="mx-auto flex items-center rounded-full border border-pink-200 bg-white px-5 py-2 text-[13px] font-semibold text-[#7C3AED] shadow-xs hover:bg-pink-50 transition-colors cursor-pointer"
          >
            显示更多（还有 {sortedPlans.length - visibleCards} 档）
          </button>
        )}
      </div>

      {/* 口径说明 */}
      <p className="text-[12px] text-slate-500 leading-relaxed px-1">
        口径：资料未标注倍率、设备数的，按 1 倍率计算并标明“未标注”；写明的按资料显示。“入门月付”是每家实付最低的月付档，不是推荐。价格待核验，以官网为准。表中“用户注册”是本站的推广（邀请）链接，通过它注册或购买，本站可能获得佣金，不影响你支付的价格；详见
        <Link href="/disclosure" className="whitespace-nowrap text-[#7C3AED] hover:underline">推广合作与资料说明</Link>。
      </p>
    </div>
  );
}
