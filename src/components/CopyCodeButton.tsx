'use client';

import { useRef, useState } from 'react';

/**
 * 优惠码 + “复制”按钮。码本身是普通文字（可以直接选中），按钮只是方便；
 * 浏览器不允许写剪贴板时静默失败，用户照样可以手动选中复制。
 */
export function CopyCodeButton({ code, brandName }: { code: string; brandName: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      // 复制失败（非安全环境或被浏览器拒绝）：不提示，用户可手动选中上面的码
    }
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <code className="select-all rounded-md bg-slate-100 px-2 py-1 font-mono text-[13px] font-bold text-[#0F172A]">{code}</code>
      <button
        type="button"
        onClick={copy}
        aria-label={`复制${brandName}的优惠码 ${code}`}
        className="inline-flex min-h-8 min-w-12 cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-700 transition-colors hover:border-pink-300 hover:text-[#7C3AED]"
      >
        {copied ? '已复制' : '复制'}
      </button>
    </span>
  );
}
