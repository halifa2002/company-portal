/**
 * Button 样式构件（2026-11-14 第二版：直角）
 *
 * 上一版是 8px 圆角的「软按钮」。参考站（teamorouter）的按钮是**完全直角 + 1px 实边**，
 * 视觉上更像工具、更像产品文档里的控件，而不是营销页的胶囊。领导对这个观感反馈更正面。
 *
 * 所以：
 *   - 圆角从 rounded-md 改成 rounded-none（真的方，不留 2px 的"伪直角"）
 *   - 描边变体的边框从 ink/20 加重到 ink，让它真的看得见
 *   - 其余（高度、间距、focus 环）不动，避免一改全乱
 *
 * 为什么做成「样式函数」而不是组件：
 *   站点里的按钮大多是 next/link 包装的 <Link>，包成组件反而要处理 asChild；
 *   一个函数返回 className，Link / button / a 都能用。
 *
 * 变体按用途分，不按颜色分——这样以后换主题只改一处。
 * 尺寸两档：md（44px，正文场景）、sm（36px，导航/工具栏）。
 */

type Variant = 'primary' | 'secondary' | 'ghost' | 'inverse' | 'inverse-outline';
type Size = 'md' | 'sm';

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'bg-ink text-white hover:bg-ink/90 focus-visible:outline-ink',
  secondary: 'border border-ink bg-white text-ink hover:bg-surface-subtle focus-visible:outline-ink',
  ghost: 'text-ink-mid hover:bg-surface-subtle hover:text-ink focus-visible:outline-ink',
  inverse: 'bg-white text-ink hover:bg-surface-subtle focus-visible:outline-white',
  'inverse-outline': 'border border-white/40 text-white hover:border-white focus-visible:outline-white',
};

const SIZE_CLASS: Record<Size, string> = {
  md: 'h-11 px-6 text-note',
  sm: 'h-9 px-4 text-meta',
};

/** 返回一组可直接放到 className 的按钮样式 */
export function buttonStyles(variant: Variant = 'primary', size: Size = 'md'): string {
  return [
    'inline-flex items-center justify-center gap-2 rounded-none font-medium',
    'transition-colors duration-200',
    'focus-visible:outline-2 focus-visible:outline-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
  ].join(' ');
}
