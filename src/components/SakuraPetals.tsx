'use client';

import { useEffect, useRef } from 'react';

/** 其他组件通过 window 事件触发花瓣迸发：detail 为 { x, y }（相对画布左上角的像素坐标）。 */
export const SAKURA_BURST_EVENT = 'sakura-burst';

interface Petal {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
}

/** 点击画面时迸发的花瓣：向四周散开，逐渐减速、飘落并消失。 */
interface BurstPetal extends Petal {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

const COLORS = [
  'rgba(249, 168, 212, 0.75)', // 浅樱粉
  'rgba(244, 114, 182, 0.7)', // 深樱粉
  'rgba(251, 207, 232, 0.8)', // 花瓣白粉
  'rgba(237, 233, 254, 0.65)', // 淡紫
];

const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

function drawPetal(ctx: CanvasRenderingContext2D, p: Petal, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(p.size / 2, -p.size / 2, p.size, 0, p.size / 2, p.size);
  ctx.bezierCurveTo(0, p.size / 2, -p.size / 2, p.size, -p.size / 2, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function SakuraPetals() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // 用户设置了“减少动态效果”时不播放
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    const resize = () => {
      const parent = canvas.parentElement;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // 手机上花瓣少一些
    const petalCount = window.innerWidth < 768 ? 8 : 16;
    const petals: Petal[] = Array.from({ length: petalCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 8 + 6,
      speedX: Math.random() * 0.8 + 0.3,
      speedY: Math.random() * 1.0 + 0.5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.03,
      color: randomColor(),
    }));
    let bursts: BurstPetal[] = [];

    const onBurst = (event: Event) => {
      const { x, y } = (event as CustomEvent<{ x: number; y: number }>).detail;
      const count = window.innerWidth < 768 ? 16 : 28;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        const maxLife = 70 + Math.random() * 40;
        bursts.push({
          x,
          y,
          size: Math.random() * 7 + 5,
          speedX: 0,
          speedY: 0,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.25,
          color: randomColor(),
          life: maxLife,
          maxLife,
        });
      }
    };
    window.addEventListener(SAKURA_BURST_EVENT, onBurst);

    let frameId = 0;
    let running = false;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of petals) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) p.x = -20;
        else if (p.x < -20) p.x = width + 20;
        drawPetal(ctx, p);
      }

      bursts = bursts.filter((p) => p.life > 0);
      for (const p of bursts) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.965;
        p.vy = p.vy * 0.965 + 0.06;
        p.rotation += p.rotationSpeed;
        p.life -= 1;
        drawPetal(ctx, p, Math.min(1, p.life / (p.maxLife * 0.5)));
      }

      if (running) frameId = requestAnimationFrame(render);
    };

    const start = () => {
      if (running) return;
      running = true;
      frameId = requestAnimationFrame(render);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frameId);
    };

    // 画布滚出屏幕后暂停，省电省资源
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
      else stop();
    });
    observer.observe(canvas);

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener(SAKURA_BURST_EVENT, onBurst);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-hidden"
      aria-hidden="true"
    />
  );
}
