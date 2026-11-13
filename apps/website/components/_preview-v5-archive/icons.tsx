import type { ReactNode } from 'react';

/**
 * 预览版图标集（2026-11-13）
 *
 * 之前那六个图标是手画的，各自为政：有的描边落在半像素上、有的线宽不一样、
 * 有的（网关那条）画出来像音量图标——语义都不对。缩到 23px 就露馅。
 *
 * 这里按 Lucide（ISC 许可，https://lucide.dev）的 24 网格几何重画：
 * 统一 24×24 视框、1.6 线宽、圆头圆角、关键点都落在整格上。
 * 六个形状与 Lucide 的 shield-check / route / key / layers / gauge / eye 一致，
 * 只是描边参数按本站的密度调过（Lucide 默认 2，在 22px 下偏粗）。
 *
 * 以后要直接引图标库：lucide-react 是最省事的一个（ISC，按需 tree-shaking），
 * 装不上时照这份文件继续手写也不会跑版——网格和线宽已经定死。
 */
export type IconName = 'shield-check' | 'route' | 'key' | 'layers' | 'gauge' | 'eye';

const SHAPES: Record<IconName, ReactNode> = {
  /* 盾 + 勾：承诺不变（模型不降级） */
  'shield-check': (
    <>
      <path d="M12 3 19 6v5.6c0 4.2-2.9 7.4-7 8.9-4.1-1.5-7-4.7-7-8.9V6z" />
      <path d="m8.9 12.1 2.2 2.2 3.9-4.4" />
    </>
  ),
  /* 一条线穿过两个端点：请求怎么从这头走到那头（网关） */
  route: (
    <>
      <circle cx="6" cy="18.5" r="2.5" />
      <circle cx="18" cy="5.5" r="2.5" />
      <path d="M9 18.5h7a3.5 3.5 0 0 0 0-7h-8a3.5 3.5 0 0 1 0-7h6" />
    </>
  ),
  /* 钥匙：额度锁在 Key 上 */
  key: (
    <>
      <circle cx="7.5" cy="15.5" r="3.5" />
      <path d="m10 13 9.5-9.5" />
      <path d="m16.5 6.5 3 3" />
      <path d="m13.5 9.5 2.5 2.5" />
    </>
  ),
  /* 三层叠放：批量采购的阶梯 */
  layers: (
    <>
      <path d="M12 3.4 20.4 7.7 12 12 3.6 7.7z" />
      <path d="m3.6 12.2 8.4 4.3 8.4-4.3" />
      <path d="m3.6 16.6 8.4 4.3 8.4-4.3" />
    </>
  ),
  /* 表盘 + 指针：按实际用量结算 */
  gauge: (
    <>
      <path d="M3.8 18.2a9 9 0 1 1 16.4 0" />
      <path d="m12 14 3.8-3.8" />
    </>
  ),
  /* 眼睛：价格公开，不加暗费 */
  eye: (
    <>
      <path d="M2.6 12S6.2 5.6 12 5.6 21.4 12 21.4 12 17.8 18.4 12 18.4 2.6 12 2.6 12z" />
      <circle cx="12" cy="12" r="2.7" />
    </>
  ),
};

export function PreviewIcon({
  name,
  size = 22,
  strokeWidth = 1.6,
  className,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {SHAPES[name]}
    </svg>
  );
}
