import React from 'react';
import { Metadata } from 'next';
import { PageHeroBanner } from '@/components/PageHeroBanner';
import Link from 'next/link';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { BRANDS } from '@/data/brands';
import { SITE_STATS } from '@/data/siteStats';
import { absoluteUrl } from '@/data/site';

export const metadata: Metadata = {
  title: '推广透明度与资料说明',
  description:
    '性价比机场关于商业推广、链接属性（rel=sponsored nofollow）、品牌展示顺序与数据口径的公开说明，并列出收录品牌的资料状态。',
  alternates: {
    canonical: absoluteUrl('/disclosure'),
  },
};

export default function DisclosurePage() {
  return (
    <>
      <PageHeroBanner
        bgImageSrc="/images/backgrounds/bg-torii-sunset.jpg"
        badgeText="合规与透明度公开声明"
        badgeIcon={<ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />}
        h1Title="性价比机场：商业推广与数据口径说明"
        subtitle="公开本站的推广合作方式、品牌展示顺序与资料核验状态；尚未核验的内容会明确标注“待核验”。"
        breadcrumbs={[{ label: '推广合作与资料说明' }]}
        scenicCaption="鸟居与落日 · 把规则摆在明处"
      />

      <div className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8 space-y-8">
        {/* Intro */}
        <p className="text-sm text-slate-600 leading-relaxed pb-6 border-b border-pink-100">
          本站整理机场订阅套餐的公开资料，并在统一口径下比较价格与流量成本。为保障读者的知情权，这里公开本站的推广合作方式与资料核验状态：尚未核验的内容会明确标注“待核验”，购买前请以品牌官网当前页面为准。
        </p>

        {/* Core Rules */}
        <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
          {/* Rule 1: Affiliate links */}
          <section className="space-y-3 rounded-2xl border border-pink-100 bg-white p-6 shadow-xs">
            <div className="flex items-center space-x-2 text-[#0F172A] font-bold text-base">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#7C3AED] text-white text-xs">
                01
              </span>
              <h2>推广链接规范与 sponsored 属性执行</h2>
            </div>
            <p>
              本站部分品牌链接为推广（邀请）链接（Affiliate Links）。当读者通过本站的链接注册或购买服务时，服务商可能向本站支付一定比例的推广佣金，这是本站的收入来源之一。本站不承诺推广链接会带来更低的价格或额外优惠，具体价格请以服务商官网为准。
            </p>
            <div className="rounded-xl bg-[#FFF9FD] p-4 text-xs space-y-2 border border-pink-100">
              <span className="font-bold text-slate-800">推广链接技术规范：</span>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>
                  本站的推广链接在 HTML 中包含{' '}
                  <code className="text-[#7C3AED] font-mono">rel=&quot;sponsored nofollow noopener&quot;</code>
                  ，符合搜索引擎对付费或赞助链接添加 sponsored 标注的建议。
                </li>
                <li>
                  推广链接指向服务商提供的注册入口（含邀请码）。本站无法对服务商网站的安全性作出保证，请在付款前自行核对网址、条款与退款规则，不要在非官方页面输入账号密码。
                </li>
                <li>
                  页面上标为“用户注册”“官网（推广）”的按钮都是推广（邀请）链接。本站另外收录了站长提供的各家优惠码（见{' '}
                  <Link href="/jichang-youhui" className="text-[#7C3AED] hover:underline">机场优惠码与优惠汇总</Link>
                  ），站长说明这些码是 8 折、一次性；适用套餐和周期没有说明，本站没有核验，以官网结算页为准。
                </li>
              </ul>
            </div>
          </section>

          {/* Rule 2: Editorial Independence */}
          <section className="space-y-3 rounded-2xl border border-pink-100 bg-white p-6 shadow-xs">
            <div className="flex items-center space-x-2 text-[#0F172A] font-bold text-base">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#7C3AED] text-white text-xs">
                02
              </span>
              <h2>品牌展示顺序与价格排序的区别</h2>
            </div>
            <p>
              首页与品牌库中的展示顺序由编辑部设定，<strong>不等同于价格排名，也不代表测评结论</strong>。由于部分品牌含有推广链接，读者在参考展示顺序时，应结合价格、流量、续费价格与自身需求自行判断。
            </p>
            <p>
              目前的推荐顺序是灵动云、暮光加速、微风网络、飞猫云（2026-11-04 由编辑部指定，后面依次是大佬云、隐形人、飞V 等），前四家都含本站的推广链接。推荐理由只写价格表和资料标注里能核对的事实；它们在各价格口径下的真实位次照常显示在各自的资料页、首页对比表和“便宜机场”“机场优惠”专题页里，推荐不改动任何计算结果。
            </p>
            <p>
              在套餐多维比较表与计算器中：
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
              <li>按“实际价格”“每 GB 标称成本”“参考折算成本”等字段排序时，是依据页面所列数据由公式计算得出，数据本身为公开资料整理，尚待核验；</li>
              <li>编辑部不会因为推广关系而修改计算公式；</li>
              <li>不把“年付折算价”冒充实际月付，页面会分别标注付款周期与实际支付金额。</li>
            </ul>
          </section>

          {/* Rule 3: Brand data status list */}
          <section className="space-y-3 rounded-2xl border border-pink-100 bg-white p-6 shadow-xs">
            <div className="flex items-center space-x-2 text-[#0F172A] font-bold text-base">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#7C3AED] text-white text-xs">
                03
              </span>
              <h2>收录品牌的资料状态（共 {SITE_STATS.brandCount} 家）</h2>
            </div>
            <p>
              下表列出本站目前收录的品牌及其资料状态。所有品牌的资料均为公开资料整理，尚未逐项核验；“含推广链接”指该品牌页面是否带有本站的推广（邀请）链接。
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#FFF9FD] border-b border-pink-100 text-slate-700">
                    <th className="whitespace-nowrap py-2.5 px-2 sm:px-3 font-semibold">顺序</th>
                    <th className="py-2.5 px-2 sm:px-3 font-semibold">品牌名称</th>
                    <th className="whitespace-nowrap py-2.5 px-2 sm:px-3 font-semibold">资料状态</th>
                    <th className="whitespace-nowrap py-2.5 px-2 sm:px-3 font-semibold">含推广链接</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {BRANDS.map((brand, idx) => (
                    <tr key={brand.id}>
                      <td className="whitespace-nowrap py-2 px-2 sm:px-3 font-bold text-[#7C3AED]">
                        #{String(brand.editorialOrder || idx + 1).padStart(2, '0')}
                      </td>
                      <td className="py-2 px-2 sm:px-3 font-medium text-slate-800">
                        <Link href={`/brands/${brand.slug}`} className="inline-flex min-h-8 items-center hover:text-[#7C3AED] hover:underline">{brand.name}</Link>
                        {brand.badge && <span className="ml-1 text-[11px] text-slate-500">（{brand.badge}）</span>}
                      </td>
                      <td className="whitespace-nowrap py-2 px-2 sm:px-3 text-amber-700 font-semibold">
                        {brand.isHistorical ? '历史资料·' : <span className="hidden sm:inline">公开资料·</span>}待核验
                      </td>
                      <td className="whitespace-nowrap py-2 px-2 sm:px-3 text-slate-500">
                        {brand.affiliateUrl ? (
                          <>
                            是<span className="hidden sm:inline">（sponsored）</span>
                          </>
                        ) : (
                          '否'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Action Link */}
          <div className="pt-4 flex items-center justify-between">
            <Link
              href="/brands"
              className="inline-flex items-center rounded-xl bg-[#7C3AED] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#6D28D9] transition-colors"
            >
              <span>浏览 {SITE_STATS.brandCount} 家机场品牌库</span>
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
            <Link
              href="/about"
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              关于性价比机场 →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
