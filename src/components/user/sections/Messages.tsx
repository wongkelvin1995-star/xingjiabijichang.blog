'use client';

import React from 'react';
import Link from 'next/link';
import { BellOff, Inbox, Newspaper, Send } from 'lucide-react';
import type { SectionProps } from '../types';
import { Card, Pill, btn } from '../ui';

/**
 * 消息与订阅：本站没有后端、没有账号，所以没有站内消息，也没有邮件 / 推送能力。
 * 这里如实说明，不做假开关、假“已订阅”状态；只列真实渠道和公开的更新动态。
 */
export function Messages({ data }: SectionProps) {
  const latest = [...data.articles].sort((a, b) => b.modifiedDate.localeCompare(a.modifiedDate)).slice(0, 5);

  return (
    <div className="space-y-5">
      <Card className="space-y-3">
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#0F172A]">
          <Inbox className="h-4 w-4 text-[#7C3AED]" /> 站内消息
        </h3>
        <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
          <Inbox className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm font-semibold text-[#0F172A]">暂无站内消息</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            本站没有消息系统和账号体系，不会有私信、通知或系统公告出现在这里。这不是加载失败，而是本来就没有。
          </p>
        </div>
      </Card>

      <Card className="space-y-3">
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#0F172A]">
          <BellOff className="h-4 w-4 text-[#7C3AED]" /> 邮件提醒与订阅
        </h3>
        <p className="text-xs leading-relaxed text-slate-600">
          本站目前<strong>没有邮件发送能力</strong>，也没有 RSS 订阅源，所以这里不提供“开启价格提醒”之类的开关，也不会显示“已订阅”。你在“账户设置”里填写的邮箱只保存在本浏览器，不会收到任何邮件。
        </p>
        <p className="text-xs text-slate-600">想跟进更新，目前只有这两个真实渠道：</p>
        <div className="flex flex-wrap gap-2">
          <a href={data.contact.telegram} target="_blank" rel="noopener noreferrer" className={btn.secondary} aria-label="Telegram 群组（新窗口打开）">
            <Send className="h-3.5 w-3.5" /> 加入 Telegram 群
          </a>
          <Link href="/blog" className={btn.secondary}>
            <Newspaper className="h-3.5 w-3.5" /> 文章专栏
          </Link>
        </div>
        <p className="text-[11px] text-slate-500">也可以把本站加入浏览器书签；以后如果接入邮件或 RSS，会在这里提供真实的订阅入口。</p>
      </Card>

      <Card className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#0F172A]">
            <Newspaper className="h-4 w-4 text-[#7C3AED]" /> 公开更新动态
          </h3>
          <Pill tone="slate">不是私信</Pill>
        </div>
        <p className="text-xs text-slate-600">下面是全站公开的更新信息，所有访客看到的都一样：</p>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl bg-[#F5F7FB] px-3 py-2 text-xs text-slate-700">
          <span>
            价格资料日：<strong>{data.dataDateRange}</strong>
          </span>
          <Link href="/brands" className="whitespace-nowrap text-[#7C3AED] hover:underline">
            看品牌资料库 →
          </Link>
        </div>
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
          {latest.map((a) => (
            <li key={a.slug} className="flex items-center justify-between gap-3 px-3 py-2.5 text-xs">
              <Link href={`/blog/${a.slug}`} className="min-w-0 truncate py-1 font-semibold text-[#0F172A] hover:text-[#7C3AED]">
                {a.title}
              </Link>
              <span className="shrink-0 whitespace-nowrap text-[10px] text-slate-500">更新于 {a.modifiedDate}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
