import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeroBanner } from '@/components/PageHeroBanner';
import { BookOpen, ShieldAlert, ArrowRight, Laptop, Smartphone } from 'lucide-react';
import { absoluteUrl } from '@/data/site';

export const metadata: Metadata = {
  title: '机场新手使用指南：订阅导入、客户端设置与故障排查',
  description:
    '机场新手教程：订阅导入，Clash Verge Rev、Sing-box、Shadowrocket 等客户端设置，以及常见故障按症状逐步排查。',
  alternates: {
    canonical: absoluteUrl('/guide'),
  },
};

export default function GuidePage() {
  const steps = [
    {
      num: '01',
      title: '选购适合自己预算与周期的套餐',
      content:
        '新手建议优先选择“支持月付”的套餐进行试用（多数服务商提供月付选项，具体以官网当前页面为准），避免一次性年付。重点核查流量倍率（1.0x 即按实际流量扣除），不要只看低价年付宣传。',
    },
    {
      num: '02',
      title: '获取并妥善保管你的专属订阅链接',
      content:
        '在机场用户中心找到“一键导入订阅”或“复制订阅链接”。订阅链接相当于你的账号密码，切勿分享给他人或截图公开在社交平台上。',
    },
    {
      num: '03',
      title: '选择适配当前操作系统的现代客户端',
      content:
        'Windows / macOS / Linux 推荐现代开源的 Clash Verge Rev 或 Sing-box 图形版；iOS / iPadOS 推荐使用美区 App Store 下载的 Shadowrocket 或 Loon；Android 推荐 Clash Meta for Android 或 Sing-box。',
    },
    {
      num: '04',
      title: '导入订阅并开启系统代理',
      content:
        '在客户端中粘贴订阅链接并完成拉取。选择“规则模式（Rule）”，确保国内常用应用（微信、百度、淘宝等）直连，仅境外受阻网站与应用分流走代理节点。',
    },
  ];

  const clients = [
    {
      name: 'Clash Verge Rev',
      os: 'Windows / macOS / Linux',
      icon: Laptop,
      badge: '电脑端常用',
      desc: '基于 Tauri 的跨平台图形客户端，使用 Mihomo（Clash Meta）内核，可导入订阅并切换规则模式。功能以官方说明和你使用的版本为准。',
    },
    {
      name: 'Sing-box',
      os: '全平台通用',
      icon: Laptop,
      badge: '多协议内核',
      desc: '通用代理平台，官方文档列出支持 Shadowsocks、VLESS、Trojan、Hysteria2、TUIC 等协议；配置项较多，适合愿意自己调整配置的用户。',
    },
    {
      name: 'Shadowrocket (小火箭)',
      os: 'iOS / iPadOS',
      icon: Smartphone,
      badge: 'iOS 常用',
      desc: 'iOS / iPadOS 上的付费代理客户端，需在可下载的地区 App Store 购买，价格与上架情况以 App Store 页面为准；支持扫码导入订阅、规则分流和延迟测试。',
    },
    {
      name: 'Clash Meta for Android',
      os: 'Android 安卓系统',
      icon: Smartphone,
      badge: '安卓常用',
      desc: '安卓上的 Clash Meta 客户端，支持分应用代理和多配置切换；请从项目官方发布渠道获取，下载前核对来源。',
    },
  ];

  // 故障排查：按“症状 → 处理步骤”写，每一步都可以自己在几分钟内验证
  const troubleshooting: { symptom: string; steps: React.ReactNode[] }[] = [
    {
      symptom: '订阅拉取失败，或导入后没有节点',
      steps: [
        '重新复制完整的订阅链接，确认没有漏掉末尾的参数，也没有多余的空格或换行。',
        '先在浏览器里打开订阅链接：能看到一段文本或能下载到文件，说明链接本身有效；打不开，再到机场用户中心确认订阅是否过期、是否被重置过。',
        '如果客户端有“通过代理更新订阅”这类选项，打开后再拉取一次，部分订阅地址在本地网络下直接访问不通。',
        '仍然失败，就把报错信息发给机场客服；截图时记得遮住订阅链接。',
      ],
    },
    {
      symptom: '节点全部超时',
      steps: [
        '到机场用户中心确认订阅没有过期、流量没有用完。',
        '同步系统时间：本地时间偏差过大时，部分协议会连接失败。',
        '换一个网络（例如手机热点）再试，排除当前网络对代理端口的限制。',
        '更新客户端和内核到最新稳定版；同时开着其他代理或 VPN 软件时先关掉，避免端口和系统代理互相冲突。',
        '只有个别节点超时，就先换同地区的其他节点，并记下出问题的节点和时间，反馈给客服。',
      ],
    },
    {
      symptom: '能连上，但部分网站或应用打不开',
      steps: [
        '确认处在“规则模式（Rule）”，并更新一次订阅；客户端提供规则或地理数据库更新的话，也一起更新。',
        <>
          不同平台对出口 IP 的类型和地区各有要求，同一品牌换不同地区的节点对比一下，判断方法见
          <Link href="/blog/nodes-for-chatgpt-youtube-streaming" className="text-[#7C3AED] hover:underline">《ChatGPT、YouTube 和海外应用如何选择机场节点》</Link>。
        </>,
        '换一个无痕窗口或清除浏览器缓存，排除本地缓存的影响。',
      ],
    },
    {
      symptom: '速度慢，尤其是晚高峰',
      steps: [
        <>
          先分清是某个节点慢，还是所有节点都慢：换同地区的其他节点，在不同时段各测几次并记录下来，方法见
          <Link href="/blog/speed-test-latency-stability-guide" className="text-[#7C3AED] hover:underline">《机场测速怎么做》</Link>。
        </>,
        <>
          线路类型会影响晚间表现，但各品牌对“专线”“中转”这些词的用法并不统一。先看
          <Link href="/routes" className="text-[#7C3AED] hover:underline">机场节点线路全解析</Link>
          了解直连、中转和专线的区别，再向机场确认自己用的节点属于哪一类。
        </>,
        '测试前关掉下载工具和其他占用带宽的程序。',
      ],
    },
    {
      symptom: '流量消耗比预期快',
      steps: [
        <>
          看节点名称里的倍率标记（例如 <code>2.0x</code>）：实际扣减的额度 = 实际用量 × 倍率，算法见
          <Link href="/blog/traffic-multiplier" className="text-[#7C3AED] hover:underline">《机场流量倍率怎么算》</Link>。
        </>,
        '测速、高清视频和大文件下载都会消耗流量，做这些事之前先确认用的是 1.0x 节点。',
        <>
          用<Link href="/calculator" className="text-[#7C3AED] hover:underline">每 GB 成本计算器</Link>按倍率和实际用量重新算一遍，看套餐的额度够不够。
        </>,
      ],
    },
    {
      symptom: '国内网站和应用变慢或异常',
      steps: [
        '检查是不是误开了“全局代理（Global）”，改回“规则模式（Rule）”。',
        '规则模式下仍然异常，就在客户端的连接或日志页面看这个网站走的是直连还是代理，再调整规则。',
      ],
    },
  ];

  return (
    <div className="space-y-12 pb-20">
      <PageHeroBanner
        bgImageSrc="/images/backgrounds/bg-palace-moon.jpg"
        badgeText="零基础新手实操指南 · 客户端与订阅配置"
        badgeIcon={<BookOpen className="h-3.5 w-3.5 text-pink-400" />}
        h1Title="机场新手入门全景指南：从订阅导入到客户端配置"
        subtitle="买了订阅不知道怎么用？从选套餐、导入订阅到客户端设置和排障，一页看完。"
        breadcrumbs={[
          { label: '新手使用指南' },
        ]}
        scenicCaption="月色殿宇与骨干网络 · 传统与现代跨终端全流程引导"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Step-by-step Guide */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-[#0F172A]">四步极速上手流程</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step) => (
              <div
                key={step.num}
                className="reveal lift-card relative rounded-2xl border border-pink-100 bg-white p-6 shadow-xs flex items-start space-x-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-[#7C3AED] font-black text-sm">
                  {step.num}
                </span>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-[#0F172A]">{step.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Client Recommendations */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-[#0F172A]">主流平台客户端推荐</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {clients.map((c, i) => {
              const Icon = c.icon;
              return (
                <div
                  key={i}
                  className="reveal lift-card rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50 text-[#7C3AED]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="text-[11px] font-semibold bg-purple-50 text-[#7C3AED] px-2 py-0.5 rounded-full">
                        {c.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#0F172A]">{c.name}</h3>
                    <span className="text-[12px] text-slate-500 font-medium block mb-2">
                      {c.os}
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Common Pitfalls FAQ */}
        <section className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 space-y-4">
          <div className="flex items-center space-x-2 text-amber-800 font-bold text-base">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            <span>新手使用核心避坑守则</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700 list-disc list-inside leading-relaxed">
            <li>
              <strong>务必开启“规则模式（Rule）”：</strong>
              千万不要长时间开启“全局代理（Global）”，否则访问微信、支付宝、网易云等国内网站会绕道境外，导致国内应用异常缓慢甚至触发风控。
            </li>
            <li>
              <strong>关注节点倍率标签：</strong>
              若看到节点带有 <code>2.0x</code> 或 <code>3.0x</code> 标记，消耗 1GB 流量实际会扣减 2GB 或 3GB 账户额度。若无特殊需要，请优先使用 <code>1.0x</code> 专线节点。
            </li>
            <li>
              <strong>节点全部超时检测：</strong>
              先检查订阅链接是否拉取成功。若全部超时，通常是本地时间与网络标准时间相差超过 60 秒，在系统设置中“自动同步互联网时间”即可修复。
            </li>
          </ul>
        </section>

        {/* Troubleshooting */}
        <section id="troubleshooting" aria-labelledby="troubleshooting-heading" className="space-y-6 scroll-mt-20">
          <div className="space-y-2">
            <h2 id="troubleshooting-heading" className="text-2xl font-bold text-[#0F172A]">
              常见故障排查：订阅导入失败、节点超时、速度慢怎么办
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              下面按常见症状分组，每一步都可以自己在几分钟内验证。客户端的界面和选项名称因版本而异，以你使用的版本为准。
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {troubleshooting.map((item) => (
              <div
                key={item.symptom}
                className="reveal lift-card rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2"
              >
                <h3 className="text-base font-bold text-[#0F172A]">{item.symptom}</h3>
                <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {item.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            以上都试过仍然解决不了，就把现象、出现的时间和已经做过的排查整理好，发给机场客服，比一句“连不上”更容易得到有效回复。
          </p>
        </section>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link
            href="/brands"
            className="inline-flex items-center justify-center rounded-xl bg-[#7C3AED] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#6D28D9] transition-all"
          >
            <span>挑选适合的新手机场（查看品牌库）</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
