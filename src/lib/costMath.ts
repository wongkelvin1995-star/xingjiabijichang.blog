/**
 * 每 GB 成本计算（纯函数，组件和测试共用）。
 *
 * 三个核心口径：
 * - 可用额度 = 标称流量 ÷ 倍率（倍率 2 表示用 1GB 扣 2GB，所以可用的只有一半）
 * - 额度单价 = 周期费用 ÷ 可用额度（把整份额度全用完时的每 GB 价格）
 * - 实际用量单价 = 周期费用 ÷ 实际用量（只用了这么多，每 GB 实际摊到多少钱）
 *
 * “闲置费用”是按费用分摊估算的数字（没用到的额度分摊了多少钱），不是保证能省下的钱。
 */

export type CalcCycle = 'monthly' | 'yearly' | 'unlimited';

export interface CalcInput {
  /** 本周期一次付清的金额（元） */
  price: number;
  cycle: CalcCycle;
  /** 标称流量（GB）。月付：每月额度；年付：按 yearlyMode 解释；不限时：整包流量 */
  traffic: number;
  /** 年付时标称流量的含义：'monthlyReset' = 每月 N GB 重置；'total' = 全年共 N GB */
  yearlyMode: 'monthlyReset' | 'total';
  /** 流量倍率（>0） */
  multiplier: number;
  /** 每月实际用量（GB），可为 0 */
  monthlyUsage: number;
}

export interface CalcResult {
  valid: boolean;
  /** 输入问题（不合法时） */
  error?: string;
  /** 整个付款周期的可用额度（GB） */
  usableQuota: number;
  /** 每月可用额度（GB）；不限时包没有“每月”概念，取 null */
  usableMonthly: number | null;
  /** 额度单价：周期费用 ÷ 可用额度 */
  quotaPerGB: number;
  /** 标称单价：周期费用 ÷ 标称流量 */
  nominalPerGB: number;
  /** 周期内的实际用量（GB）：月付 = 月用量；年付 = 月用量 × 12；不限时 = 月用量（按一个月看） */
  periodUsage: number;
  /** 实际用量单价：周期费用 ÷ 周期实际用量；用量为 0 或不限时包时为 null */
  usagePerGB: number | null;
  /** 月度折算支出（不限时包为 null） */
  monthlyOutlay: number | null;
  /** 闲置额度占比（0–1）；不限时包 / 结转类不判断，取 null */
  idleRatio: number | null;
  /** 闲置费用估算（元/周期）：按费用分摊，不是保证节省 */
  idleCost: number | null;
  /** 用量超出额度 */
  overQuota: boolean;
  /** 超出的 GB 数（周期内） */
  overBy: number;
  /** 不限时包：按当前月用量，大约能用几个月 */
  packMonths: number | null;
}

const MONTHS: Record<CalcCycle, number> = { monthly: 1, yearly: 12, unlimited: 0 };

export function computeCost(input: CalcInput): CalcResult {
  const { price, cycle, traffic, yearlyMode, multiplier, monthlyUsage } = input;
  const empty: CalcResult = {
    valid: false,
    usableQuota: 0,
    usableMonthly: null,
    quotaPerGB: 0,
    nominalPerGB: 0,
    periodUsage: 0,
    usagePerGB: null,
    monthlyOutlay: null,
    idleRatio: null,
    idleCost: null,
    overQuota: false,
    overBy: 0,
    packMonths: null,
  };
  if (!(price > 0)) return { ...empty, error: '付款金额需要大于 0' };
  if (!(traffic > 0)) return { ...empty, error: '标称流量需要大于 0' };
  if (!(multiplier > 0)) return { ...empty, error: '倍率需要大于 0' };
  if (!(monthlyUsage >= 0)) return { ...empty, error: '每月用量不能是负数' };

  // 周期总标称流量
  const periodNominal = cycle === 'yearly' && yearlyMode === 'monthlyReset' ? traffic * 12 : traffic;
  const usableQuota = periodNominal / multiplier;
  const usableMonthly =
    cycle === 'monthly' ? usableQuota : cycle === 'yearly' ? usableQuota / 12 : null;

  const quotaPerGB = price / usableQuota;
  const nominalPerGB = price / periodNominal;

  const months = MONTHS[cycle];
  const periodUsage = cycle === 'unlimited' ? monthlyUsage : monthlyUsage * months;
  // 不限时包用完为止、不会到期清零，“实际用量单价”最终就等于额度单价，这里不按月用量算，避免误导
  const usagePerGB = cycle === 'unlimited' ? null : periodUsage > 0 ? price / periodUsage : null;
  const monthlyOutlay = cycle === 'unlimited' ? null : price / months;

  let overQuota = false;
  let overBy = 0;
  let idleRatio: number | null = null;
  let idleCost: number | null = null;
  let packMonths: number | null = null;

  if (cycle === 'unlimited') {
    // 一次性流量包用完为止，没有“到期清零”，不判断闲置；只估算能用多久
    packMonths = monthlyUsage > 0 ? usableQuota / monthlyUsage : null;
  } else if (cycle === 'yearly' && yearlyMode === 'monthlyReset') {
    // 每月重置：按月比较
    const perMonthQuota = usableQuota / 12;
    overQuota = monthlyUsage > perMonthQuota;
    overBy = overQuota ? (monthlyUsage - perMonthQuota) * 12 : 0;
    if (!overQuota) {
      idleRatio = (perMonthQuota - monthlyUsage) / perMonthQuota;
      idleCost = idleRatio * price;
    }
  } else {
    // 月付 / 年付总量：按周期比较
    overQuota = periodUsage > usableQuota;
    overBy = overQuota ? periodUsage - usableQuota : 0;
    if (!overQuota) {
      idleRatio = (usableQuota - periodUsage) / usableQuota;
      idleCost = idleRatio * price;
    }
  }

  return {
    valid: true,
    usableQuota,
    usableMonthly,
    quotaPerGB,
    nominalPerGB,
    periodUsage,
    usagePerGB,
    monthlyOutlay,
    idleRatio,
    idleCost,
    overQuota,
    overBy,
    packMonths,
  };
}
