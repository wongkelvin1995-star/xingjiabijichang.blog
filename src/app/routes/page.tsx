import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeroBanner } from '@/components/PageHeroBanner';
import { Globe, ArrowRight } from 'lucide-react';
import { absoluteUrl } from '@/data/site';

export const metadata: Metadata = {
  title: '机场节点线路全解析：线路类型与地区节点怎么选',
  description:
    '速查机场常见线路类型（IEPL、IPLC、中转、直连）的特点，以及香港、日本、新加坡、美国节点怎么选；线路区别的详细解释见专题文章。',
  alternates: {
    canonical: absoluteUrl('/routes'),
  },
};

export default function RoutesPage() {
  const lineTypes = [
    {
      name: 'IEPL 内网专线 (International Ethernet Private Line)',
      badge: '点对点专线',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      latency: '通常较低且较稳定（因线路与地区而异）',
      stability: '取决于入口与出口线路质量，以实际使用为准',
      cost: '成本通常较高，以套餐页为准',
      principle:
        '通过两端境内外数据中心之间的点对点专用线路传输数据，链路相对固定，延迟与抖动通常更稳定；具体效果取决于服务商的线路质量与承载情况。',
      scenarios: '对稳定性与延迟较敏感的场景，如视频会议、长时间视频播放等（以实际线路为准）。',
    },
    {
      name: 'IPLC 专线 (International Private Leased Circuit)',
      badge: '国际专线',
      badgeColor: 'bg-blue-100 text-blue-800',
      latency: '通常较低且较稳定（因线路与地区而异）',
      stability: '取决于入口与出口线路质量，以实际使用为准',
      cost: '成本通常较高，以套餐页为准',
      principle:
        '国际私有租用线路，同样是点对点的专用链路。与 IEPL 在使用感受上通常较为接近，具体以服务商公布的线路说明为准。',
      scenarios: '重要远程办公、跨境业务后台等对线路稳定性要求较高的场景。',
    },
    {
      name: 'BGP 公网中转 (Border Gateway Protocol Relay)',
      badge: '多线中转',
      badgeColor: 'bg-purple-100 text-purple-800',
      latency: '中等，因入口与出口而异',
      stability: '平峰通常较好，晚高峰视带宽与用户数量而定',
      cost: '成本通常适中，以套餐页为准',
      principle:
        '国内多线 BGP 机房作为入口接入用户流量，经过国内专网或隧道传输到边缘出境机房，再转发到境外落地节点。',
      scenarios: '日常网页浏览、AI 工具使用、日常追剧与大流量下载。',
    },
    {
      name: '普通直连线路 (Direct / Hysteria2 / Vless Direct)',
      badge: '超低预算 / 备用应急',
      badgeColor: 'bg-amber-100 text-amber-800',
      latency: '通常较高，波动可能较大',
      stability: '平峰可用，晚高峰易受拥堵影响',
      cost: '成本通常较低，以套餐页为准',
      principle:
        '客户端直接通过公网连接境外服务器节点。在晚高峰国际出口拥堵时，丢包率可能明显上升，借助 Hysteria2 等基于 UDP 的协议可在一定程度上改善可用性，但效果因网络环境而异。',
      scenarios: '轻量文本查阅、GitHub 仓库拉取、紧急备用节点。',
    },
  ];

  const regionNodes = [
    {
      region: '香港 (Hong Kong)',
      flag: '🇭🇰',
      pros: '地理位置距离大陆最近，物理延迟通常是几个常见地区中较低的，适合对响应速度敏感的日常浏览。',
      cons: '部分流媒体与 AI 工具对香港地区或 IP 有限制策略，使用前请以对应服务的官方说明为准。',
      recommend: '日常高频浏览、管理海外云服务与资源。',
    },
    {
      region: '日本 (Japan)',
      flag: '🇯🇵',
      pros: '地理位置较近，延迟通常低于欧美节点；部分节点可用于访问日本本地的流媒体与 AI 服务，具体以节点实际情况为准。',
      cons: '华南用户连接日本节点的延迟通常略高于香港。',
      recommend: 'AI 工具使用、日本流媒体与网站访问等场景。',
    },
    {
      region: '新加坡 (Singapore)',
      flag: '🇸🇬',
      pros: '亚太网络枢纽之一，距离适中，对东南亚地区的流媒体与应用访问较为方便。',
      cons: '华北地区连接新加坡节点的延迟可能高于华南地区。',
      recommend: '多区域流媒体访问、东南亚电商平台店铺管理。',
    },
    {
      region: '美国 (United States)',
      flag: '🇺🇸',
      pros: '节点资源通常较丰富，是众多海外 AI 工具与开发服务的主要服务区域之一。',
      cons: '跨太平洋物理距离较远，延迟通常高于亚洲节点，不适合对低延迟要求很高的场景。',
      recommend: '大文件下载、GitHub 开发、海外 AI 与云服务使用。',
    },
  ];

  return (
    <div className="space-y-12 pb-20">
      <PageHeroBanner
        bgImageSrc="/images/backgrounds/bg-torii-night.jpg"
        badgeText="底层网络技术知识库 · 节点与专线架构"
        badgeIcon={<Globe className="h-3.5 w-3.5 text-pink-400" />}
        h1Title="机场节点线路全解析：IEPL、IPLC 专线与中转直连深度对比"
        subtitle="线路类型会影响晚高峰的稳定性和价格。本页速查 IEPL、IPLC、中转、直连的区别，以及地区节点怎么选。"
        breadcrumbs={[
          { label: '节点线路全解析' },
        ]}
        scenicCaption="暮色深邃与专网节点 · 静水倒影下的卫星低延迟轨道"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Line Types Grid */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">主流线路类型横向对比</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              根据物理链路架构划分的核心四大线路分类。本页是速查表；想了解四种线路的成本取舍和购买前可以核对什么，请看文章
              <Link href="/blog/iepl-iplc-relay-direct-line-guide" className="text-[#7C3AED] hover:underline">《IEPL、IPLC、中转和直连怎么选？》</Link>。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lineTypes.map((line, idx) => (
              <div
                key={idx}
                className="reveal lift-card rounded-2xl border border-pink-100 bg-white p-6 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-[#0F172A] leading-snug">
                    {line.name}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${line.badgeColor}`}
                  >
                    {line.badge}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-[#FFF9FD] p-3 rounded-xl border border-pink-100/60 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[12px]">典型延迟</span>
                    <span className="font-semibold text-slate-700">{line.latency}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[12px]">晚高峰表现</span>
                    <span className="font-semibold text-slate-700">{line.stability}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[12px]">市场成本</span>
                    <span className="font-semibold text-slate-700">{line.cost}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs leading-relaxed text-slate-600">
                  <p>
                    <strong className="text-slate-800 font-semibold">技术原理：</strong>
                    {line.principle}
                  </p>
                  <p>
                    <strong className="text-slate-800 font-semibold">推荐场景：</strong>
                    {line.scenarios}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Regional Nodes */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">核心地区节点选择指南</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              根据具体业务与应用场景选择最适合的落地国家或地区。下面的延迟高低只是按地理距离的一般经验，本站没有做过测速；实际延迟请在自己的网络里测试，方法见
              <Link href="/blog/speed-test-latency-stability-guide" className="text-[#7C3AED] hover:underline">《机场测速怎么做？》</Link>。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {regionNodes.map((item, idx) => (
              <div
                key={idx}
                className="reveal lift-card rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">{item.flag}</span>
                    <h3 className="text-base font-bold text-[#0F172A]">{item.region}</h3>
                  </div>
                  <div className="space-y-2 text-xs text-slate-600">
                    <p>
                      <strong className="text-emerald-700 font-medium">优势：</strong>
                      {item.pros}
                    </p>
                    <p>
                      <strong className="text-amber-700 font-medium">注意：</strong>
                      {item.cons}
                    </p>
                  </div>
                </div>
                <div className="bg-[#FFF9FD] p-2.5 rounded-xl border border-pink-100 text-[12px] text-slate-600">
                  <span className="font-bold text-[#7C3AED] block mb-0.5">最佳用途：</span>
                  {item.recommend}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA to comparison table */}
        <div className="rounded-3xl border border-pink-200 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-lg font-bold text-[#0F172A]">
              看懂了线路，去看看各家机场的实际套餐配置吧！
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              我们整理了包括灵动云、暮光加速在内的收录套餐（价格待核验，以官网为准），并标注线路类型与倍率资料。
            </p>
          </div>
          <Link
            href="/#comparison-table"
            className="inline-flex items-center justify-center rounded-xl bg-[#7C3AED] px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#6D28D9] transition-all shrink-0"
          >
            <span>返回套餐横向比较表</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
