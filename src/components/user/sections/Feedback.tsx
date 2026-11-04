'use client';

import React from 'react';
import Link from 'next/link';
import { Copy, Mail, MessageSquareOff, Send } from 'lucide-react';
import type { SectionProps } from '../types';
import { Card, FlashLine, btn, useFlash } from '../ui';

const TOPICS: { id: string; label: string; subject: string; body: string }[] = [
  {
    id: 'fix',
    label: '价格 / 资料纠错',
    subject: '【性价比机场】资料纠错',
    body: '品牌或文章：\n页面地址：\n我看到的内容：\n官网实际内容（含看到的日期）：\n',
  },
  {
    id: 'idea',
    label: '功能或内容建议',
    subject: '【性价比机场】建议',
    body: '想反馈的页面：\n建议：\n',
  },
  {
    id: 'other',
    label: '其他反馈',
    subject: '【性价比机场】反馈',
    body: '',
  },
];

/**
 * 评论与反馈：本站没有评论系统和接收表单的接口，所以这里不做提交表单，
 * 也不展示任何评论 / 审核状态；只给真实可用的渠道（邮件、Telegram 群）。
 */
export function Feedback({ data }: SectionProps) {
  const { email, telegram } = data.contact;
  const { flash, ok, err } = useFlash();

  const mailto = (subject: string, body: string) => `mailto:${email}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ''}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      ok('已复制邮箱地址');
    } catch {
      err('复制失败：浏览器没有开放剪贴板，请手动选中下面的地址复制');
    }
  };

  return (
    <div className="space-y-5">
      <Card tone="muted" className="flex items-start gap-3 text-xs leading-relaxed text-slate-700">
        <MessageSquareOff className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-bold text-[#0F172A]">本站没有评论区</p>
          <p>
            站内没有评论系统，也没有接收表单的接口，所以这里不提供在线提交，也不会显示“已收到”“审核中”之类的状态。价格纠错和建议请直接发邮件或到 Telegram 群，站长看到后会核对资料。
          </p>
        </div>
      </Card>

      <Card className="space-y-3">
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#0F172A]">
          <Mail className="h-4 w-4 text-[#7C3AED]" /> 发邮件反馈
        </h3>
        <p className="text-xs text-slate-600">选一个主题会打开你的邮件客户端并带上收件人和主题；正文里的提纲可以按需删改。</p>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <a key={t.id} href={mailto(t.subject, t.body)} className={t.id === 'fix' ? btn.primary : btn.secondary}>
              <Mail className="h-3.5 w-3.5" /> {t.label}
            </a>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-[#F5F7FB] px-3 py-2 text-xs">
          <span className="text-slate-500">收件邮箱：</span>
          <code className="select-all break-all font-mono text-slate-800">{email}</code>
          <button type="button" onClick={copy} className={`${btn.ghost} min-h-8 px-2.5`}>
            <Copy className="h-3.5 w-3.5" /> 复制
          </button>
        </div>
        <FlashLine flash={flash} />
        <div className="rounded-xl border border-pink-100 bg-[#FFF9FD] p-3 text-[11px] leading-relaxed text-slate-600">
          <p className="font-semibold text-[#0F172A]">纠错时写清这几项，核对会快很多：</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            <li>哪个品牌、哪一档套餐，或哪篇文章的哪一段。</li>
            <li>本站页面上显示的内容，以及你在官网看到的实际内容和日期。</li>
            <li>本站当前的价格资料日：{data.dataDateRange}；资料晚于这个日期的变动很可能还没更新。</li>
          </ul>
        </div>
      </Card>

      <Card className="space-y-3">
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#0F172A]">
          <Send className="h-4 w-4 text-[#7C3AED]" /> Telegram 群
        </h3>
        <p className="text-xs text-slate-600">群里可以直接交流和提问；入群链接由站长维护，失效时请改用邮件。</p>
        <a href={telegram} target="_blank" rel="noopener noreferrer" className={btn.secondary} aria-label="Telegram 群组（新窗口打开）">
          <Send className="h-3.5 w-3.5" /> 打开 Telegram 群
        </a>
      </Card>

      <p className="text-[11px] leading-relaxed text-slate-500">
        反馈前可以先看
        <Link href="/disclosure" className="mx-0.5 text-[#7C3AED] hover:underline">
          推广合作与资料说明
        </Link>
        和
        <Link href="/about" className="mx-0.5 text-[#7C3AED] hover:underline">
          关于本站
        </Link>
        ，了解价格资料是怎么整理、怎么标注待核验的。你在本浏览器里保存的昵称、邮箱等资料不会随邮件自动发送。
      </p>
    </div>
  );
}
