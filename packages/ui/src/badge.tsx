import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand';

/**
 * 状态标签。
 *
 * 两个约束：
 *   · 底色和文字都走语义变量的「浅底 / 深字」两件套，不再手写 bg-green-50 + text-ok；
 *     手写的绿底用的是 Tailwind 调色板，和品牌靛蓝不是一个温区，摆一起发脏。
 *   · 永远带一个圆点。只靠红绿两色区分状态，色弱用户看不出差别——
 *     颜色是加速器，不是唯一信息通道。
 */
const TONE: Record<BadgeTone, { wrap: string; dot: string }> = {
  neutral: { wrap: 'bg-surface-subtle text-ink-mid', dot: 'bg-ink-muted' },
  brand: { wrap: 'bg-brand-soft text-brand', dot: 'bg-brand' },
  success: { wrap: 'bg-ok-soft text-ok-text', dot: 'bg-ok' },
  warning: { wrap: 'bg-warn-soft text-warn-text', dot: 'bg-warn' },
  danger: { wrap: 'bg-danger-soft text-danger-text', dot: 'bg-danger' },
  info: { wrap: 'bg-info-soft text-info-text', dot: 'bg-info' },
};

export function Badge({
  tone = 'neutral',
  children,
  withDot = true,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  withDot?: boolean;
}) {
  const style = TONE[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-control px-2 py-0.5 text-meta font-medium ${style.wrap}`}
    >
      {withDot && (
        <span aria-hidden className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
      )}
      {children}
    </span>
  );
}
