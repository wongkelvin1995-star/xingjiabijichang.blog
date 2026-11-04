/**
 * 价格统计（纯计算，只依赖 planPrices.ts 的价格表）。
 *
 * 全站出现的“几个套餐方案”“几个价格选项”“第几低”都从这里算出来，页面和组件里不要手写这些数字。
 * - 价格选项：价格表里的一行，即“某个套餐 × 某个付款周期”。
 * - 套餐方案：同一品牌下不同名称的套餐，例如拂风、驭浪各算一个方案，不论它有几种付款周期。
 */
import { PRICE_SHEETS, type BrandPriceSheet, type CycleCode, type PriceRow } from './planPrices';

export const CYCLE_LABELS: Record<CycleCode, string> = {
  m: '月付',
  q: '季付',
  h: '半年付',
  y: '年付',
  b: '两年付',
  t: '三年付',
  o: '不限时按量',
};

/** 把金额写成“¥20”“¥12.5”：整数不带小数，其余最多两位。 */
export function fmtYuan(n: number): string {
  return `¥${Number.isInteger(n) ? n : n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}`;
}

/** 每 GB 单价统一保留 3 位小数。 */
export function fmtPerGB(n: number): string {
  return `¥${n.toFixed(3)}`;
}

export interface PlanRef {
  name: string;
  cycle: CycleCode;
  price: number;
  monthlyGB: number | null;
  totalGB: number;
  perGB: number;
  note?: string;
}

export interface SheetStats {
  brandId: string;
  dataDate: string;
  /** 价格选项数：价格表的行数（套餐 × 付款周期） */
  optionCount: number;
  /** 套餐方案数：不同名称的套餐 */
  schemeCount: number;
  cycleCounts: Partial<Record<CycleCode, number>>;
  hasMonthly: boolean;
  /** 入门月付：实付金额最低的月付套餐（同价取每 GB 更低的） */
  entryMonthly: PlanRef | null;
  /** 价格最低的年付套餐 */
  cheapestYearly: PlanRef | null;
  /** 月付 / 季付 / 半年付 / 年付里每 GB 单价最低的一行（不含两年付、三年付和不限时包） */
  bestPerGB: PlanRef | null;
  /** 不限时包里每 GB 单价最低的一行 */
  bestUnlimited: PlanRef | null;
}

function toRef(row: PriceRow): PlanRef {
  const [name, cycle, price, monthlyGB, totalGB, note] = row;
  return { name, cycle, price, monthlyGB, totalGB, perGB: price / totalGB, note };
}

function pickMin<T>(list: T[], better: (a: T, b: T) => boolean): T | null {
  if (list.length === 0) return null;
  return list.reduce((best, item) => (better(item, best) ? item : best));
}

function summarize(sheet: BrandPriceSheet): SheetStats {
  const refs = sheet.rows.map(toRef);
  const cycleCounts: Partial<Record<CycleCode, number>> = {};
  for (const r of refs) cycleCounts[r.cycle] = (cycleCounts[r.cycle] ?? 0) + 1;

  const monthly = refs.filter((r) => r.cycle === 'm');
  const yearly = refs.filter((r) => r.cycle === 'y');
  const regular = refs.filter((r) => r.cycle === 'm' || r.cycle === 'q' || r.cycle === 'h' || r.cycle === 'y');
  const unlimited = refs.filter((r) => r.cycle === 'o');

  return {
    brandId: sheet.brandId,
    dataDate: sheet.dataDate,
    optionCount: refs.length,
    schemeCount: new Set(refs.map((r) => r.name)).size,
    cycleCounts,
    hasMonthly: monthly.length > 0,
    entryMonthly: pickMin(monthly, (a, b) => a.price < b.price || (a.price === b.price && a.perGB < b.perGB)),
    cheapestYearly: pickMin(yearly, (a, b) => a.price < b.price),
    bestPerGB: pickMin(regular, (a, b) => a.perGB < b.perGB),
    bestUnlimited: pickMin(unlimited, (a, b) => a.perGB < b.perGB),
  };
}

export const ALL_SHEET_STATS: SheetStats[] = PRICE_SHEETS.map(summarize);

const STATS_BY_BRAND = new Map(ALL_SHEET_STATS.map((s) => [s.brandId, s]));

export function getSheetStats(brandId: string): SheetStats | undefined {
  return STATS_BY_BRAND.get(brandId);
}

/** 品牌卡片、搜索和 meta 描述用的一句话：由价格表生成，不手写。 */
export function buildTagline(brandId: string): string {
  const s = STATS_BY_BRAND.get(brandId);
  if (!s) return '暂未收录价格资料';
  const parts: string[] = [];
  if (s.entryMonthly) parts.push(`月付 ${fmtYuan(s.entryMonthly.price)} 起`);
  if (s.cheapestYearly) parts.push(`年付 ${fmtYuan(s.cheapestYearly.price)} 起`);
  parts.push(`${s.schemeCount} 个套餐方案 / ${s.optionCount} 个价格选项`);
  return parts.join(' · ');
}

// ————— 位次 —————

export type RankMetric =
  | 'entryMonthlyPrice'
  | 'entryMonthlyPerGB'
  | 'cheapestYearlyPrice'
  | 'bestPerGB'
  | 'bestUnlimitedPerGB';

export const RANK_METRIC_LABELS: Record<RankMetric, string> = {
  entryMonthlyPrice: '入门月付价格',
  entryMonthlyPerGB: '入门月付每 GB 单价',
  cheapestYearlyPrice: '最低年付价格',
  bestPerGB: '月/季/半年/年付里的最低每 GB 单价',
  bestUnlimitedPerGB: '不限时包的最低每 GB 单价',
};

function metricValue(s: SheetStats, metric: RankMetric): number | null {
  switch (metric) {
    case 'entryMonthlyPrice':
      return s.entryMonthly?.price ?? null;
    case 'entryMonthlyPerGB':
      return s.entryMonthly ? s.entryMonthly.perGB : null;
    case 'cheapestYearlyPrice':
      return s.cheapestYearly?.price ?? null;
    case 'bestPerGB':
      return s.bestPerGB ? s.bestPerGB.perGB : null;
    case 'bestUnlimitedPerGB':
      return s.bestUnlimited ? s.bestUnlimited.perGB : null;
  }
}

/** 比较时按 4 位小数取整，避免浮点误差把相同的单价算成不同。 */
const cmp = (n: number) => Math.round(n * 10000) / 10000;

export interface RankInfo {
  metric: RankMetric;
  /** 该品牌自己的数值（价格或每 GB 单价） */
  value: number;
  /** 第几低（1 = 最低）；并列时取并列中最靠前的名次 */
  rank: number;
  /** 与它数值相同的品牌数（含它自己，1 表示没有并列） */
  tied: number;
  /** 有这项数据的品牌总数 */
  total: number;
}

export function getRank(brandId: string, metric: RankMetric): RankInfo | null {
  const mine = STATS_BY_BRAND.get(brandId);
  if (!mine) return null;
  const value = metricValue(mine, metric);
  if (value === null) return null;
  const values = ALL_SHEET_STATS.map((s) => metricValue(s, metric)).filter((v): v is number => v !== null);
  const v = cmp(value);
  return {
    metric,
    value,
    rank: 1 + values.filter((x) => cmp(x) < v).length,
    tied: values.filter((x) => cmp(x) === v).length,
    total: values.length,
  };
}

/** 位次的文字说明，例如“第 3 低 / 共 34 家（并列 2 家）”。 */
export function describeRank(info: RankInfo): string {
  const tie = info.tied > 1 ? `，与另外 ${info.tied - 1} 家并列` : '';
  return `第 ${info.rank} 低 / 共 ${info.total} 家${tie}`;
}
