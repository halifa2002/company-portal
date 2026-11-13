'use client';

import { useEffect, useRef } from 'react';

/**
 * 首屏底部的「霜面」网点（Canvas）
 *
 * 参数不是猜的，是从 fireworks.ai 首屏截图里逐像素量出来的（2026-11-13）：
 * - **点距 10px**，点本身在中段只有 **2px 宽**，到最底边才涨到 4px；
 * - **点比底色更亮**（背景 G=193，点 G=197–201），是「白霜」不是「深色点」；
 * - 颜色主要由底下那层径向渐变承担，点只负责给色带加一层绒面质感；
 * - 它那张 canvas 是 WebGL 画的（2d 上下文取不到），所以过渡连续、没有网格感。
 *
 * 上一版翻车的原因就是这三条全反着来：点距 16px、点直径到 12px、还是深色，
 * 结果在浅底上就是一片麻子。这里全部按量出来的值重做。
 *
 * 配色仍守领导文档 7.1：色带用靛蓝同色相，点用近白的淡靛，不引入第二个色相。
 */
const PITCH = 10;

/*
 * 2026-11-13 教训（用户对比截图后判定）：
 * 上一版给每个点加了 ±0.36 格的随机抖动，本意是"破掉印刷感"，
 * 但在 10px 间距下这等于把格子抖散了——放大看就是一把撒开的沙，
 * 参考站那块是**严格等距的格点**，像一层纱窗。
 * 规则性本身就是质感的一部分：乱了就没有"网"，只剩噪点。所以这里不抖。
 */

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * 色带（2026-11-13 改档）
 *
 * 原先是 brand-400 / brand-300 那一档，不透明度从 0.92 起步——
 * 等于在白底上铺了一条实色紫罗兰，320px 高、满屏宽。整页「廉价」的主因就是它。
 *
 * 三档旧尝试都留档：深靛像贴了一块颜料、近白淡紫像打印机缺墨、
 * 「亮而不淡」那档饱和保住了但底色发紫。问题不在明度，在**面积 × 饱和度**。
 *
 * 现在换成海军蓝，不透明度压到 0.20 起步：这条带的职责是给首屏垫一层冷雾，
 * 让人感觉「下面还有东西」，不是让色块自己当主角。
 * 依据 Stripe 公开规范：大面积渐变只做一层很淡的托底，品牌色只出现在按钮和链接上。
 */
const BAND_BG =
  'radial-gradient(78% 92% at 24% 100%, rgba(24,141,249,0.34) 0%, rgba(24,141,249,0.14) 42%, rgba(24,141,249,0) 72%), radial-gradient(60% 78% at 60% 100%, rgba(56,177,255,0.26) 0%, rgba(56,177,255,0.08) 46%, rgba(56,177,255,0) 74%), radial-gradient(44% 60% at 86% 100%, rgba(251,146,60,0.18) 0%, rgba(251,146,60,0) 68%), linear-gradient(to top, rgba(124,203,255,0.14) 0%, rgba(185,225,255,0.05) 62%, rgba(255,255,255,0) 100%)';

export function HeroDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    /* 亮色带上霜点要更实一点，否则在浅底上完全看不见 */
    const alphaMax = 0.42;
    const radiusMax = 2.4;

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width === 0 || height === 0) return;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / PITCH) + 1;
      const rows = Math.ceil(height / PITCH) + 1;

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          /* 严格格点：不抖。规则等距才有"纱窗"的质感 */
          const px = col * PITCH;
          const py = row * PITCH;
          const uy = py / height;
          const ux = px / width;

          /* 只在这条盒子里出现，从 0.2 起慢慢漫上来，不留一条硬切线 */
          const vertical = smoothstep(0.18, 0.92, uy);
          /*
           * 横向：中间最浓、往两侧收。
           * 只做边缘渐隐的话，整条带会是一条平的色带——参考站那条带是中段最深，
           * 两翼自然淡出去，所以这里用高斯权重而不是线性渐隐。
           */
          const hx = (ux - 0.5) / 0.46;
          const horizontal = Math.exp(-(hx * hx) / 2) * 0.75 + 0.25;
          const intensity = vertical * horizontal;
          if (intensity < 0.03) continue;

          const radius = 0.5 + Math.pow(intensity, 1.15) * (radiusMax - 0.5);

          /*
           * 点比底色亮：近白的淡靛。
           * 参考站的亮度差只有 2–8/255，但它的底色本身就亮（暖橙），
           * 我们的靛蓝明度低，同样的差值看不出来，所以要更亮一点。
           */
          // 点比底色亮。掺一点暖白（不是纯冷白）：整条紫带不至于发"冷尸"，
          // 这一点点偏暖肉眼几乎看不出色相，但会让画面比纯冷紫松弛。
          const alpha = Math.min(alphaMax, 0.02 + intensity * alphaMax).toFixed(3);
          ctx.fillStyle = `rgba(255, 246, 238, ${alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    };

    schedule();
    const observer = new ResizeObserver(schedule);
    observer.observe(canvas);
    window.addEventListener('resize', schedule);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return (
    /*
     * 色带是文档流里的一块，紧挨厂牌带上方，从上到下完整可见。
     *
     * 这一版把"方正的一条色条"改掉：外面套一层椭圆 mask，
     * 顶部中间高、两侧低，收成一条拱形的软边——参考站那条带的顶边就是弯的，
     * 直的顶边怎么调都像给页面贴了一条色纸。
     */
    <div
      aria-hidden
      className="relative h-full w-full"
      style={{
        maskImage:
          'radial-gradient(118% 122% at 50% 104%, #000 52%, rgba(0,0,0,0.9) 64%, rgba(0,0,0,0.45) 80%, rgba(0,0,0,0) 96%)',
        WebkitMaskImage:
          'radial-gradient(118% 122% at 50% 104%, #000 52%, rgba(0,0,0,0.9) 64%, rgba(0,0,0,0.45) 80%, rgba(0,0,0,0) 96%)',
      }}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ background: BAND_BG }}
      />
    </div>
  );
}
