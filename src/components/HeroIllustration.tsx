'use client';

import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { SCENIC_BACKGROUNDS } from '@/data/backgrounds';
import { SAKURA_BURST_EVENT } from './SakuraPetals';

/** 旧画面“走远”的时长，要和 globals.css 里 .hero-scene[data-state='leaving'] 的动画时长一致。 */
const LEAVE_MS = 1100;
/** 切换后的短暂冷却，避免连点或双击时一下子跳过好几幅画。 */
const COOLDOWN_MS = 700;

/**
 * 首页首屏的唯美画境。点击画面（或右下角按钮）进入下一幅：
 * 新画面从点击处像光圈一样向外展开，旧画面被拉近并淡出，点击处闪过一道樱粉色的光，并迸出一阵花瓣。
 * 动画本身写在 globals.css（.hero-scene 一组样式），这里只负责切换状态和记录点击位置。
 */
export function HeroIllustration() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [leavingIndex, setLeavingIndex] = useState<number | null>(null);
  const [flash, setFlash] = useState<{ key: number; x: number; y: number } | null>(null);
  // 已挂载（会被加载）的画的最大序号：第一幅始终在，后面的按需逐幅加入
  const [mountUpTo, setMountUpTo] = useState(0);
  const [hasSwitched, setHasSwitched] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const leaveTimer = useRef<number | undefined>(undefined);
  const lockedUntil = useRef(0);

  const mountNext = (index: number) =>
    setMountUpTo((n) => Math.max(n, Math.min(index, SCENIC_BACKGROUNDS.length - 1)));

  // 首屏只加载第一张画；页面空闲后只预加载“下一幅”，再往后的画每切换一次才多加载一幅，
  // 不让没点过画面的访客白白下载另外四张大图。
  useEffect(() => {
    const load = () => mountNext(1);
    // Safari 没有 requestIdleCallback，用定时器代替
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(load, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(load, 2500);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => () => window.clearTimeout(leaveTimer.current), []);

  const current = SCENIC_BACKGROUNDS[activeIndex];

  const goNext = (clientX?: number, clientY?: number) => {
    const root = rootRef.current;
    const now = Date.now();
    if (!root || now < lockedUntil.current) return;
    lockedUntil.current = now + COOLDOWN_MS;

    const rect = root.getBoundingClientRect();
    // 没有点击坐标（比如键盘操作）时，从画面右下角的按钮附近出发
    const x = clientX !== undefined ? clientX - rect.left : rect.width - 80;
    const y = clientY !== undefined ? clientY - rect.top : rect.height - 28;
    root.style.setProperty('--hx', `${x}px`);
    root.style.setProperty('--hy', `${y}px`);

    const nextIndex = (activeIndex + 1) % SCENIC_BACKGROUNDS.length;
    setLeavingIndex(activeIndex);
    setActiveIndex(nextIndex);
    setHasSwitched(true);
    // 顺手把再下一幅挂上去先加载，下次点击就不会黑一下
    mountNext(nextIndex + 1);
    setFlash({ key: now, x, y });
    window.dispatchEvent(new CustomEvent(SAKURA_BURST_EVENT, { detail: { x, y } }));

    window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => setLeavingIndex(null), LEAVE_MS);
  };

  const onPictureClick = (event: MouseEvent<HTMLButtonElement>) =>
    goNext(event.clientX, event.clientY);

  // 键盘或读屏用户点击右下角按钮时，event.detail 为 0，这时不使用鼠标坐标
  const onButtonClick = (event: MouseEvent<HTMLButtonElement>) =>
    event.detail === 0 ? goNext() : goNext(event.clientX, event.clientY);

  return (
    <div
      ref={rootRef}
      data-switched={hasSwitched || undefined}
      className="absolute inset-0 overflow-hidden select-none z-0"
    >
      {/* 1. 多幅画境：当前、正在离开、尚未登场三种状态由 CSS 控制动画 */}
      {SCENIC_BACKGROUNDS.map((bg, index) => {
        if (index > mountUpTo && index !== activeIndex && index !== leavingIndex) return null;
        const state =
          index === activeIndex ? 'active' : index === leavingIndex ? 'leaving' : 'hidden';
        return (
          <div key={bg.id} data-state={state} className="hero-scene" aria-hidden="true">
            <div className="scene-drift">
              <Image
                src={bg.src}
                alt=""
                fill
                priority={index === 0}
                loading={index === 0 ? undefined : 'eager'}
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>
          </div>
        );
      })}

      {/* 2. 压暗渐变，保证文字清晰 */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-[#0F172A]/60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/65 via-transparent to-[#0F172A]/55 pointer-events-none" />
      {/* 中间再压一层柔和的暗色光晕，亮色画面上的白字也能看清 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.68)_0%,rgba(15,23,42,0.3)_45%,transparent_72%)] pointer-events-none" />

      {/* 3. 右侧竖排日文诗句 */}
      <div className="hidden md:flex absolute top-16 right-12 lg:right-24 z-10 flex-col items-center space-y-1.5 opacity-80 pointer-events-none select-none">
        <span
          className="text-xs lg:text-sm font-serif tracking-[0.3em] text-pink-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          style={{ writingMode: 'vertical-rl' }}
        >
          より少ない費用で
        </span>
        <span
          className="text-xs lg:text-sm font-serif tracking-[0.3em] text-pink-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          style={{ writingMode: 'vertical-rl' }}
        >
          より広い世界へ
        </span>
      </div>

      {/* 4. 两侧柔和的灯笼光晕 */}
      <div className="absolute left-6 lg:left-16 top-1/3 h-32 w-32 rounded-full bg-amber-400/20 blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute right-8 lg:right-28 bottom-24 h-36 w-36 rounded-full bg-pink-500/15 blur-3xl animate-pulse pointer-events-none" />

      {/* 5. 点击画面切换：铺满整个首屏，位于文字和按钮下方，不挡住它们 */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onPictureClick}
        onPointerEnter={() => mountNext(activeIndex + 1)}
        className="absolute inset-0 z-[5] h-full w-full cursor-pointer"
      />

      {/* 6. 点击处的光芒 */}
      {flash && (
        <div
          key={flash.key}
          aria-hidden="true"
          className="hero-flash"
          style={{ left: flash.x, top: flash.y }}
          onAnimationEnd={() => setFlash(null)}
        />
      )}

      {/* 7. 右下角画境提示与按钮 */}
      {/* 底部留出空间：下方的“优势卡片”会向上叠进大图一小截，按钮不能被它盖住 */}
      <div className="absolute bottom-12 right-4 z-30 sm:bottom-14">
        <button
          type="button"
          onClick={onButtonClick}
          className="group inline-flex items-center space-x-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md px-3.5 py-1.5 text-[12px] font-semibold text-pink-200 hover:text-white border border-pink-400/30 hover:border-pink-300 shadow-lg transition-all active:scale-95 cursor-pointer"
          title={`当前画境：${current.title}（${current.subtitle}）。点击画面或此按钮，进入下一幅画境`}
        >
          <Sparkles className="h-3 w-3 text-pink-400 group-hover:rotate-45 transition-transform" />
          <span>画境：{current.title}</span>
          <span className="hidden sm:inline text-pink-300/70">· 点击画面切换</span>
          <span className="text-[11px] text-pink-200/85 font-mono">
            [{activeIndex + 1}/{SCENIC_BACKGROUNDS.length}]
          </span>
        </button>
      </div>
    </div>
  );
}
