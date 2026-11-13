'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

/**
 * 分段入场（2026-11-13）
 *
 * 三段话：
 * 1. 节奏靠错开：同一秒全淡入等于没动效，60–90ms 一档才读得出顺序。
 * 2. 方向要分档：全是「从下往上浮」用七次也会腻。
 *    这里给三种——`up` 文字、`side` 图与卡片、`scale` 面块（0.985 → 1）。
 *    缓动曲线共用一条族（快出慢收），位移方向分开，观感才不是同一条动画复制七遍。
 * 3. 「减少动画」时**不偏移、不淡入**，直接原样呈现。不做缩短版——
 *    对晕动敏感的人，问题不是快慢，是有没有位移。
 *
 * 触发用 whileInView：进视口 15% 才播，播完不回退（once）。
 */
type From = 'up' | 'side' | 'scale';

const OFFSET: Record<From, { x: number; y: number; scale: number }> = {
  up: { x: 0, y: 16, scale: 1 },
  side: { x: 24, y: 0, scale: 1 },
  scale: { x: 0, y: 0, scale: 0.985 },
};

export function Reveal({
  children,
  delay = 0,
  from = 'up',
  className,
}: {
  children: ReactNode;
  /** 错开多少秒。同一组里按 0.06 递增 */
  delay?: number;
  /** 从哪个方向进场：文字 up、图与卡 side、色面块 scale */
  from?: From;
  className?: string;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  const offset = OFFSET[from];

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: offset.x, y: offset.y, scale: offset.scale }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
