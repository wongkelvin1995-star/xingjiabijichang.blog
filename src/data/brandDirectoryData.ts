import { BRANDS } from './brands';
import { PRICE_SHEETS } from './planPrices';
import { getSheetStats } from './priceStats';
import type { DirectoryEntry } from '@/components/BrandDirectory';

/** 首页品牌目录用的数据：从价格表现算，按 brands.ts 的顺序输出（目录组件再按拼音/价格排序）。 */
export function buildDirectoryEntries(): DirectoryEntry[] {
  return BRANDS.map((b) => {
    const st = getSheetStats(b.id);
    const sheet = PRICE_SHEETS.find((s) => s.brandId === b.id);
    const monthlyRows = sheet?.rows.filter((r) => r[1] === 'm') ?? [];
    return {
      id: b.id,
      slug: b.slug,
      name: b.name,
      pinyin: b.pinyin,
      editorialOrder: b.editorialOrder,
      aliases: b.aliases ?? [],
      badge: b.badge,
      isHistorical: b.isHistorical,
      entryMonthly: st?.entryMonthly
        ? { price: st.entryMonthly.price, totalGB: st.entryMonthly.totalGB, perGB: st.entryMonthly.perGB }
        : null,
      cheapestYearly: st?.cheapestYearly
        ? { price: st.cheapestYearly.price, totalGB: st.cheapestYearly.totalGB }
        : null,
      hasUnlimitedPack: (st?.cycleCounts.o ?? 0) > 0,
      maxMonthlyGB: monthlyRows.reduce((m, r) => Math.max(m, r[3] ?? r[4]), 0),
      schemeCount: st?.schemeCount ?? 0,
      optionCount: st?.optionCount ?? 0,
    };
  });
}
