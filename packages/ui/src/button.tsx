import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

/**
 * 一屏只该有一个实心主按钮。
 *
 * 之前主按钮、链接、状态标签、图表柱、进度条全是同一个靛蓝，
 * 该跳出来的「新建密钥」跟旁边的小字链接一样重，扫不出重点。
 * 所以这里把「实心」只留给 primary，其余全部降成描边或纯文字。
 */
const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-hover',
  secondary: 'border border-line bg-surface text-ink hover:bg-surface-subtle',
  ghost: 'text-ink-mid hover:bg-surface-subtle hover:text-ink',
  danger: 'bg-danger text-white hover:bg-danger-text',
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-note',
  md: 'h-9 px-4 text-body',
};

/**
 * 按钮的类名拼装函数。
 * 单独导出是因为 <Link> 长得像按钮但不是 <button>，需要复用同一套类名，
 * 不能再手写一遍——手写就会漏掉按下态和禁用态，然后两边又不一样。
 */
export function buttonClass(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  extra = '',
): string {
  return [
    'inline-flex shrink-0 select-none items-center justify-center gap-1.5',
    'rounded-control font-medium',
    'transition-colors duration-150',
    // 按下回弹：原来全站 active 只有 1 处，按钮点下去毫无反应，
    // 重操作（删除、创建）用户会以为没点上，手指连点两三次。
    'enabled:active:translate-y-px',
    'disabled:cursor-not-allowed disabled:opacity-55',
    VARIANT[variant],
    SIZE[size],
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** 提交中：按钮变灰、转圈，并且自动禁用，避免重复提交 */
  loading?: boolean;
  /** loading 时的文案，默认沿用原文字 */
  loadingLabel?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingLabel,
  disabled,
  children,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      // 默认 type="button"：漏写 type 的按钮在 <form> 里会变成提交按钮，
      // 点「取消」把表单提交了，是这类页面最常见的手误。
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass(variant, size, className)}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {loading ? (loadingLabel ?? children) : children}
    </button>
  );
}
