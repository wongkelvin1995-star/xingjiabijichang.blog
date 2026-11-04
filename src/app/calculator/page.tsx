import React from 'react';
import { Metadata } from 'next';
import { CostCalculator } from '@/components/CostCalculator';
import { PageHeroBanner } from '@/components/PageHeroBanner';
import { Calculator, ShieldCheck } from 'lucide-react';
import { absoluteUrl } from '@/data/site';

export const metadata: Metadata = {
  title: '机场套餐成本计算器：按流量倍率折算每 GB 单价',
  description:
    '机场套餐每 GB 成本计算器：输入费用、标称流量、倍率和每月用量，得到可用额度和实际单价；支持月付、年付和不限时流量包。',
  alternates: {
    canonical: absoluteUrl('/calculator'),
  },
};

export default function CalculatorPage() {
  return (
    <div className="space-y-10 pb-20">
      {/* 1. Dramatic Scenic Anime Hero Banner with Torii Sunset Theme */}
      <PageHeroBanner
        bgImageSrc="/images/backgrounds/bg-torii-sunset.jpg"
        badgeText="性价比机场 · 套餐成本测算工具"
        badgeIcon={<Calculator className="h-3.5 w-3.5 text-pink-400" />}
        h1Title="机场套餐真实每 GB 成本计算器"
        subtitle="标称价格不等于真实成本：倍率 2× 让可用流量减半，用不完的额度也在分摊费用。输入费用、流量、倍率和实际用量，算出每 GB 真实单价。"
        breadcrumbs={[{ label: '套餐真实成本计算器' }]}
        scenicCaption="水上鸟居与天幕环轨 · 晚霞暮光下的几何数据轨道"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Interactive Calculator Component */}
        <CostCalculator />

        {/* Methodology & Calculation Formula Section */}
        <section className="rounded-3xl border border-pink-100 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="h-5 w-5 text-[#7C3AED]" />
            <h2 className="text-lg sm:text-xl font-bold text-[#0F172A]">
              核心测算公式与核算规范
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
            <div className="bg-[#FFF9FD] p-5 rounded-2xl border border-pink-100 shadow-2xs space-y-2">
              <span className="font-bold text-[#0F172A] text-sm block">1. 可用额度</span>
              <div className="p-2.5 bg-white border border-pink-100 rounded-lg font-mono text-[12px] text-[#7C3AED]">
                可用额度 = 标称流量 ÷ 倍率
              </div>
              <p className="text-slate-500 leading-relaxed text-[12px]">
                倍率 2 表示用 1GB 扣 2GB：标称 100GB 的套餐在 2× 节点上只能用 50GB。年付“每月 N GB 重置”的套餐，本周期额度按 N × 12 计算。
              </p>
            </div>
            <div className="bg-[#FFF9FD] p-5 rounded-2xl border border-pink-100 shadow-2xs space-y-2">
              <span className="font-bold text-[#0F172A] text-sm block">2. 额度单价 与 实际用量单价</span>
              <div className="p-2.5 bg-white border border-pink-100 rounded-lg font-mono text-[12px] text-[#7C3AED] space-y-1">
                <div>额度单价 = 周期费用 ÷ 可用额度</div>
                <div>实际用量单价 = 周期费用 ÷ 实际用量</div>
              </div>
              <p className="text-slate-500 leading-relaxed text-[12px]">
                例：¥28 / 280GB / 1×，每月只用 80GB：额度单价 ¥0.10/GB，实际用量单价 ¥0.35/GB。用量为 0 时没有分母，不给出单价。用量超过额度时，实际用量单价不再成立，页面会提示超出。
              </p>
            </div>
            <div className="bg-[#FFF9FD] p-5 rounded-2xl border border-pink-100 shadow-2xs space-y-2">
              <span className="font-bold text-[#0F172A] text-sm block">3. 闲置费用（分摊估算）</span>
              <div className="p-2.5 bg-white border border-pink-100 rounded-lg font-mono text-[12px] text-[#7C3AED]">
                闲置费用 = (未用额度 ÷ 可用额度) × 周期费用
              </div>
              <p className="text-slate-500 leading-relaxed text-[12px]">
                这是把费用按额度分摊后的估算，不是换小档就能省下的钱；额度可结转、或一次性流量包（用完为止），不按闲置判断。年付一次付清还要考虑预付一年的风险，这一项没有统一公式，请自行权衡。
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
