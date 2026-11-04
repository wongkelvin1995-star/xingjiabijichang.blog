/**
 * 由价格表推出的品牌事实：主力月付档、折扣阶梯、长周期、购买前核对清单。
 * 页面上的数字都来自这里，不在组件里手写；这里只做计算，不写任何评价性结论。
 */
import type { Brand } from '@/types';
import { BRANDS } from './brands';
import { getBrandTest } from './brandTests';
import { PRICE_SHEETS, type CycleCode } from './planPrices';
import {
  ALL_SHEET_STATS,
  CYCLE_LABELS,
  describeRank,
  fmtPerGB,
  fmtYuan,
  getRank,
  getSheetStats,
} from './priceStats';

const CYCLE_MONTHS: Record<CycleCode, number> = { m: 1, q: 3, h: 6, y: 12, b: 24, t: 36, o: 0 };

/** 月付价达到这个数的档位视为独享/定制线路，不算“主力档位”。 */
const EXCLUSIVE_MONTHLY_PRICE = 500;

function sheetOf(brandId: string) {
  return PRICE_SHEETS.find((s) => s.brandId === brandId);
}

export interface TierRow {
  name: string;
  price: number;
  gb: number;
  perGB: number;
}

/** 主力月付档（按价格从低到高）：不含月付价 ≥ ¥500 的独享/定制线路。 */
export function mainMonthlyTiers(brandId: string): TierRow[] {
  const sheet = sheetOf(brandId);
  if (!sheet) return [];
  return sheet.rows
    .filter(([, cycle, price]) => cycle === 'm' && price < EXCLUSIVE_MONTHLY_PRICE)
    .map(([name, , price, , totalGB]) => ({ name, price, gb: totalGB, perGB: price / totalGB }))
    .sort((a, b) => a.price - b.price);
}

export interface LadderStep {
  cycle: CycleCode;
  label: string;
  /** 折扣系数：0.95 表示实付为月付连付的 95% */
  ratio: number;
  /** 口语写法：95 折、9 折、85 折 */
  zhe: string;
}

function zhe(ratio: number): string {
  const pct = Math.round(ratio * 100);
  return pct % 10 === 0 ? `${pct / 10} 折` : `${pct} 折`;
}

/**
 * 折扣阶梯：把每个主力月付档的各周期价格与“月付 × 月数”相比。
 * 只有所有主力档位在某周期上折扣一致（误差 0.2% 以内）才返回该周期，避免把个别档位的折扣说成统一折扣。
 */
export function uniformDiscountLadder(brandId: string): LadderStep[] {
  const sheet = sheetOf(brandId);
  if (!sheet) return [];
  const tiers = mainMonthlyTiers(brandId);
  if (tiers.length === 0) return [];
  const steps: LadderStep[] = [];
  for (const cycle of ['q', 'h', 'y', 'b', 't'] as CycleCode[]) {
    const ratios: number[] = [];
    for (const tier of tiers) {
      const row = sheet.rows.find(([name, c]) => name === tier.name && c === cycle);
      if (!row) {
        ratios.length = 0;
        break;
      }
      ratios.push(row[2] / (tier.price * CYCLE_MONTHS[cycle]));
    }
    if (ratios.length === tiers.length && Math.max(...ratios) - Math.min(...ratios) <= 0.002) {
      const ratio = ratios[0];
      steps.push({ cycle, label: CYCLE_LABELS[cycle], ratio, zhe: zhe(ratio) });
    }
  }
  return steps;
}

/** 价格表里提供某个付款周期（如两年付、三年付）的品牌名称。 */
export function brandsOffering(cycle: CycleCode): string[] {
  const names = new Map(BRANDS.map((b) => [b.id, b.name]));
  return ALL_SHEET_STATS.filter((s) => (s.cycleCounts[cycle] ?? 0) > 0).map((s) => names.get(s.brandId) ?? s.brandId);
}

/** 价格选项数的位次：第几多 / 共几家。 */
export function optionCountRank(brandId: string): { rank: number; total: number; tied: number } | null {
  const mine = getSheetStats(brandId);
  if (!mine) return null;
  return {
    rank: 1 + ALL_SHEET_STATS.filter((s) => s.optionCount > mine.optionCount).length,
    total: ALL_SHEET_STATS.length,
    tied: ALL_SHEET_STATS.filter((s) => s.optionCount === mine.optionCount).length,
  };
}

/** 价格表备注里写明的设备数上限（如“最多 3 台”），按套餐名去重。 */
function deviceCapsFromNotes(brandId: string): string[] {
  const sheet = sheetOf(brandId);
  if (!sheet) return [];
  const seen = new Map<string, string>();
  for (const [name, , , , , note] of sheet.rows) {
    const m = note?.match(/最多\s*(\d+)\s*台/);
    if (m && !seen.has(name)) seen.set(name, `${name} 最多 ${m[1]} 台`);
  }
  return [...seen.values()];
}

/** 购买前核对清单：通用条目 + 由这家价格表算出来的专属条目。 */
export function buildChecklist(brand: Brand): string[] {
  const sheet = sheetOf(brand.id);
  const stats = getSheetStats(brand.id);
  const items: string[] = [];

  items.push(
    `先到官网核对套餐是否仍在售、价格是否一致：本站这家的价格资料日是 ${sheet?.dataDate ?? '未记录'}，尚未在官网结算页逐项核对。`,
  );
  if (brand.isHistorical) {
    items.push('本站对这家的资料是历史参考，不代表当前在售；下单前务必先确认官网还在运营、套餐还在卖。');
  }
  items.push('按“实际付款”和付款周期比较，不要只看折合月价：季付、半年付、年付要一次付清，月付才是每月实际支出。');
  items.push('看清流量规则：表中“每月 N GB”是资料标注的每月额度，“周期共 N GB”是整个付款周期的合计；额度是否按月重置、能否结转，资料没有逐项标注，请以官网为准。');

  if (stats) {
    const longCycles = (['b', 't'] as CycleCode[]).filter((c) => (stats.cycleCounts[c] ?? 0) > 0);
    if (longCycles.length > 0 && sheet) {
      const parts = longCycles.map((c) => {
        const prices = sheet.rows.filter((r) => r[1] === c).map((r) => r[2]);
        return `${CYCLE_LABELS[c]} ${fmtYuan(Math.min(...prices))}–${fmtYuan(Math.max(...prices))}`;
      });
      items.push(`${parts.join('、')}都要一次付清，预付越久，对套餐变动的承受风险越大；建议先用月付或季付确认体验再决定。`);
    }
    if (stats.bestUnlimited && stats.entryMonthly && sheet) {
      const perGBs = sheet.rows.filter((r) => r[1] === 'o').map((r) => r[2] / r[4]);
      const lo = Math.min(...perGBs);
      const hi = Math.max(...perGBs);
      items.push(
        `不限时流量包每 GB 约 ${fmtPerGB(lo)}${hi > lo ? `–${fmtPerGB(hi)}` : ''}，是入门月付（${fmtPerGB(stats.entryMonthly.perGB)}/GB）的 ${(lo / stats.entryMonthly.perGB).toFixed(1)}${hi > lo ? `–${(hi / stats.entryMonthly.perGB).toFixed(1)}` : ''} 倍，更适合当备用而不是主力。`,
      );
    }
  }

  const caps = deviceCapsFromNotes(brand.id);
  if (caps.length > 0) {
    items.push(`资料标注了设备数上限（${caps.join('；')}），设备多的用户请按设备数选档，并以官网为准。`);
  } else {
    items.push('设备数、倍率、线路和退款规则：表格里“1 倍率（资料未标注）”“设备数未标注”是本站的统一算法，没有逐家核实（资料写明的按资料显示）；这家的资料里也没有退款规则，请向官网确认。');
  }
  items.push('第一次购买建议先选月付或季付小额试用，在自己的网络和常用时段用一段时间，再决定是否改成长周期。');
  return items;
}

// ————— 优选品牌的推荐依据 —————

export interface FeaturedReason {
  title: string;
  detail: string;
  /** 这条结论是怎么算出来的 */
  basis: string;
}

export interface FeaturedBlock {
  reasons: FeaturedReason[];
  fitFor: string[];
  notFitFor: string[];
  limits: string[];
  /** 资料来源与核对日期（一句话） */
  sourceLine: string;
  dataDate: string;
}

/**
 * 优选品牌（灵动云）的推荐依据：适合谁、为什么、不适合谁、购买前的限制。
 * 每一条都由价格表现算；“不是价格最低”这类不利事实同样如实写出，推荐不靠隐瞒。
 */
export function buildFeaturedBlock(brand: Brand): FeaturedBlock {
  const sheet = sheetOf(brand.id);
  const stats = getSheetStats(brand.id);
  const tiers = mainMonthlyTiers(brand.id);
  const ladder = uniformDiscountLadder(brand.id);
  const dataDate = sheet?.dataDate ?? '';
  const total = ALL_SHEET_STATS.length;
  const reasons: FeaturedReason[] = [];
  const fitFor: string[] = [];
  const notFitFor: string[] = [];
  const limits: string[] = [];

  if (tiers.length >= 2) {
    const first = tiers[0];
    const last = tiers[tiers.length - 1];
    reasons.push({
      title: '月付档位梯度清晰',
      detail: `主力月付 ${tiers.length} 档：${tiers.map((t) => `${t.name} ${fmtYuan(t.price)}/${t.gb}GB`).join('、')}，每 GB 单价随档位下降（${fmtPerGB(first.perGB)} → ${fmtPerGB(last.perGB)}）。`,
      basis: '价格表中各档月付金额 ÷ 月流量',
    });
  }
  if (ladder.length >= 3) {
    reasons.push({
      title: '各周期折扣统一',
      detail: `${ladder.map((l) => `${l.label} ${l.zhe}`).join('、')}，${tiers.length} 个主力档位一致。`,
      basis: '各周期实付金额 ÷（月付 × 月数），逐档核对结果一致',
    });
  }
  const twoYear = brandsOffering('b');
  const threeYear = brandsOffering('t');
  const longTerm = twoYear.filter((n) => threeYear.includes(n));
  if (longTerm.includes(brand.name)) {
    const only = longTerm.length === 1;
    reasons.push({
      title: '付款周期选择多',
      detail: only
        ? `${total} 家里只有${brand.name}有两年付、三年付；预付越久单价越低，风险也越大。`
        : `${total} 家里有两年付、三年付的有 ${longTerm.length} 家，${brand.name}是其中之一。`,
      basis: `${total} 家价格表的付款周期统计`,
    });
  }
  if (stats?.cheapestYearly && stats.cheapestYearly.monthlyGB) {
    const y = stats.cheapestYearly;
    reasons.push({
      title: '有轻量年付入口',
      detail: `${y.name} 年付 ${fmtYuan(y.price)}，每月 ${y.monthlyGB}GB，折合 ${fmtYuan(Math.round((y.price / 12) * 100) / 100)}/月。`,
      basis: '价格表中最低的年付行',
    });
  }

  if (tiers.length >= 2) {
    fitFor.push(`想先按月试用、再决定是否长期使用的新用户：月付 ${fmtYuan(tiers[0].price)} 起，随时可以换档。`);
    fitFor.push(`每月 ${tiers[0].gb}–${tiers[1].gb}GB 的日常用户：${tiers[0].name}、${tiers[1].name}。`);
  }
  if (tiers.length >= 4) {
    fitFor.push(`每月需要 ${tiers[2].gb}GB 以上的重度用户：${tiers[2].name}、${tiers[3].name}（月付 ${fmtPerGB(tiers[2].perGB)}、${fmtPerGB(tiers[3].perGB)}/GB）。`);
  }
  const y = ladder.find((l) => l.cycle === 'y');
  if (y) fitFor.push(`确定长期使用、愿意预付来压低单价的用户：年付 ${y.zhe}，更长周期折扣更大。`);

  const rYear = getRank(brand.id, 'cheapestYearlyPrice');
  const rEntryPrice = getRank(brand.id, 'entryMonthlyPrice');
  const rEntryGB = getRank(brand.id, 'entryMonthlyPerGB');
  if (stats?.cheapestYearly && rYear) {
    notFitFor.push(`只想花最少的钱买年付小包的人：最低年付 ${fmtYuan(stats.cheapestYearly.price)}，${describeRank(rYear)}。`);
  }
  if (stats?.entryMonthly && rEntryGB) {
    notFitFor.push(`首要看入门每 GB 单价的人：入门月付 ${fmtPerGB(stats.entryMonthly.perGB)}/GB，${describeRank(rEntryGB)}。`);
  }
  const test = getBrandTest(brand.id);
  notFitFor.push(
    test
      ? `需要速度、稳定性等长期实测结论的人：本站只有站长 ${test.date} 的一次延迟与解锁测试记录（见资料页“站长测试记录”），没有速率和持续观测数据。`
      : '需要线路质量、速度、解锁等实测结论的人：本站没有做过测试，这些只有资料标注。',
  );
  if (longTerm.includes(brand.name)) notFitFor.push('不想一次预付多笔费用的人：两年付、三年付要一次付清。');

  limits.push(`价格和是否在售都是“待核验”：价格资料日 ${dataDate}，尚未在官网结算页逐项核对。`);
  if (stats?.entryMonthly && rEntryPrice) {
    limits.push(`价格不是最低：入门月付 ${fmtYuan(stats.entryMonthly.price)}，${describeRank(rEntryPrice)}。`);
  }
  if (sheet && longTerm.includes(brand.name)) {
    const b = sheet.rows.filter((r) => r[1] === 'b').map((r) => r[2]);
    const t = sheet.rows.filter((r) => r[1] === 't').map((r) => r[2]);
    limits.push(`两年付 ${fmtYuan(Math.min(...b))}–${fmtYuan(Math.max(...b))}、三年付 ${fmtYuan(Math.min(...t))}–${fmtYuan(Math.max(...t))} 要一次付清，建议先用月付或季付确认体验。`);
  }
  if (sheet && stats?.entryMonthly) {
    const packs = sheet.rows.filter((r) => r[1] === 'o');
    if (packs.length > 0) {
      const perGBs = packs.map((r) => r[2] / r[4]);
      const lo = Math.min(...perGBs);
      const hi = Math.max(...perGBs);
      limits.push(`不限时流量包每 GB ${fmtPerGB(lo)}–${fmtPerGB(hi)}，是入门月付的 ${(lo / stats.entryMonthly.perGB).toFixed(1)} 倍以上，只适合当备用。`);
    }
    const exclusive = sheet.rows.find((r) => r[1] === 'm' && r[2] >= EXCLUSIVE_MONTHLY_PRICE);
    if (exclusive) {
      limits.push(`${exclusive[0]} ${fmtYuan(exclusive[2])}/月只含 ${exclusive[4]}GB（${fmtPerGB(exclusive[2] / exclusive[4])}/GB），${exclusive[5] ?? ''}，只适合确有固定线路需求的人。`.replace('，，', '，'));
    }
  }
  limits.push(
    test
      ? '线路、倍率、设备数、退款与续费规则只是资料标注，本站没有逐项核验；站长的一次测试只覆盖延迟与解锁判定，不覆盖速率和稳定性。'
      : '线路、倍率、设备数、退款与续费规则只是资料标注，本站没有测试，也没有逐项核验。',
  );

  return {
    reasons,
    fitFor,
    notFitFor,
    limits,
    dataDate,
    sourceLine: `价格资料日 ${dataDate}，公开资料整理、待核验；${
      test ? `延迟与解锁有站长 ${test.date} 的测试记录（见资料页），速度未测` : '线路与速度未测试'
    }`,
  };
}
