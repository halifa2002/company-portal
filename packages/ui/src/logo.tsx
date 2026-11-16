/**
 * 品牌图形：品牌蓝圆角方块 + 官方 TokenFlow 折线。
 *
 * 2026-11-16：图形已换成领导交付的官方标志（只取图形部分，不带文字）。
 * 折线来自 `public/brand/tokenflow-mark-white.png`，与网页图标、字标同源；
 * 不再用 SVG 手写路径——手写的那版 Z 折线和官方标志完全不是一回事。
 *
 * 官网顶栏/页脚现在直接用字标图，这个组件留给需要「方块里放图形」的场合
 * （控制台重置密码、预览版页脚等）。
 */

export type LogoMarkSize = 'xs' | 'sm' | 'md';

const SIZE: Record<LogoMarkSize, { box: string; icon: number }> = {
  /** 控制台顶栏 */
  xs: { box: 'h-8 w-8 rounded-[10px]', icon: 15 },
  /** 官网顶栏、找回密码、重置密码 */
  sm: { box: 'h-10 w-10 rounded-card', icon: 18 },
  /** 登录 / 注册页的主视觉 */
  md: { box: 'h-11 w-11 rounded-card', icon: 20 },
};

export function LogoMark({
  size = 'sm',
  glow = false,
  className = '',
}: {
  size?: LogoMarkSize;
  /** 是否带品牌投影。营销页要那圈光晕，工作台不要 */
  glow?: boolean;
  className?: string;
}) {
  const { box, icon } = SIZE[size];

  return (
    <span
      aria-hidden
      className={[
        /* inline-flex 而非 flex：找回密码/重置密码这类页面只有一层 text-center，
           块级元素会撑满整行、贴到左边去。 */
        'inline-flex shrink-0 items-center justify-center bg-logo-tile text-white transition-transform duration-300',
        'group-hover:scale-105',
        box,
        glow ? 'shadow-brand-sm' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <img
        src="/brand/tokenflow-mark-white.png"
        alt=""
        width={Math.round(icon * 1.3)}
        height={Math.round((icon * 1.3) / 1.7105)}
        draggable={false}
      />
    </span>
  );
}
