import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * “本站重点品牌”表：便宜机场页和机场优惠页顶部共用。
 * 顺序由调用方给定（站长指定的推荐顺序，不是价格排名）；每一格写主数字、说明和它在全部品牌里的真实位次。
 * 1024px 以上是表格，以下每个品牌一张小卡片，始终不需要左右滑动。
 */

/** 价格表里“本站重点”品牌的行：浅紫底色 + 左边一道紫线（除了颜色还有形状提示） */
export const FOCUS_ROW_CLASS = 'bg-purple-50/80';
export const FOCUS_MARK_CLASS = 'shadow-[inset_3px_0_0_0_#A78BFA]';

/** 价格表上方的图例；表里没有重点品牌的行时不显示 */
export function FocusLegend({ count, show }: { count: number; show: boolean }) {
  if (!show) return null;
  return (
    <p className="flex items-center gap-1.5 text-[12px] text-slate-500">
      <span aria-hidden className="inline-block h-3 w-3 shrink-0 rounded-sm border border-purple-300 bg-purple-100" />
      浅紫底色：本站重点 {count} 家（见页面顶部的表）
    </p>
  );
}

export interface FocusCell {
  /** 列名，同时是小屏卡片里这一格的小标题 */
  label: string;
  /** 主数字 */
  value: ReactNode;
  detail?: ReactNode;
  /** 真实位次，例如“34 家里第 9 低（3 家并列）” */
  rank?: string;
}

export interface FocusTableRow {
  /** 展示序号：本站重点顺序，不是价格名次 */
  position: number;
  brandSlug: string;
  brandName: string;
  alias?: string;
  featured: boolean;
  isHistorical: boolean;
  dataDate: string;
  affiliateUrl: string | null;
  cells: FocusCell[];
}

// Tailwind 只认完整的类名，所以按格数写死
const GRID: Record<number, string> = {
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-2 md:grid-cols-4',
};
const CELL_WIDTH: Record<number, string> = {
  3: 'lg:w-[21%]',
  4: 'lg:w-[16%]',
};

export function FocusBrandTable({ caption, rows }: { caption: string; rows: FocusTableRow[] }) {
  const labels = rows[0]?.cells.map((c) => c.label) ?? [];
  const grid = GRID[labels.length] ?? 'sm:grid-cols-2';
  const cellWidth = CELL_WIDTH[labels.length] ?? '';

  return (
    <div className="overflow-hidden rounded-2xl border border-pink-100/90 bg-white shadow-xs">
      <table className="block w-full text-left text-[13px] lg:table lg:border-collapse">
        <caption className="sr-only">{caption}</caption>
        <thead className="sr-only lg:not-sr-only">
          <tr className="bg-[#18243B] text-[12px] text-slate-200">
            <th scope="col" className="w-[22%] px-3 py-2.5 font-semibold">品牌</th>
            {labels.map((label) => (
              <th key={label} scope="col" className={`${cellWidth} px-3 py-2.5 font-semibold`}>
                {label}
              </th>
            ))}
            <th scope="col" className="px-3 py-2.5 text-center font-semibold">入口</th>
          </tr>
        </thead>
        <tbody className="block lg:table-row-group">
          {rows.map((r) => (
            <tr
              key={r.brandSlug}
              className={`grid grid-cols-1 gap-x-4 gap-y-3 border-t border-slate-100 px-3 py-3 first:border-t-0 ${grid} lg:table-row lg:hover:bg-slate-50/70`}
            >
              <td className="sm:col-span-full lg:px-3 lg:py-3 lg:align-top">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#7C3AED] text-xs font-bold text-white">
                    {r.position}
                  </span>
                  <Link
                    href={`/brands/${r.brandSlug}`}
                    className="inline-flex min-h-8 items-center text-base font-bold text-[#0F172A] hover:text-[#7C3AED]"
                  >
                    {r.brandName}
                  </Link>
                  {r.alias && <span className="text-[12px] text-slate-500">{r.alias}</span>}
                  {r.featured && (
                    <span className="rounded bg-[#0F172A] px-1.5 py-0.5 text-[11px] font-bold text-white">本站优选</span>
                  )}
                  {r.isHistorical && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">历史资料</span>
                  )}
                </div>
                <div className="pl-8 text-[12px] text-slate-500">资料日 {r.dataDate}</div>
              </td>

              {r.cells.map((c) => (
                <td
                  key={c.label}
                  data-label={c.label}
                  className="min-w-0 before:mb-0.5 before:block before:text-[11px] before:font-semibold before:text-slate-500 before:content-[attr(data-label)] lg:px-3 lg:py-3 lg:align-top lg:before:hidden"
                >
                  <div className="text-base font-bold text-[#6955E8]">{c.value}</div>
                  {c.detail && <div className="mt-0.5 text-[12px] leading-snug text-slate-700">{c.detail}</div>}
                  {c.rank && <div className="mt-0.5 text-[11px] leading-snug text-slate-500">{c.rank}</div>}
                </td>
              ))}

              <td className="sm:col-span-full lg:px-3 lg:py-3 lg:align-top">
                <div className="flex flex-wrap gap-2 lg:flex-col">
                  <Link
                    href={`/brands/${r.brandSlug}`}
                    className="inline-flex min-h-9 items-center justify-center rounded-lg bg-[#7C3AED] px-3 text-xs font-semibold text-white hover:bg-[#6D28D9]"
                  >
                    资料页
                  </Link>
                  {r.affiliateUrl && (
                    <a
                      href={r.affiliateUrl}
                      target="_blank"
                      rel="sponsored nofollow noopener"
                      className="inline-flex min-h-9 items-center justify-center whitespace-nowrap rounded-lg border border-pink-200 bg-pink-50/60 px-3 text-xs font-semibold text-[#7C3AED] hover:bg-pink-50"
                    >
                      官网（推广）↗
                    </a>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
