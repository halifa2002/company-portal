'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * 预览页首屏标题 —— 实验版：保留「两句轮换」，节奏与出场方式对齐 teamorouter 现行做法。
 *
 * （更正：2026-11-15 早前静态扒代码时误判他们「不再轮换」，CDP 实测证明他们会换，
 *   每 4.2 秒一次，只是 DOM 里整行切换、不留逐字节点。静态分析不能替代运行时观测。）
 *
 * 2026-11-15 已转正：正式版与预览版用同一份实现（`components/home/` 与
 *    `components/preview/lab/` 内容一致），首屏标题两边都会轮换。
 *
 * 和正式版（v9.2 静态）的差别只有一个：这里两句交替。
 * 和旧的 v9.1（我们上一版）的差别有三条，也是这次要验证的东西：
 *
 *   1. **只做出场，不重演入场**。上一版换句时整句淡出 → 卸载 → 新句再逐字飞入，
 *      一次换句要 1.1 秒的连续运动，首屏每隔几秒就演一遍。现在出场 240ms
 *      （上移 0.24em + 模糊 2px），新句就用 240ms 的淡入落位，
 *      没有逐字阶梯、没有位移——观感是「一句话轻轻淡走，另一句轻轻到位」。
 *      首屏那一次整行阶梯入场（`.hero-line`，正式版那套参数）仍然保留在首次加载。
 *   2. **不 remount**。不用 `key={index}` 强制重建节点，React 原地换文本，
 *      所以 `.hero-line` 的入场动画只在首次跑一次，不会被轮换重新触发。
 *   3. **锁高度**。`min-height: 2lh`，两句换行时不把下面的按钮顶下去。
 *
 * 出场/回到原位用的是 class 切换 + transition（`.hero-fade`，定义在
 * app/globals.css 里，正式版与预览版共用）。
 *
 * 节奏：**实测 teamorouter 是每 4.2 秒换一次**（2026-11-15 用 CDP 每 200ms 采样 32 秒，
 * 实测间隔 4.17 / 4.37 / 4.24 / 4.29 / 4.22 秒，两句交替）。我们上一版用 9 秒，
 * 用户反馈「九秒会被人忽略」，所以这里对齐到 4.2 秒一轮。
 *
 * 下面的 HOLD 是「停留」时长，一轮 = HOLD + 两段 120ms 的淡出/淡入 ≈ 4.2s：
 *   3960ms 停留 + 240ms 淡出 + 换个句 + 240ms 淡入 —— 实际每次可见间隔 ≈ 4.2s。
 * （旧注释里「4 秒太急」是逐字重演那版的体验；现在出场只是一次 240ms 轻淡出，
 *   同样的节奏就不会显得急。真要更从容，改这一个常量即可。）
 */

const HOLD_MS = 3960;
const FADE_MS = 240;

type Frame = { accent: string; tail: string };

const FRAMES: Frame[] = [
  { accent: '一个网关', tail: '，接通 {n} 个模型' },
  { accent: '一套接入', tail: '，编程助手与业务通用' },
];

export function V8HeroHeadline({ modelCount }: { modelCount: number }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // 开启「减少动画」时不轮换，固定第一句
    if (reduced) return;
    const out = window.setTimeout(() => setLeaving(true), HOLD_MS);
    const swap = window.setTimeout(() => {
      setIndex((i) => (i + 1) % FRAMES.length);
      setLeaving(false);
    }, HOLD_MS + FADE_MS);
    return () => {
      window.clearTimeout(out);
      window.clearTimeout(swap);
    };
  }, [reduced, index]);

  const frame = FRAMES[index];
  const tail = frame.tail.replace('{n}', String(modelCount));

  return (
    <h1
      className={[
        'hero-fade mx-auto mt-7 max-w-[16em] break-words text-center font-display font-semibold tracking-[-0.02em] text-ink',
        leaving ? 'is-leaving' : '',
      ].join(' ')}
      style={{ fontSize: 'clamp(30px, 5.4vw, 72px)', lineHeight: 1.08, minHeight: '2lh' }}
      aria-live="off"
    >
      <span className="hero-line" style={{ '--i': 0 } as React.CSSProperties}>
        <span className="hero-grad-brand">{frame.accent}</span>，
      </span>
      {/* 第二行不参与轮换的位移，只跟着整块淡出淡入 */}
      <span className="hero-line" style={{ '--i': 1 } as React.CSSProperties}>
        {tail.replace('，', '')}
      </span>
    </h1>
  );
}
