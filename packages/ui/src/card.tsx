import type { ReactNode } from 'react';

/**
 * 卡片：内容分组的唯一容器。
 *
 * 原来「一个白底 + 一圈浅边 + 圆角」这套组合在 8 个页面里手写了 20 多次，
 * 内边距在 p-5 / p-6 / p-7 / p-8 之间乱跳（20/24/28/32）。
 * 现在内边距固定 24，圆角固定 12，边框只有一档。
 */
export function Card({
  children,
  className = '',
  /** 表格类内容自己贴边，不要内边距 */
  flush = false,
}: {
  children: ReactNode;
  className?: string;
  flush?: boolean;
}) {
  return (
    <div
      className={`rounded-card border border-line bg-surface ${
        flush ? 'overflow-hidden' : 'p-card'
      } ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * 卡片头部：左标题右操作。
 * 标题 16、说明 12，两者拉开 2 档，扫一眼就知道哪个是标题。
 */
export function CardHeader({
  title,
  description,
  actions,
  className = '',
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-start justify-between gap-3 ${
        description ? 'mb-4' : 'mb-3'
      } ${className}`}
    >
      <div className="min-w-0">
        <h2 className="text-title font-semibold text-ink">{title}</h2>
        {description && (
          <p className="mt-1 text-meta leading-normal text-ink-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

/**
 * 页面级说明条：一段灰底说明，用于「这块是干什么的」。
 * 取代原来在标题下面直接铺一段正文、跟表格抢注意力的做法。
 */
export function Notice({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-control bg-surface-subtle px-3 py-2.5 text-note leading-normal text-ink-mid ${className}`}
    >
      {children}
    </div>
  );
}
