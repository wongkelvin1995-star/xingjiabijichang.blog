'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';

interface CinematicTransitionProps {
  children: React.ReactNode;
}

export function CinematicTransition({ children }: CinematicTransitionProps) {
  const pathname = usePathname();
  const [isRevealing, setIsRevealing] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);

  // Trigger cinematic movie reveal on initial mount and on every pathname navigation
  useEffect(() => {
    setIsRevealing(true);
    setAnimationKey((prev) => prev + 1);

    const timer = setTimeout(() => {
      setIsRevealing(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="relative w-full">
      {/* 1. Cinematic Curtains & Widescreen Letterbox Bars (电影黑边开幕与光影) */}
      {isRevealing && (
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden select-none"
        >
          {/* Top Cinematic Shutter (上宽银幕黑边) */}
          <div className="absolute top-0 left-0 right-0 h-[15vh] sm:h-[18vh] bg-[#070B14] shadow-2xl border-b border-pink-500/25 animate-curtain-top flex items-end justify-center pb-2">
            <span className="text-[11px] tracking-[0.3em] uppercase text-pink-300/40 font-mono">
              ★ SAKURA · 性价比机场 ★
            </span>
          </div>

          {/* Bottom Cinematic Shutter (下宽银幕黑边) */}
          <div className="absolute bottom-0 left-0 right-0 h-[15vh] sm:h-[18vh] bg-[#070B14] shadow-2xl border-t border-pink-500/25 animate-curtain-bottom flex items-start justify-center pt-2">
            <span className="text-[11px] tracking-[0.3em] uppercase text-pink-300/40 font-mono">
              2026 性价比机场指南 · 性价比机场编辑部
            </span>
          </div>

          {/* Center Anamorphic Lens Flare (电影级水平粉紫光束) */}
          <div className="absolute top-1/2 left-0 right-0 h-32 -translate-y-1/2 bg-gradient-to-r from-transparent via-[#F472B6]/20 to-transparent blur-xl animate-anamorphic-flare" />
          <div className="absolute top-1/2 left-1/4 right-1/4 h-1.5 -translate-y-1/2 bg-gradient-to-r from-transparent via-white/80 to-transparent blur-xs animate-anamorphic-flare" />

          {/* Center Theatrical Opening Crest (电影开场题名) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center space-y-2 animate-cinematic-title">
            <div className="inline-flex items-center space-x-2 rounded-full bg-black/60 backdrop-blur-md px-4 py-1.5 border border-pink-400/40 text-pink-200 shadow-xl">
              <Sparkles className="h-4 w-4 text-pink-400 animate-pulse" />
              <span className="text-xs sm:text-sm font-bold tracking-widest">
                性价比机场 · 电影级画幅呈现
              </span>
            </div>
            <p className="text-[12px] font-serif tracking-widest text-pink-100/80 drop-shadow-md">
              —— 慢慢秀出全景 · 精打细算每一分钱 ——
            </p>
          </div>
        </div>
      )}

      {/* 2. Main Page Content with Dreamy Cinematic Focus & Clarity Reveal (画面渐渐清晰对焦) */}
      <div
        key={`${pathname}-${animationKey}`}
        className="w-full animate-cinematic-screen"
      >
        {children}
      </div>
    </div>
  );
}
