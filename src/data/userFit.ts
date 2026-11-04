import { BRANDS, FEATURED_BRAND_ID, RECOMMENDED_BRAND_IDS } from './brands';
import { PRICE_SHEETS, type CycleCode } from './planPrices';
import { CYCLE_LABELS } from './priceStats';

/**
 * 首页“什么样的用户适合什么价位的机场”：按使用人群给出筛选规则，再从价格表里按规则挑出候选套餐。
 *
 * - 每组前几行固定是本站推荐品牌（RECOMMENDED_BRAND_IDS，按推荐顺序）在该规则下的档位，分别标注“本站优选”“本站推荐”；
 *   推荐是编辑推荐位，不是价格第一；某家在该规则下没有档位时就不出现。
 * - 其余行按规则从价格表实时计算（每家品牌最多出现一次；历史资料品牌不参与推荐）。
 * - 所有数字都来自价格表，价格待核验；这里不写任何线路、速度、体验类说法。
 */

export interface FitPick {
  brandId: string;
  brandName: string;
  brandSlug: string;
  planName: string;
  cycle: CycleCode;
  cycleLabel: string;
  price: number;
  /** 每月流量（不限时包为 null） */
  monthlyGB: number | null;
  /** 周期合计流量（不限时包 = 包内流量） */
  totalGB: number;
  perGB: number;
  featured: boolean;
  /** 本站推荐品牌（含优选）：置顶并加角标 */
  recommended: boolean;
  /** “用户注册”链接：本站的推广（邀请）链接；这家没有就为 null */
  affiliateUrl: string | null;
}

export interface FitGroup {
  id: string;
  title: string;
  /** 适合谁（用量/习惯描述） */
  who: string;
  /** 挑选规则（如实写出） */
  rule: string;
  /** 这一组该注意什么 */
  caution: string;
  picks: FitPick[];
  /** 优选品牌在这一组下的提醒（没有则为空） */
  featuredNote?: string;
}

type Row = { brandId: string; name: string; cycle: CycleCode; price: number; monthlyGB: number | null; totalGB: number; perGB: number };

const ROWS: Row[] = PRICE_SHEETS.flatMap((s) =>
  s.rows.map(([name, cycle, price, monthlyGB, totalGB]) => ({
    brandId: s.brandId,
    name,
    cycle,
    price,
    monthlyGB,
    totalGB,
    perGB: price / totalGB,
  })),
);

const HISTORICAL = new Set(BRANDS.filter((b) => b.isHistorical).map((b) => b.id));

function toPick(r: Row): FitPick | null {
  const b = BRANDS.find((x) => x.id === r.brandId);
  if (!b) return null;
  return {
    brandId: b.id,
    brandName: b.name,
    brandSlug: b.slug,
    planName: r.name,
    cycle: r.cycle,
    cycleLabel: CYCLE_LABELS[r.cycle],
    price: r.price,
    monthlyGB: r.monthlyGB,
    totalGB: r.totalGB,
    perGB: Math.round(r.perGB * 1000) / 1000,
    featured: b.id === FEATURED_BRAND_ID,
    recommended: (RECOMMENDED_BRAND_IDS as readonly string[]).includes(b.id),
    affiliateUrl: b.affiliateUrl,
  };
}

interface Spec {
  id: string;
  title: string;
  who: string;
  rule: string;
  caution: string;
  filter: (r: Row) => boolean;
  /** 排序键：越小越靠前 */
  sortKey: (r: Row) => number;
  /** 优选品牌在本组选哪一档（默认与 sortKey 相同） */
  featuredSortKey?: (r: Row) => number;
  featuredNote?: string;
  limit?: number;
}

const SPECS: Spec[] = [
  {
    id: 'light',
    title: '轻度使用：每月 100GB 以内',
    who: '查资料、看网页、文字聊天为主，偶尔看视频；每月用量在几十 GB。',
    rule: '月付、每月 ≤100GB 的套餐，按实际付款从低到高。',
    caution: '用量很低时先看实付：小包比大包划算，哪怕大包每 GB 更便宜。',
    filter: (r) => r.cycle === 'm' && r.totalGB <= 100,
    sortKey: (r) => r.price * 1000 + r.perGB,
    // 这一档只有优选品牌一家置顶，小包品牌又多：多列几家，让六张卡片行数一致、排版整齐
    limit: 6,
  },
  {
    id: 'daily',
    title: '日常使用：每月 100–300GB',
    who: '每天都用，经常看视频、开视频会议，一两台设备。',
    rule: '月付、每月 100–300GB 的套餐，按标称每 GB 从低到高。',
    caution: '这个区间看每 GB；核对流量是否按月重置、倍率是否为 1。',
    filter: (r) => r.cycle === 'm' && r.totalGB >= 100 && r.totalGB <= 300,
    sortKey: (r) => r.perGB,
  },
  {
    id: 'heavy',
    title: '大流量：每月 500GB 以上',
    who: '长时间高清视频、大文件传输、多设备同时用。',
    rule: '月付、每月 ≥500GB 的套餐，按标称每 GB 从低到高。',
    caution: '先确认设备数和是否限速；表里的设备数、倍率是统一口径，未逐家核实。',
    filter: (r) => r.cycle === 'm' && r.totalGB >= 500,
    sortKey: (r) => r.perGB,
  },
  {
    id: 'yearly',
    title: '长期使用、愿意年付',
    who: '已经用过、确定要长期用，可以接受一次付清一年。',
    rule: '年付、每月 100–300GB 的套餐，按一次付清金额从低到高。',
    caution: '年付要预付一年：先用月付确认合适再换；折合月价只作参考。',
    filter: (r) => r.cycle === 'y' && r.monthlyGB !== null && r.monthlyGB >= 100 && r.monthlyGB <= 300,
    sortKey: (r) => r.price * 1000 + r.perGB,
  },
  {
    id: 'occasional',
    title: '偶尔才用：几个月用一次',
    who: '出差、旅行或临时需要，用量不固定，不想每月付费。',
    rule: '不限时流量包（用完为止），按每 GB 从低到高。',
    caution: '流量包单价通常比月付高，胜在不过期；先确认有效期和是否限制设备。',
    filter: (r) => r.cycle === 'o',
    sortKey: (r) => r.perGB,
    featuredSortKey: (r) => r.price,
    featuredNote: '推荐品牌的不限时包每 GB 明显高于月付档，只适合当备用。',
  },
];

export function buildFitGroups(): FitGroup[] {
  return SPECS.map((spec) => {
    const matched = ROWS.filter(spec.filter);
    // 推荐品牌按推荐顺序置顶：每家取该规则下最靠前的一档；没有符合规则的档位就不出现
    const fKey = spec.featuredSortKey ?? spec.sortKey;
    const pinned = RECOMMENDED_BRAND_IDS.flatMap((id) => {
      const rows = matched.filter((r) => r.brandId === id).sort((a, b) => fKey(a) - fKey(b));
      const pick = rows.length ? toPick(rows[0]) : null;
      return pick ? [pick] : [];
    });
    const pinnedIds = new Set(pinned.map((p) => p.brandId));

    // 其余品牌：每家只取最靠前的一档，排除历史资料品牌与已置顶的推荐品牌
    const best = new Map<string, Row>();
    for (const r of matched) {
      if (pinnedIds.has(r.brandId) || HISTORICAL.has(r.brandId)) continue;
      const cur = best.get(r.brandId);
      if (!cur || spec.sortKey(r) < spec.sortKey(cur)) best.set(r.brandId, r);
    }
    const others = [...best.values()]
      .sort((a, b) => spec.sortKey(a) - spec.sortKey(b))
      .slice(0, spec.limit ?? 3)
      .map(toPick)
      .filter((p): p is FitPick => p !== null);

    return {
      id: spec.id,
      title: spec.title,
      who: spec.who,
      rule: spec.rule,
      caution: spec.caution,
      picks: [...pinned, ...others],
      featuredNote: spec.featuredNote,
    };
  });
}
