'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * 首屏大标题（2026-11-13）
 *
 * 做法照 TeamoRouter（拆开看的）：
 * 1. **整句轮换**：两句话交替，各停约 4.2 秒；
 * 2. **逐字入场**：每个字一个 span，阶梯 40ms，动画是「上移 0.32em + 模糊 3px → 落位」，
 *    时长 0.28s、缓动 cubic-bezier(.22,1,.36,1)。轮换时整句重新入场，所以看起来像"打字/换字"；
 * 3. **彩色词**：`background-clip: text` + 背景位置来回移动，6.5s 一次。
 *
 * 与对方的两处不同：
 * - 渐变用我们的靛蓝（brand-300 → brand-500 → brand-200），对方是橙。
 * - 系统开「减少动画」时**不轮换**，固定显示第一句——对晕动敏感的人，
 *   反复换字比一次性入场难受得多。
 *
 * 文案（用户要求照抄 teamorouter 的两句，改成我们语序）：
 *   A：专用于生产环境的 / 统一大模型网关
 *   B：Agent 接入 / 大模型的统一入口
 */

type Frame = {
  /** 第一行：前缀 + 高亮词 + 后缀 */
  line1: { before: string; accent: string; after: string };
  /** 第二行 */
  line2: string;
};

const FRAMES: Frame[] = [
  { line1: { before: '专用于', accent: '生产环境', after: '的' }, line2: '统一大模型网关' },
  /*
   * 第二句也要有一个高亮词，否则两句交替时"一半有颜色一半没有"，看着像掉色。
   * 选 Agent 而不是"统一入口"：高亮词固定在**第一行**，交替时眼睛不用上下跳。
   */
  { line1: { before: '', accent: 'Agent', after: ' 接入' }, line2: '大模型的统一入口' },
];

/** 每个字错开多少毫秒 */
const CHAR_STEP = 40;
/**
 * 每句停留多久（毫秒）。
 *
 * 2026-11-13 的三次调整，记下来备用：
 *   4200 → 4 秒，第二句刚看懂就被换走，太急；
 *   8000 → 还行，但用户仍觉得快；
 *   12000 → 现在这档。
 *
 * **别超过 15000**：首屏平均停留十几秒，再慢就有人看不到第二句，
 * 那句"Agent 接入"等于白写。想让它更从容，应该缩短句子，而不是拉长间隔。
 */
const HOLD = 12000;
/** 换句前的淡出时长（毫秒） */
const OUT_MS = 260;

export function HeroHeadline() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  /**
   * exiting：正在淡出。
   * 原先换句是「旧字瞬间消失、新字逐字浮现」——出去是硬切、进来是渐显，两头不对称，
   * 看着像闪了一下。现在先整体淡出 260ms（轻轻上移 6px），淡完再换下一句、
   * 让新句子逐字进场，出和进都有交代，节奏才连得上。
   */
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const fadeOut = window.setTimeout(() => setExiting(true), HOLD - OUT_MS);
    const swap = window.setTimeout(() => {
      setIndex((current) => (current + 1) % FRAMES.length);
      setExiting(false);
    }, HOLD);
    return () => {
      window.clearTimeout(fadeOut);
      window.clearTimeout(swap);
    };
  }, [reduced, index]);

  const frame = FRAMES[index];

  /*
   * key = index：换句时整段重新挂载，里面的逐字动画才会从头播。
   * 不这么做的话 React 复用同一批节点，动画只在第一次跑。
   * 淡出走的是 class 过渡（不重挂载），所以两者互不干扰。
   */
  return (
    <h1
      key={index}
      aria-label={`${frame.line1.before}${frame.line1.accent}${frame.line1.after}，${frame.line2}`}
      className={[
        'mt-6 max-w-[11.2em] font-display font-medium tracking-[-0.02em] text-ink',
        'transition-[opacity,transform] duration-[260ms] ease-out will-change-[opacity,transform]',
        exiting ? 'pointer-events-none -translate-y-1.5 opacity-0' : 'translate-y-0 opacity-100',
      ].join(' ')}
      /*
       * 行高 1.05 → 1.14（2026-11-13）：1.05 是给纯中文排的，中文没有下伸部分，
       * 但第二句带英文 Agent，g 的尾巴会直接压到下一行"大模型"的头上。
       * 1.14 中文看着不散，英文也有了下伸空间。
       */
      style={{ fontSize: 'clamp(40px, 6.2vw, 100px)', lineHeight: 1.14 }}
    >
      <span className="block">
        <Chars text={frame.line1.before} start={0} />
        {/*
          高亮词必须**整词一个元素**：background-clip:text 只裁元素自己直接包含的文字，
          包一层带子 span 的容器，渐变就裁到空、字直接消失（第一版就是这样丢了"生产环境"）。
        */}
        {frame.line1.accent ? (
          <span
            className="hero-ch hero-grad"
            style={{ '--d': `${frame.line1.before.length * CHAR_STEP}ms` } as React.CSSProperties}
          >
            {frame.line1.accent}
          </span>
        ) : null}
        {frame.line1.after ? (
          <Chars text={frame.line1.after} start={frame.line1.before.length + frame.line1.accent.length} />
        ) : null}
      </span>
      <span className="block">
        {/* 第二行接着第一行的延迟继续排，整句读起来是连续的一次扫过 */}
        <Chars text={frame.line2} start={frame.line1.before.length + frame.line1.accent.length + frame.line1.after.length} />
      </span>
    </h1>
  );
}

function Chars({ text, start }: { text: string; start: number }) {
  return (
    <>
      {Array.from(text).map((char, i) => (
        <span
          key={`${char}-${start + i}`}
          className="hero-ch"
          style={{ '--d': `${(start + i) * CHAR_STEP}ms` } as React.CSSProperties}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </>
  );
}
