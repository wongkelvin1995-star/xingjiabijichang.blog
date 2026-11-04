import React from 'react';
import { Tag, Calendar, Globe, GraduationCap } from 'lucide-react';
import { SITE_STATS } from '@/data/siteStats';

export function AdvantagesBar() {
  const advantages = [
    {
      title: '价格看得清',
      description: '多品牌套餐对比',
      icon: Tag,
      iconBg: 'bg-pink-50 text-[#EC4899]',
      href: '#comparison-table',
    },
    {
      title: '周期分得清',
      description: '月付 / 年付 / 流量包',
      icon: Calendar,
      iconBg: 'bg-pink-50 text-[#EC4899]',
      href: '#comparison-table',
    },
    {
      title: '品牌查得到',
      description: `${SITE_STATS.brandCount} 家品牌 · ${SITE_STATS.priceOptionCount} 个价格选项`,
      icon: Globe,
      iconBg: 'bg-pink-50 text-[#EC4899]',
      href: '/brands',
    },
    {
      title: '新手看得懂',
      description: '使用指南与常见问题',
      icon: GraduationCap,
      iconBg: 'bg-pink-50 text-[#EC4899]',
      href: '/guide',
    },
  ];

  return (
    <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10">
      <div className="rounded-2xl sm:rounded-full bg-white/95 backdrop-blur-md border border-pink-100/80 shadow-xl shadow-pink-500/5 p-3 sm:py-3.5 sm:px-6">
        {/* Desktop 4-column inline flex / Mobile 2x2 grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 md:divide-x md:divide-pink-100/60">
          {advantages.map((item, idx) => {
            const Icon = item.icon;
            return (
              <a
                key={idx}
                href={item.href}
                className="flex items-center space-x-3 p-2 rounded-xl transition-all hover:bg-pink-50/60 group"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.iconBg} shadow-xs transition-transform group-hover:scale-105`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] group-hover:text-[#7C3AED] transition-colors truncate">
                    {item.title}
                  </h4>
                  <p className="text-[12px] text-slate-500 truncate mt-0.5">
                    {item.description}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
