/**
 * 品牌图形：靛蓝圆角方块 + 白色 Z 折线。
 *
 * 官网顶栏原来自己写了一份，控制台（登录、注册、找回密码、重置密码、顶栏）
 * 用的是 `brand.initial` 文字——同一次打开，官网是 Z、控制台是「虫」。
 * 品牌图形只能有一个来源，所以收到这里，两边都引它。
 *
 * 不用文字首字的原因：中文字形在该尺寸下笔画糊成一团，且「虫洞 AI」的
 * 首字跟 Z 折线没有任何视觉关联；官网那版折线在 14px 下依然认得出。
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
        'inline-flex shrink-0 items-center justify-center bg-brand text-white transition-transform duration-300',
        'group-hover:scale-105',
        box,
        glow ? 'shadow-brand-sm' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M6 7h12L6 17h12"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
