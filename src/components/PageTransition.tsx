'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/** 第一个页面挂载后变为 true；之后每一次换页（站内点击、前进后退）都会播放进入动效。 */
let hasShownFirstPage = false;

/**
 * 换页动效：点击站内链接进入新页面时，内容轻柔地淡入并微微上浮，页面顶部掠过一道樱粉到淡紫的光。
 * 第一次打开网站（服务器直出的页面）不播放动画，首屏内容立刻可见，不影响加载速度，也不影响搜索引擎抓取。
 * 样式见 globals.css 里的 .page-enter / .page-streak；系统开启“减少动态效果”时自动关闭。
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // 记录哪个路径的光带已经播完，避免同一个页面重复出现
  const [streakDonePath, setStreakDonePath] = useState<string | null>(null);

  useEffect(() => {
    hasShownFirstPage = true;
  }, []);

  // 路径一变就换一个 key，让内容整体重新挂载，进入动画才会重新播放
  const animate = hasShownFirstPage;

  return (
    <>
      {animate && streakDonePath !== pathname && (
        <div
          key={`streak-${pathname}`}
          aria-hidden="true"
          className="page-streak"
          onAnimationEnd={() => setStreakDonePath(pathname)}
        />
      )}
      <div key={pathname} className={animate ? 'page-enter' : undefined}>
        {children}
      </div>
    </>
  );
}
