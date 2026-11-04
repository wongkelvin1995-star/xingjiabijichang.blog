import type { BillingCycle, Plan } from '@/types';
import { BRANDS } from './brands';
import {
  PRICE_SHEETS,
  type BrandPriceSheet,
  type CycleCode,
} from './planPrices';

/**
 * 套餐数据说明
 * - 原始价格表在 planPrices.ts（每家品牌一张表）。这里只负责把表格转换成页面使用的 Plan 对象，不手写任何价格。
 * - 品牌页（/brands/xxx）展示该品牌的全部套餐；首页对比表（PLANS）每家只取“入门月付”一档，避免表格过长。
 * - 资料里没有标注倍率、设备数的套餐，倍率显示“1 倍率（资料未标注）”、设备显示“设备数未标注”（编辑部统一算法，未逐家核实）；
 *   资料里写明“1 倍率”“不限设备”“最多 N 台”的按资料显示。参考折算成本一律按 1 倍率计算，所以与标称成本相同。
 * - 价格为整理时点的参考值，尚未在各官网结算页逐项核验，页面统一标注“待核验”。
 * - 品牌在首页对比表里的先后顺序由 brands.ts 里的 editorialOrder 决定，这里不再单独维护一份。
 */

const CYCLES: Record<
  CycleCode,
  { cycle: BillingCycle; label: Plan['billingCycleLabel']; months: number }
> = {
  m: { cycle: 'monthly', label: '月付', months: 1 },
  q: { cycle: 'quarterly', label: '季付', months: 3 },
  h: { cycle: 'semiannual', label: '半年付', months: 6 },
  y: { cycle: 'yearly', label: '年付', months: 12 },
  b: { cycle: 'biennial', label: '两年付', months: 24 },
  t: { cycle: 'triennial', label: '三年付', months: 36 },
  o: { cycle: 'unlimited', label: '不限时按量', months: 0 },
};

/** 资料里没有写倍率时显示这一条：单价按 1 倍率计算，但要让读者看出这不是资料核实的结果（控制在 10 个字内，表格里不折行）。 */
const TRAFFIC_MULTIPLIER = '1 倍率（资料未标注）';
/** 资料里没有写设备数的套餐显示这一条；资料写明“不限设备”“最多 N 台”的按资料显示（见 deviceLimitFromNote）。 */
const DEVICE_LIMIT = '设备数未标注';
const VERIFY_STATUS = '待核验';

/** 金额/数字显示：整数不带小数，其余最多两位。 */
function num(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

/** 从备注里取出“流量刷新/重置”那一段（备注用 ； 分隔）。 */
function resetRuleFromNote(note?: string): string {
  return (
    note
      ?.split(/[；;]/)
      .map((part) => part.trim())
      .find((part) => /刷新|重置/.test(part)) ?? ''
  );
}

/** 备注里写明“最多 N 台”或“不限设备”的，按资料显示；否则标明资料未标注。 */
function deviceLimitFromNote(note?: string): string {
  const m = note?.match(/最多\s*(\d+)\s*台/);
  if (m) return `最多 ${m[1]} 台（资料标注）`;
  if (note && /不限设备|设备不限/.test(note)) return '不限设备（资料标注）';
  if (note && /不限(在线)?客户端/.test(note)) return '不限在线客户端（资料标注）';
  return DEVICE_LIMIT;
}

/** 备注里写明“1 倍率”“1× 倍率”的，按资料显示；否则标明是按 1 倍率计算、资料未标注。 */
function multiplierFromNote(note?: string): string {
  return note && /(^|[^\d.])1\s*[×x]?\s*倍率/.test(note) ? '1 倍率（资料标注）' : TRAFFIC_MULTIPLIER;
}

function buildBrandPlans(sheet: BrandPriceSheet): Plan[] {
  const brand = BRANDS.find((b) => b.id === sheet.brandId);
  if (!brand) return [];

  const rows = sheet.rows;
  const monthlyByName = new Map<string, number>();
  for (const [name, code, price] of rows) {
    if (code === 'm') monthlyByName.set(name, price);
  }

  // —— 代表档位：最低月付、最低年付、每 GB 最低（月付/年付内比较）、不限时包里每 GB 最低 ——
  // 首页对比表的周期筛选、预算筛选和价格排序只认月付、年付、不限时三种周期，
  // 所以首页只放这三种周期的档位；季付、半年付、两年付、三年付的价格在品牌页完整列出。
  const indexed = rows.map((row, i) => ({ row, i }));
  const cheapest = (list: typeof indexed, score: (r: (typeof rows)[number]) => number) =>
    list.length ? list.reduce((a, b) => (score(b.row) < score(a.row) ? b : a)).i : -1;

  const perGB = (r: (typeof rows)[number]) => r[2] / r[4];
  const monthly = indexed.filter(({ row }) => row[1] === 'm');
  const yearly = indexed.filter(({ row }) => row[1] === 'y');
  const recurring = indexed.filter(({ row }) => row[1] === 'm' || row[1] === 'y');
  const oneTime = indexed.filter(({ row }) => row[1] === 'o');

  const primaryIdx = cheapest(monthly, (r) => r[2]);
  const cheapestYearIdx = cheapest(yearly, (r) => r[2]);
  const bestGbIdx = cheapest(recurring, perGB);
  const bestOneTimeIdx = cheapest(oneTime, perGB);
  const dedicatedIdx = new Set(
    monthly.filter(({ row }) => row[2] >= 500).map(({ i }) => i),
  );

  const tagFor = (i: number): string | undefined => {
    if (i === primaryIdx) return '入门月付';
    if (i === cheapestYearIdx) return '年付最低价';
    if (i === bestGbIdx) return '月/年付·每 GB 最低';
    if (i === bestOneTimeIdx) return '不限时包·单价最低';
    if (dedicatedIdx.has(i)) return '独享定制线路';
    return undefined;
  };

  return rows.map(([name, code, price, monthlyGB, totalGB, note], i) => {
    const cyc = CYCLES[code];
    const isOneTime = code === 'o';
    const nominal = Math.round((price / totalGB) * 10000) / 10000;

    // 折合月价 & 较月付节省（只在能和同名月付档比较时给出）
    let perMonthLabel = '月付基准价';
    let savingsLabel = '';
    if (isOneTime) {
      perMonthLabel = '一次性购买';
      savingsLabel = '用完为止';
    } else if (cyc.months > 1) {
      perMonthLabel = `折合 ¥${num(price / cyc.months)}/月`;
      const monthlyPrice = monthlyByName.get(name);
      if (monthlyPrice) {
        const saved = 1 - price / (monthlyPrice * cyc.months);
        savingsLabel = saved >= 0.005 ? `较月付省 ${Math.round(saved * 100)}%` : '';
      } else {
        savingsLabel = '该档仅此周期';
      }
    }

    const trafficResetRule = isOneTime
      ? note || '一次性流量包，用完为止'
      : resetRuleFromNote(note) || `每月 ${num(monthlyGB ?? 0)}GB 额度`;

    const lineMention = `${name} ${note ?? ''}`.match(/IEPL|IPLC/);
    const lineInfo = lineMention ? `${lineMention[0]} 专线（套餐标注）` : sheet.lineNote;

    return {
      id: `${brand.id}-${code}${String(i + 1).padStart(2, '0')}`,
      brandId: brand.id,
      brandName: brand.name,
      brandOrder: brand.editorialOrder,
      planName: name,
      actualPrice: price,
      currency: '¥',
      billingCycle: cyc.cycle,
      billingCycleLabel: cyc.label,
      monthlyGB,
      trafficGB: totalGB,
      trafficResetRule,
      trafficMultiplier: multiplierFromNote(note),
      deviceLimit: deviceLimitFromNote(note),
      nominalPerGB: nominal,
      referenceCostPerEffectiveGB: nominal,
      perMonthLabel,
      savingsLabel,
      lineInfo,
      verifyStatus: VERIFY_STATUS,
      dataDate: sheet.dataDate,
      affiliateUrl: brand.affiliateUrl,
      isEntryPlan: i === primaryIdx,
      recommendedTag: tagFor(i),
    } satisfies Plan;
  });
}

const PLANS_BY_BRAND = new Map<string, Plan[]>(
  PRICE_SHEETS.map((sheet) => [sheet.brandId, buildBrandPlans(sheet)]),
);

/**
 * 首页对比表：每家只列一档——该品牌的“入门月付”（实付金额最低的月付套餐）。
 * 没有月付档的品牌取实付金额最低的套餐，并改标“最低实付”，不冒充入门月付。
 */
export const PLANS: Plan[] = [...PLANS_BY_BRAND.values()].flatMap((plans) => {
  const monthly = plans.filter((p) => p.billingCycle === 'monthly');
  const candidates = monthly.length > 0 ? monthly : plans;
  if (candidates.length === 0) return [];
  const cheapest = candidates.reduce((min, p) => (p.actualPrice < min.actualPrice ? p : min));
  return [{ ...cheapest, recommendedTag: monthly.length > 0 ? '入门月付' : '最低实付' }];
});

/** 某个品牌的全部套餐（品牌页用） */
export function getPlansByBrand(brandId: string): Plan[] {
  return PLANS_BY_BRAND.get(brandId) ?? [];
}
