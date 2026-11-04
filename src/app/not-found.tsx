import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Layers, Home, Calculator, BookOpen, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: '页面未找到',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="rise-stagger mx-auto max-w-3xl px-4 py-20 text-center space-y-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-[#6955E8]">
        <Layers className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#6955E8]">
          404 状态码 · 页面未找到
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#18243B] tracking-tight">
          您所访问的页面不存在或已被迁移
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          请检查输入的网址拼写是否正确，或者通过以下入口回到性价比机场的主要内容：
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto pt-4 text-xs">
        <Link
          href="/"
          className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-purple-300 hover:shadow-xs transition-all text-slate-700 font-semibold"
        >
          <div className="flex items-center space-x-2">
            <Home className="h-4 w-4 text-[#6955E8]" />
            <span>返回博客首页</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
        </Link>

        <Link
          href="/calculator"
          className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-purple-300 hover:shadow-xs transition-all text-slate-700 font-semibold"
        >
          <div className="flex items-center space-x-2">
            <Calculator className="h-4 w-4 text-[#6955E8]" />
            <span>套餐成本计算器</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
        </Link>

        <Link
          href="/#comparison-table"
          className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-purple-300 hover:shadow-xs transition-all text-slate-700 font-semibold"
        >
          <div className="flex items-center space-x-2">
            <Layers className="h-4 w-4 text-[#6955E8]" />
            <span>机场套餐多维比较表</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
        </Link>

        <Link
          href="/blog"
          className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-purple-300 hover:shadow-xs transition-all text-slate-700 font-semibold"
        >
          <div className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-[#6955E8]" />
            <span>原创避坑与技术专栏</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
        </Link>
      </div>
    </div>
  );
}
