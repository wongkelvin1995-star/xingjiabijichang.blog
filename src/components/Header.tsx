'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, Globe, BookOpen, Layers, HelpCircle, ShieldCheck, Compass, Send, Code2, Tag, BadgePercent } from 'lucide-react';
import { SearchModal } from './SearchModal';
import { UserCenterNavLink } from './user/UserActions';
import { SOCIAL_LINKS } from '@/data/site';

/**
 * 桌面导航。导航文字就是全站每页都带的锚文本，所以按目标页的真实用途命名：
 * - “机场推荐”指向首页（首页的标题和 H1 就是“性价比机场推荐”）；品牌目录叫“品牌资料库”。
 * - “套餐对比”指向首页的对比表（#comparison-table），标签和目标一致。
 * xlOnly：1024–1279px 宽度只放前 5 项，其余收进 ≥1280px 才显示；手机菜单里始终都有。
 */
const NAV: { href: string; label: string; xlOnly?: boolean }[] = [
  { href: '/', label: '机场推荐' },
  { href: '/brands', label: '品牌资料库' },
  { href: '/pianyi-jichang', label: '便宜机场' },
  { href: '/jichang-youhui', label: '机场优惠' },
  { href: '/guide', label: '使用指南' },
  { href: '/#comparison-table', label: '套餐对比', xlOnly: true },
  { href: '/routes', label: '节点线路', xlOnly: true },
  { href: '/blog', label: '博客文章', xlOnly: true },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  // 当前页：首页只在 “/” 高亮；其他项在自身网址和子路径（如 /brands/xxx）高亮；带 # 的入口不高亮
  const isActive = (href: string) => {
    if (href.includes('#')) return false;
    return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
  };

  // Global shortcut for search (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-pink-500/20 bg-[#0B0F19]/90 backdrop-blur-md transition-all text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo with Japanese Torii Gate Icon */}
          <Link href="/" className="flex items-center space-x-3 group">
            {/* Red Torii SVG Icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/30 border border-pink-500/30 shadow-md shadow-pink-500/10 group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 40 40" className="h-6 w-6 text-[#F43F5E]" fill="currentColor">
                <path d="M6 10h28v2.5H6z" />
                <path d="M4 7.5c6 1.8 26 1.8 32 0l.5 2.5c-7 1.8-26 1.8-33 0z" />
                <rect x="11" y="10" width="3.2" height="23" rx="0.5" />
                <rect x="25.8" y="10" width="3.2" height="23" rx="0.5" />
                <path d="M8.5 16h23v2.2H8.5z" />
                <rect x="19" y="10" width="2" height="6" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-pink-300 transition-colors">
                性价比机场
              </span>
              {/* 副标题只在 ≥1280px 显示，给中间的导航让出宽度，避免导航文字折成两行 */}
              <span className="hidden xl:block whitespace-nowrap text-[12px] text-pink-200/70 tracking-wide font-normal">
                用更少的钱，选择更大的世界
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {/* 桌面导航：所有文字 whitespace-nowrap，绝不折成两行；当前页用下划线和 aria-current 标出（项目见上面的 NAV） */}
          <nav className="hidden lg:flex items-center space-x-1 whitespace-nowrap text-[13px] font-medium text-slate-200">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`${item.xlOnly ? 'hidden xl:inline-block ' : ''}relative rounded-lg px-2 py-1.5 transition-colors ${
                    active
                      ? 'text-white font-semibold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-gradient-to-r after:from-pink-400 after:to-purple-400'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action buttons */}
          <div className="flex shrink-0 items-center space-x-2.5 whitespace-nowrap">
            {/* Telegram（图标 + TG）/ GitHub（只放图标；地址为空时不显示，不放占位） */}
            <a
              href={SOCIAL_LINKS.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex h-9 items-center gap-1 rounded-full bg-white/10 px-3 text-xs font-semibold text-slate-200 hover:bg-pink-500/20 hover:text-white transition-all"
              aria-label="Telegram 群组（新窗口打开）"
              title="Telegram 群组"
            >
              <Send className="h-4 w-4" />
              <span className="hidden xl:inline">TG</span>
            </a>
            {SOCIAL_LINKS.github && (
              <a
                href={SOCIAL_LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-slate-200 hover:bg-pink-500/20 hover:text-white transition-all"
                aria-label="GitHub 仓库（新窗口打开）"
                title="GitHub"
              >
                <Code2 className="h-4 w-4" />
              </a>
            )}

            {/* 个人中心（收藏 / 对比 / 偏好，仅保存在当前浏览器） */}
            <UserCenterNavLink />

            {/* Search Icon Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-pink-500/20 text-slate-200 hover:text-white transition-all cursor-pointer"
              aria-label="站内快速搜索"
              title="搜索文章或品牌 (Ctrl+K)"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* "订阅指南" Capsule Pill Button */}
            <Link
              href="/guide"
              className="hidden sm:inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full bg-gradient-to-r from-[#F472B6] via-[#EC4899] to-[#DB2777] px-4 text-xs font-semibold text-white shadow-md shadow-pink-500/25 hover:opacity-95 hover:shadow-pink-500/40 transition-all"
            >
              订阅指南
            </Link>

            {/* Mobile menu burger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden rounded-lg p-2 text-slate-300 hover:bg-white/10"
              aria-label="切换菜单"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-pink-500/20 bg-[#0B0F19]/98 px-4 py-4 lg:hidden shadow-2xl menu-drop-in">
            <nav className="flex flex-col space-y-1 text-sm font-medium text-slate-200">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center rounded-lg px-3 py-2.5 hover:bg-pink-500/10 text-white"
              >
                <Layers className="mr-3 h-4 w-4 text-pink-400" />
                首页
              </Link>
              <Link
                href="/brands"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center rounded-lg px-3 py-2.5 hover:bg-pink-500/10"
              >
                <ShieldCheck className="mr-3 h-4 w-4 text-purple-400" />
                品牌资料库
              </Link>
              <Link
                href="/pianyi-jichang"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center rounded-lg px-3 py-2.5 hover:bg-pink-500/10"
              >
                <Tag className="mr-3 h-4 w-4 text-pink-400" />
                便宜机场
              </Link>
              <Link
                href="/jichang-youhui"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center rounded-lg px-3 py-2.5 hover:bg-pink-500/10"
              >
                <BadgePercent className="mr-3 h-4 w-4 text-purple-400" />
                机场优惠
              </Link>
              <Link
                href="/#comparison-table"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center rounded-lg px-3 py-2.5 hover:bg-pink-500/10"
              >
                <Layers className="mr-3 h-4 w-4 text-pink-400" />
                套餐对比表
              </Link>
              <Link
                href="/guide"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center rounded-lg px-3 py-2.5 hover:bg-pink-500/10"
              >
                <Compass className="mr-3 h-4 w-4 text-pink-400" />
                使用指南
              </Link>
              <Link
                href="/routes"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center rounded-lg px-3 py-2.5 hover:bg-pink-500/10"
              >
                <Globe className="mr-3 h-4 w-4 text-blue-400" />
                节点线路
              </Link>
              <Link
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center rounded-lg px-3 py-2.5 hover:bg-pink-500/10"
              >
                <BookOpen className="mr-3 h-4 w-4 text-purple-400" />
                博客文章
              </Link>
              <Link
                href="/#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center rounded-lg px-3 py-2.5 hover:bg-pink-500/10"
              >
                <HelpCircle className="mr-3 h-4 w-4 text-pink-400" />
                常见问题
              </Link>
              <UserCenterNavLink variant="mobile" onNavigate={() => setMobileMenuOpen(false)} />
              <div className="flex items-center gap-2 px-3 pt-1">
                <a
                  href={SOCIAL_LINKS.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-white/10 px-3 text-xs font-semibold text-slate-200"
                  aria-label="Telegram 群组（新窗口打开）"
                >
                  <Send className="h-4 w-4 text-pink-400" /> Telegram 群组
                </a>
                {SOCIAL_LINKS.github && (
                  <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-white/10 px-3 text-xs font-semibold text-slate-200" aria-label="GitHub 仓库（新窗口打开）">
                    <Code2 className="h-4 w-4 text-purple-400" /> GitHub
                  </a>
                )}
              </div>
              <div className="pt-3 border-t border-pink-500/20">
                <Link
                  href="/guide"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center rounded-xl bg-gradient-to-r from-[#F472B6] to-[#DB2777] py-2.5 text-xs font-bold text-white shadow-md shadow-pink-500/20"
                >
                  新手订阅指南 →
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
