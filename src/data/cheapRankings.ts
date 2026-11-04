import { BRANDS, FEATURED_BRAND_ID, FOCUS_BRAND_IDS, SPOTLIGHT_BRAND_IDS, isRecommendedBrand } from './brands';
import { PRICE_SHEETS, type CycleCode, type PriceRow } from './planPrices';
import { ALL_SHEET_STATS, CYCLE_LABELS, getRank, type PlanRef, type RankInfo, type SheetStats } from './priceStats';

/**
 * “便宜机场”“机场优惠”两个专题页用的排序（纯计算，只依赖价格表）。
 * - 名次一律按价格表实时计算，不手写；优选品牌不置顶，只在出现时标注“本站优选”。
 * - 历史资料品牌（isHistorical）照常参与排序，页面会标注；“直接答案”只取非历史资料的品牌。
 * - 这里只有价格和流量，不写线路、速度、体验类说法。
 */

export interface RankedPlan {
  brandId: string;
  brandName: string;
  brandSlug: string;
  featured: boolean;
  /** 本站推荐品牌（含优选）：表格里加“本站推荐”角标，名次不变 */
  recommended: boolean;
  isHistorical: boolean;
  affiliateUrl: string | null;
  dataDate: string;
  planName: string;
  cycle: CycleCode;
  cycleLabel: string;
  price: number;
  /** 每月流量（不限时包为 null） */
  monthlyGB: number | null;
  /** 周期合计流量（不限时包 = 包内流量） */
  totalGB: number;
  perGB: number;
  note?: string;
}

/** 较月付的折扣：同名套餐的长周期价格 vs 月付 × 月数 */
export interface DiscountEntry extends RankedPlan {
  monthlyPrice: number;
  months: number;
  perMonth: number;
  /** 省下的比例，0.2 = 省 20%（8 折） */
  saved: number;
}

const CYCLE_MONTHS: Record<CycleCode, number> = { m: 1, q: 3, h: 6, y: 12, b: 24, t: 36, o: 0 };
const BRAND_BY_ID = new Map(BRANDS.map((b) => [b.id, b] as const));
const SHEET_BY_ID = new Map(PRICE_SHEETS.map((s) => [s.brandId, s] as const));

function toRef(row: PriceRow): PlanRef {
  const [name, cycle, price, monthlyGB, totalGB, note] = row;
  return { name, cycle, price, monthlyGB, totalGB, perGB: price / totalGB, note };
}

function toRanked(brandId: string, ref: PlanRef): RankedPlan | null {
  const brand = BRAND_BY_ID.get(brandId);
  const sheet = SHEET_BY_ID.get(brandId);
  if (!brand || !sheet) return null;
  return {
    brandId,
    brandName: brand.name,
    brandSlug: brand.slug,
    featured: brand.id === FEATURED_BRAND_ID,
    recommended: isRecommendedBrand(brand.id),
    isHistorical: !!brand.isHistorical,
    affiliateUrl: brand.affiliateUrl,
    dataDate: sheet.dataDate,
    planName: ref.name,
    cycle: ref.cycle,
    cycleLabel: CYCLE_LABELS[ref.cycle],
    price: ref.price,
    monthlyGB: ref.monthlyGB,
    totalGB: ref.totalGB,
    perGB: ref.perGB,
    note: ref.note,
  };
}

/** 比较时按 4 位小数取整，避免浮点误差把相同的单价算成不同。 */
const r4 = (n: number) => Math.round(n * 10000) / 10000;
const byPrice = (a: RankedPlan, b: RankedPlan) =>
  a.price - b.price || r4(a.perGB) - r4(b.perGB) || a.brandName.localeCompare(b.brandName, 'zh');
const byPerGB = (a: RankedPlan, b: RankedPlan) =>
  r4(a.perGB) - r4(b.perGB) || a.price - b.price || a.brandName.localeCompare(b.brandName, 'zh');

function fromStats(pick: (s: SheetStats) => PlanRef | null): RankedPlan[] {
  return ALL_SHEET_STATS.flatMap((s) => {
    const ref = pick(s);
    const ranked = ref ? toRanked(s.brandId, ref) : null;
    return ranked ? [ranked] : [];
  });
}

/** 每家的入门月付（实付最低的月付档），按实付从低到高 */
export function rankEntryMonthly(): RankedPlan[] {
  return fromStats((s) => s.entryMonthly).sort(byPrice);
}

/**
 * 首页“本站重点”品牌的入门月付：只取 SPOTLIGHT_BRAND_IDS 里的品牌，按入门月付从低到高排；
 * 同价时按 SPOTLIGHT_BRAND_IDS 里的先后（站长指定的顺序）。名次靠价格算出来，不手写。
 */
export function spotlightEntryMonthly(): RankedPlan[] {
  const entry = new Map(rankEntryMonthly().map((p) => [p.brandId, p] as const));
  return SPOTLIGHT_BRAND_IDS.flatMap((id, order) => {
    const plan = entry.get(id);
    return plan ? [{ order, plan }] : [];
  })
    .sort((a, b) => a.plan.price - b.plan.price || a.order - b.order)
    .map((x) => x.plan);
}

/** “最低价演算表”的一行：三个口径各取该品牌自己的最低一档，并带上它在全部品牌里的真实位次 */
export interface FocusRow {
  /** 展示序号：本站重点顺序（FOCUS_BRAND_IDS 的先后），不是价格名次 */
  position: number;
  /** 入门月付：实付最低的月付档 */
  entry: RankedPlan;
  /** 最低年付档 */
  yearly: RankedPlan | null;
  /** 月 / 季 / 半年 / 年付里每 GB 最低的一档 */
  perGB: RankedPlan | null;
  rankEntry: RankInfo | null;
  rankYearly: RankInfo | null;
  rankPerGB: RankInfo | null;
}

/**
 * 便宜机场专题页顶部的“最低价演算表”：FOCUS_BRAND_IDS 里的品牌，按站长指定的顺序排列（编辑顺序，不是价格排名）。
 * 每一行的数字只依赖价格表；位次是该品牌在全部品牌里的真实位次，与页面下方各张价格表一致。
 * 价格表里没有月付档的品牌排不进来（入门月付是这张表的主口径）。
 */
export function focusTable(): FocusRow[] {
  const statsById = new Map(ALL_SHEET_STATS.map((s) => [s.brandId, s] as const));
  const rows: Omit<FocusRow, 'position'>[] = [];
  for (const id of FOCUS_BRAND_IDS) {
    const s = statsById.get(id);
    const entry = s?.entryMonthly ? toRanked(id, s.entryMonthly) : null;
    if (!s || !entry) continue;
    rows.push({
      entry,
      yearly: s.cheapestYearly ? toRanked(id, s.cheapestYearly) : null,
      perGB: s.bestPerGB ? toRanked(id, s.bestPerGB) : null,
      rankEntry: getRank(id, 'entryMonthlyPrice'),
      rankYearly: getRank(id, 'cheapestYearlyPrice'),
      rankPerGB: getRank(id, 'bestPerGB'),
    });
  }
  return rows.map((r, i) => ({ ...r, position: i + 1 }));
}

/** 折扣类位次：第几高（1 = 省得最多）；并列时取并列中最靠前的名次 */
export interface DiscountRank {
  rank: number;
  /** 与它省得一样多的品牌数（含它自己） */
  tied: number;
  total: number;
}

function discountRank(list: DiscountEntry[], brandId: string): DiscountRank | null {
  const mine = list.find((d) => d.brandId === brandId);
  if (!mine) return null;
  const same = (a: number, b: number) => Math.abs(a - b) < 1e-9;
  return {
    rank: 1 + list.filter((d) => d.saved > mine.saved && !same(d.saved, mine.saved)).length,
    tied: list.filter((d) => same(d.saved, mine.saved)).length,
    total: list.length,
  };
}

/** 机场优惠页顶部“优惠演算表”的一行：该品牌自己能核对的优惠（都由价格表算出），带它在全部品牌里的真实位次 */
export interface FocusDealRow {
  position: number;
  brandId: string;
  brandName: string;
  brandSlug: string;
  featured: boolean;
  isHistorical: boolean;
  affiliateUrl: string | null;
  dataDate: string;
  /** 年付较月付省得最多的一档（价格表里没有可比的年付档则为 null） */
  yearly: DiscountEntry | null;
  rankYearly: DiscountRank | null;
  /** 两年付、三年付等长周期里省得最多的一档；最省的就是年付时为 null（年付那一格已经写了） */
  best: DiscountEntry | null;
  rankBest: DiscountRank | null;
  /** 最低年付档 */
  cheapestYearly: RankedPlan | null;
  rankCheapestYearly: RankInfo | null;
}

/** 机场优惠页顶部的“优惠演算表”：FOCUS_BRAND_IDS 的顺序（编辑顺序，不是折扣排名），数字都由价格表算出 */
export function focusDeals(): FocusDealRow[] {
  const yearlyList = rankYearlyDiscounts();
  const bestList = rankBestCycleDiscounts();
  const rows: Omit<FocusDealRow, 'position'>[] = [];
  for (const id of FOCUS_BRAND_IDS) {
    const brand = BRAND_BY_ID.get(id);
    const sheet = SHEET_BY_ID.get(id);
    if (!brand || !sheet) continue;
    const stats = ALL_SHEET_STATS.find((s) => s.brandId === id);
    const yearly = yearlyList.find((d) => d.brandId === id) ?? null;
    const bestAny = bestList.find((d) => d.brandId === id) ?? null;
    const best = bestAny && bestAny.cycle !== 'y' ? bestAny : null;
    rows.push({
      brandId: id,
      brandName: brand.name,
      brandSlug: brand.slug,
      featured: brand.id === FEATURED_BRAND_ID,
      isHistorical: !!brand.isHistorical,
      affiliateUrl: brand.affiliateUrl,
      dataDate: sheet.dataDate,
      yearly,
      rankYearly: yearly ? discountRank(yearlyList, id) : null,
      best,
      rankBest: best ? discountRank(bestList, id) : null,
      cheapestYearly: stats?.cheapestYearly ? toRanked(id, stats.cheapestYearly) : null,
      rankCheapestYearly: getRank(id, 'cheapestYearlyPrice'),
    });
  }
  return rows.map((r, i) => ({ ...r, position: i + 1 }));
}

/** 每家价格最低的年付档，按实付从低到高 */
export function rankCheapestYearly(): RankedPlan[] {
  return fromStats((s) => s.cheapestYearly).sort(byPrice);
}

/** 每家月/季/半年/年付里每 GB 最低的一档，按每 GB 从低到高 */
export function rankBestPerGB(): RankedPlan[] {
  return fromStats((s) => s.bestPerGB).sort(byPerGB);
}

const ALL_ROWS: RankedPlan[] = PRICE_SHEETS.flatMap((s) =>
  s.rows.flatMap((row) => {
    const ranked = toRanked(s.brandId, toRef(row));
    return ranked ? [ranked] : [];
  }),
);

/** 每家月付档里每 GB 最低的一档（不含 ¥500 以上的独享定制档），按每 GB 从低到高 */
export function rankMonthlyPerGB(): RankedPlan[] {
  const best = new Map<string, RankedPlan>();
  for (const r of ALL_ROWS) {
    if (r.cycle !== 'm' || r.price >= 500) continue;
    const cur = best.get(r.brandId);
    if (!cur || byPerGB(r, cur) < 0) best.set(r.brandId, r);
  }
  return [...best.values()].sort(byPerGB);
}

/** 实付不超过 max 的月付档（“月付小包”），按实付从低到高 */
export function monthlyMiniPacks(max = 16): RankedPlan[] {
  return ALL_ROWS.filter((r) => r.cycle === 'm' && r.price <= max).sort(byPrice);
}

/** 实付不超过 max 的年付档（“年付小包 / 活动包 / 学生版”），按实付从低到高 */
export function yearlyMiniPacks(max = 120): RankedPlan[] {
  return ALL_ROWS.filter((r) => r.cycle === 'y' && r.price <= max).sort(byPrice);
}

/**
 * 套餐名或备注里带“学生 / 限时 / 活动 / 体验”等字样的档位：资料标注的优惠类套餐，是否仍在售待核验。
 * “限时”前面不能是“不”：“不限时流量包”是一次性流量包，不是限时优惠。
 */
const SPECIAL = /学生|(?<!不)限时|活动|节日|特惠|钜惠|体验|试用|促销|福利|优惠/;
export function specialPlans(): RankedPlan[] {
  return ALL_ROWS.filter((r) => SPECIAL.test(`${r.planName} ${r.note ?? ''}`)).sort(byPrice);
}

/** 所有能和同名月付档比较的长周期档位（季付 / 半年付 / 年付 / 两年付 / 三年付） */
export function allCycleDiscounts(): DiscountEntry[] {
  const out: DiscountEntry[] = [];
  for (const sheet of PRICE_SHEETS) {
    const monthlyByName = new Map<string, number>();
    for (const [name, cycle, price] of sheet.rows) if (cycle === 'm') monthlyByName.set(name, price);
    for (const row of sheet.rows) {
      const [name, cycle, price] = row;
      const months = CYCLE_MONTHS[cycle];
      const monthlyPrice = monthlyByName.get(name);
      if (!monthlyPrice || months <= 1) continue;
      const ranked = toRanked(sheet.brandId, toRef(row));
      if (!ranked) continue;
      out.push({ ...ranked, monthlyPrice, months, perMonth: price / months, saved: 1 - price / (monthlyPrice * months) });
    }
  }
  return out;
}

function bestPerBrand(list: DiscountEntry[]): DiscountEntry[] {
  const best = new Map<string, DiscountEntry>();
  for (const d of list) {
    const cur = best.get(d.brandId);
    if (!cur || d.saved > cur.saved || (d.saved === cur.saved && d.price < cur.price)) best.set(d.brandId, d);
  }
  return [...best.values()]
    .filter((d) => d.saved >= 0.005)
    .sort((a, b) => b.saved - a.saved || a.price - b.price || a.brandName.localeCompare(b.brandName, 'zh'));
}

/** 每家年付较月付省得最多的一档，按省的比例从高到低（只列确实有折扣的） */
export function rankYearlyDiscounts(): DiscountEntry[] {
  return bestPerBrand(allCycleDiscounts().filter((d) => d.cycle === 'y'));
}

/** 每家所有周期里较月付省得最多的一档（两年付、三年付也算），按省的比例从高到低 */
export function rankBestCycleDiscounts(): DiscountEntry[] {
  return bestPerBrand(allCycleDiscounts());
}

/** 0.2 → “20%” */
export function fmtPercent(saved: number): string {
  return `${Math.round(saved * 100)}%`;
}

/** 0.2 → “8 折”，0.15 → “85 折” */
export function fmtZhe(saved: number): string {
  const zhe = Math.round((1 - saved) * 100);
  return zhe % 10 === 0 ? `${zhe / 10} 折` : `${zhe} 折`;
}

/** 去掉历史资料品牌（“直接答案”里用） */
export function current<T extends RankedPlan>(list: T[]): T[] {
  return list.filter((r) => !r.isHistorical);
}
