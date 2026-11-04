import React from 'react';
import Image from 'next/image';
import { Breadcrumb } from './Breadcrumb';
import { SakuraPetals } from './SakuraPetals';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeroBannerProps {
  bgImageSrc: string;
  badgeText: string;
  badgeIcon?: React.ReactNode;
  h1Title: string;
  subtitle: string;
  breadcrumbs: BreadcrumbItem[];
  scenicCaption?: string;
  children?: React.ReactNode;
}

export function PageHeroBanner({
  bgImageSrc,
  badgeText,
  badgeIcon,
  h1Title,
  subtitle,
  breadcrumbs,
  scenicCaption,
  children,
}: PageHeroBannerProps) {
  return (
    <div className="relative overflow-hidden bg-[#0F172A] text-white pt-6 pb-12 sm:pb-16 mb-8 border-b border-pink-500/20 shadow-lg">
      {/* 1. 日系插画背景（缓慢漂移） */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div className="scene-drift">
          <Image
            src={bgImageSrc}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* 压暗渐变，保证文字清晰 */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/60 to-[#0F172A]/75" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/75 via-[#0F172A]/30 to-[#0F172A]/65" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_transparent_30%,_#0F172A_90%)] opacity-70" />
      </div>

      {/* 2. Soft Falling Sakura Blossom Petals */}
      <SakuraPetals />

      {/* 3. Japanese Calligraphy Watermark in Right Sky */}
      <div className="hidden lg:flex absolute top-10 right-12 xl:right-20 z-10 flex-col items-center space-y-1.5 opacity-60 pointer-events-none select-none">
        <span
          className="text-xs font-serif tracking-[0.3em] text-pink-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          style={{ writingMode: 'vertical-rl' }}
        >
          より少ない費用で
        </span>
        <span
          className="text-xs font-serif tracking-[0.3em] text-pink-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          style={{ writingMode: 'vertical-rl' }}
        >
          より広い世界へ
        </span>
      </div>

      {/* 4. Ambient Colored Glow */}
      <div className="absolute -top-10 left-1/4 h-48 w-48 rounded-full bg-pink-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 right-1/4 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

      {/* 5. Main Hero Content */}
      <div className="rise-stagger relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Breadcrumb Navigation on Dark Background */}
        <div className="opacity-90">
          <Breadcrumb items={breadcrumbs} tone="dark" />
        </div>

        {/* Pill Badge */}
        <div className="inline-flex items-center space-x-2 rounded-full bg-white/15 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-pink-200 border border-white/20 shadow-xs">
          {badgeIcon}
          <span>{badgeText}</span>
        </div>

        {/* Main H1 Title */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-md text-balance">
          {/* 纯白实色字：渐变镂空字在深色大图上发虚 */}
          <span className="text-white">{h1Title}</span>
        </h1>

        {/* Subtitle / Description */}
        <p className="text-xs sm:text-sm md:text-base text-pink-100/90 max-w-3xl leading-relaxed drop-shadow-sm font-medium">
          {subtitle}
        </p>

        {/* Scenic Background Caption */}
        {scenicCaption && (
          <p className="pt-1 text-[12px] text-pink-200/60 font-mono text-balance">
            🌸 背景画境：{scenicCaption}
          </p>
        )}

        {/* Optional Extra Elements */}
        {children && <div className="pt-2">{children}</div>}
      </div>
    </div>
  );
}
