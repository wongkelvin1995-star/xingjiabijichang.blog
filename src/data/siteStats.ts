/**
 * 全站统计口径：首页、品牌库、披露页、元信息里出现的所有数量都从这里取，不在组件里手写。
 *
 * - brandCount：收录品牌数（brands.ts 里的品牌）。
 * - brandsWithMonthlyCount：价格表里至少有一档月付套餐的品牌数，即“有可比较月付资料”的品牌。
 * - planSchemeCount：套餐方案数（同一品牌下不同名称的套餐，不论有几种付款周期）。
 * - priceOptionCount：价格选项数（套餐 × 付款周期，价格表的总行数）。
 */
import { BRANDS } from './brands';
import { ALL_SHEET_STATS, CYCLE_LABELS } from './priceStats';
import type { CycleCode } from './planPrices';

const brandIds = new Set(BRANDS.map((b) => b.id));
const sheets = ALL_SHEET_STATS.filter((s) => brandIds.has(s.brandId));

const cycleCounts: Record<CycleCode, number> = { m: 0, q: 0, h: 0, y: 0, b: 0, t: 0, o: 0 };
for (const s of sheets) {
  for (const [code, n] of Object.entries(s.cycleCounts) as [CycleCode, number][]) cycleCounts[code] += n;
}

const withMonthly = new Set(sheets.filter((s) => s.hasMonthly).map((s) => s.brandId));
const withoutMonthly = BRANDS.filter((b) => !withMonthly.has(b.id)).map((b) => b.name);
const dataDates = [...new Set(sheets.map((s) => s.dataDate))].sort();

export const SITE_STATS = {
  brandCount: BRANDS.length,
  brandsWithMonthlyCount: withMonthly.size,
  /** 没有月付资料的品牌名称：只保留名称与资料状态，不写价格 */
  brandsWithoutMonthly: withoutMonthly,
  planSchemeCount: sheets.reduce((n, s) => n + s.schemeCount, 0),
  priceOptionCount: sheets.reduce((n, s) => n + s.optionCount, 0),
  cycleCounts,
  /** 价格资料日期（从早到晚去重） */
  dataDates,
  earliestDataDate: dataDates[0] ?? '',
  latestDataDate: dataDates[dataDates.length - 1] ?? '',
} as const;

/** 一句话说明品牌数与月付资料的关系。 */
export function describeBrandCoverage(): string {
  const { brandCount, brandsWithMonthlyCount, brandsWithoutMonthly } = SITE_STATS;
  if (brandsWithoutMonthly.length === 0) {
    return `收录 ${brandCount} 家，全部有可比较的月付套餐资料`;
  }
  return `收录 ${brandCount} 家，其中 ${brandsWithMonthlyCount} 家有可比较的月付套餐资料，其余 ${brandsWithoutMonthly.length} 家（${brandsWithoutMonthly.join('、')}）只保留名称与资料状态，不列价格`;
}

/** 各付款周期的价格选项数，例如“月付 128 · 季付 98 …”（只列有数据的周期）。 */
export function describeCycleCounts(): string {
  return (Object.keys(CYCLE_LABELS) as CycleCode[])
    .filter((code) => cycleCounts[code] > 0)
    .map((code) => `${CYCLE_LABELS[code]} ${cycleCounts[code]}`)
    .join(' · ');
}
