import React from 'react';
import { Metadata } from 'next';
import { PageHeroBanner } from '@/components/PageHeroBanner';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { SOCIAL_LINKS, absoluteUrl } from '@/data/site';

export const metadata: Metadata = {
  title: '关于我们：机场套餐价格与流量成本的资料整理站',
  description:
    '性价比机场由站长凯文（wongkelvin1995）维护，整理机场订阅套餐的价格、流量与续费信息。未核验的内容会标注，推广链接均标注 sponsored。',
  alternates: {
    canonical: absoluteUrl('/about'),
  },
};

export default function AboutPage() {
  return (
    <>
      <PageHeroBanner
        bgImageSrc="/images/backgrounds/bg-tokyo-grand.jpg"
        badgeText="性价比机场 · 编辑部"
        badgeIcon={<Sparkles className="h-3.5 w-3.5 text-pink-400" />}
        h1Title="精打细算，让每一分钱都值得：关于性价比机场"
        subtitle="一个整理机场订阅套餐价格、流量额度、流量倍率与续费信息的中文资料站。"
        breadcrumbs={[{ label: '关于性价比机场' }]}
        scenicCaption="都市夜景与樱花 · 在同一口径下比较每一笔订阅费用"
      />

      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8 space-y-10">
        {/* Intro */}
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed pb-6 border-b border-pink-100">
          性价比机场整理机场订阅套餐的价格、流量额度、倍率与续费信息，由站长凯文维护。套餐宣传常把月均价、标称流量、首购优惠和续费原价混在一起，本站把它们放在同一口径下，帮读者在预算内选到合适的服务。
        </p>

        {/* Philosophy */}
        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0F172A]">
              我们的三项原则
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="reveal lift-card rounded-2xl border border-pink-100 bg-white p-5 shadow-xs space-y-2">
                <span className="text-base font-bold text-[#7C3AED] block">
                  1. 统一口径，透明倍率
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  标称流量与服务商公布的节点倍率分开记录，再据此折算每 GB 成本，避免只看宣传中的最低价格。倍率与规则以服务商公布的说明为准，无法确认的会标注“待核验”。
                </p>
              </div>
              <div className="reveal lift-card rounded-2xl border border-pink-100 bg-white p-5 shadow-xs space-y-2">
                <span className="text-base font-bold text-[#7C3AED] block">
                  2. 区分月付与年付
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  不把年付直接除以 12 当作月付价格来比较。月付投入小、便于随时更换；年付折算后的月均价格可能更低，但需要一次性预付，并承担服务商未来一年内变动的风险，两者需要分开计算。
                </p>
              </div>
              <div className="reveal lift-card rounded-2xl border border-pink-100 bg-white p-5 shadow-xs space-y-2">
                <span className="text-base font-bold text-[#7C3AED] block">
                  3. 公开资料，披露推广
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  本站部分品牌链接为推广（邀请）链接，已标注 sponsored，读者通过链接注册或购买时本站可能获得佣金，详见推广说明。品牌资料为公开信息整理，尚未逐项核验的内容会明确标注。
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3 pt-4">
            <h2 className="text-xl font-bold text-[#0F172A]">数据核算与比较方法</h2>
            <p>
              为了让不同套餐可以放在同一口径下比较，本站使用以下计算方法：
            </p>
            <ul className="space-y-2 list-disc list-inside text-xs sm:text-sm text-slate-600 pl-2">
              <li>
                <strong>标称单价计算：</strong>
                实际付款总额 ÷ 标注总流量，得出最基础的每 GB 价格。
              </li>
              <li>
                <strong>参考折算单价：</strong>
                目前全站统一按 1 倍率计算（资料写明“1 倍率”的按资料显示，其余标注“资料未标注”，未逐家核实），所以表中的参考折算单价与标称单价相同；想按自己常用节点的倍率折算，请在成本计算器里输入倍率。
              </li>
              <li>
                <strong>闲置浪费损耗：</strong>
                例如用户每月需求为 50GB，购买了 200GB 的月付套餐（假设示例），剩余 150GB 当月清零，这部分成本应计入实际消耗，折算后的单价会明显上升。
              </li>
            </ul>
          </section>

          <section id="author" className="space-y-3 pt-4 scroll-mt-20">
            <h2 className="text-xl font-bold text-[#0F172A]">关于作者</h2>
            <p>
              我是凯文，网名 wongkelvin1995，性价比机场的作者和维护者。站内的价格资料、文章和推广链接都由我整理和维护，页面里的“站长”指的就是我。
            </p>
            <p>
              本站唯一的域名是 xingjiabijichang.blog。名称相近的其他网站、账号或仓库，与本站没有关系。
            </p>
            <p>
              想联系我，或者发现价格、流量、规则与官网不一致，请发邮件到
              <a href={`mailto:${SOCIAL_LINKS.email}`} className="mx-1 text-[#7C3AED] hover:underline break-all">{SOCIAL_LINKS.email}</a>
              ，我核对后会更正页面，并更新页面上的资料日期。也可以加入
              <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noopener noreferrer" className="mx-1 text-[#7C3AED] hover:underline">Telegram 群组</a>
              交流。
            </p>
          </section>

          <section className="space-y-3 pt-4">
            <h2 className="text-xl font-bold text-[#0F172A]">资料来源与更新</h2>
            <p>
              套餐价格、流量与规则为公开资料整理，价格和规则会随时调整。目前尚未对全部品牌逐项核验，页面中标注“待核验”的内容，请以品牌官网当前页面为准；完成核验的内容会注明核验时间。
            </p>
            <ul className="space-y-2 list-disc list-inside text-xs sm:text-sm text-slate-600 pl-2">
              <li>
                <strong>署名：</strong>
                文章与资料页面由凯文（wongkelvin1995）整理发布，作者介绍见上方“关于作者”。
              </li>
              <li>
                <strong>纠错与联系：</strong>
                发现价格、流量或规则与官网不一致时，请以官网为准；也欢迎发邮件到
                <a href={`mailto:${SOCIAL_LINKS.email}`} className="mx-1 text-[#7C3AED] hover:underline break-all">{SOCIAL_LINKS.email}</a>
                告诉我们，本站核对后会更正页面内容。
              </li>
            </ul>
          </section>

          {/* Action Link */}
          <div className="pt-6 border-t border-pink-100 flex flex-wrap gap-4">
            <Link
              href="/#comparison-table"
              className="inline-flex items-center rounded-xl bg-[#7C3AED] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#6D28D9] transition-colors"
            >
              <span>查阅套餐横向对比表</span>
            </Link>
            <Link
              href="/disclosure"
              className="inline-flex items-center rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-pink-50 transition-colors"
            >
              <span>推广合作与资料说明</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
