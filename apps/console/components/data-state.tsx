'use client';

/**
 * 数据状态四件套：加载中 / 加载失败 / 真的没有 / 字段为空
 *
 * 为什么单独抽出来：
 * 之前全站这四种情况共用一个「—」。用户看到横杠无法判断是网卡了、请求被拒了、
 * 还是账户里真没有东西——同一屏六处横杠，等于什么都没说。
 * 现在按语义分开：
 *   · 加载中   → 灰色骨架条（有尺寸、会呼吸，说明"正在拿"）
 *   · 加载失败 → 「暂时没读到」+ 悬停可看重试入口（页级用 ErrorBox）
 *   · 真的没有 → 一句人话 + 下一步该干什么（EmptyHint）
 *   · 字段为空 → 才用那个横杠（PLACEHOLDER_DASH）
 */

/** 字段本身为空时才用它。除这里以外，别再手写 '—'。 */
export const PLACEHOLDER_DASH = '—';

/** 一块会呼吸的灰条。宽度用 className 给（w-16 / w-24 …）。
 *
 * 注意这里必须是 block 而不是 inline-block：行内元素的定宽在 flex 容器里
 * 会被内容宽度和祖先的排版规则拉回去，实测 w-24 只画出 32px，
 * 数字卡和表格的骨架全变成了小方块。块级元素的宽度才是说了算的。
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block animate-pulse rounded bg-line/80 ${className}`}
    />
  );
}

/**
 * 数值位：加载中给骨架，失败给「暂时没读到」，成功才给数字。
 *
 * 用法：<DataValue loading={loading} failed={todayQuota === null} width="w-20">
 *         {quotaToAmount(todayQuota)}
 *       </DataValue>
 */
export function DataValue({
  loading,
  failed,
  children,
  width = 'w-16',
  size = 'text-display',
}: {
  loading?: boolean;
  failed?: boolean;
  children: React.ReactNode;
  width?: string;
  size?: string;
}) {
  if (loading) {
    return <Skeleton className={`h-[1em] ${size} ${width}`} />;
  }
  if (failed) {
    return (
      <span
        className="text-xs font-normal text-ink-muted"
        title="暂时没读到，稍后重试一下"
      >
        暂时没读到
      </span>
    );
  }
  return <>{children}</>;
}

/** 表格里的加载态：几行骨架，行高与真实数据行一致，避免加载完成时页面跳动。 */
export function TableLoading({ colSpan, rows = 3 }: { colSpan: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-line last:border-0">
          <td colSpan={colSpan} className="px-4 py-3">
            {/*
              用网格列宽而不是 flex：flex 里定宽项会被旁边那条 flex-1 压扁，
              实测 w-24 只画出 32px，四根骨架变成一排小方块。
              网格的列宽是写死的，里面的占位条 w-full 一定铺满格子。
            */}
            <div className="grid grid-cols-[5rem_4rem_1fr_3rem] items-center gap-3">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-full" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

/** 非表格区域的加载态：几段错落的骨架条。 */
export function BlockLoading({ lines = 3 }: { lines?: number }) {
  const widths = ['w-1/3', 'w-2/3', 'w-1/2', 'w-3/5'];
  return (
    <div className="space-y-3" aria-busy="true" aria-label="加载中">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} className={`h-3.5 ${widths[index % widths.length]}`} />
      ))}
    </div>
  );
}

/**
 * 「真的没有数据」。必须带下一步：没有记录 → 去哪儿产生记录。
 * 不写「暂无数据」四个字了事——那和横杠一样，等于什么都没说。
 */
export function EmptyHint({
  text,
  hint,
}: {
  text: string;
  hint?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1 py-8 text-center">
      <span className="text-note text-ink">{text}</span>
      {hint && <span className="text-meta leading-relaxed text-ink-muted">{hint}</span>}
    </div>
  );
}

/** 页级失败块：整页数据没拉到时的统一长相，自带重试。 */
export function ErrorBox({
  message,
  onRetry,
  retrying,
}: {
  message: string;
  onRetry: () => void;
  retrying?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-danger/25 bg-danger-soft px-4 py-3 text-note text-danger-text">
      <span className="min-w-0">{message}</span>
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        className="shrink-0 rounded border border-danger/30 px-2 py-0.5 font-medium transition-colors hover:bg-danger/10 disabled:opacity-60"
      >
        {retrying ? '重试中…' : '重试'}
      </button>
    </div>
  );
}
