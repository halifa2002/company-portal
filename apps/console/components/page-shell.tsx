import type { ReactNode } from 'react';

/**
 * 控制台内容区容器。
 *
 * 8 个页面原来都写成 <main className="px-6 py-6">，没有统一口径：
 * 新铺开的页面套了这个容器（带 1440 上限），没铺开的还是裸 px-6。
 * 两种写法在 1664 以上的宽屏上对不齐——标题被 max-w 收到中间、内容贴在左边，
 * 看上去就是「标题孤零零挂在半空」。
 *
 * 现在的口径（2026-11-12 按参考站修正）：
 *   · 不设最大宽度，铺满可用区域。产品要求「不要把界面缩小」。
 *   · 左右 24、下边留白 32、上边为 0——上间距交给标题区的 mb-4，避免两段留白叠成 40。
 * 新增页面套这个容器就行，别再自己写 padding。
 */
export function PageContainer({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className={`w-full px-page pb-8 pt-0 ${className}`}>
      {children}
    </main>
  );
}
