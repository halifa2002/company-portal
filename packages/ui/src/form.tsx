import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

/**
 * 输入类控件的唯一长相。
 *
 * 之前全站输入框都是手写的：有的 focus:border-brand 有的 focus:ring-1，
 * 有的圆角 rounded-md 有的 rounded-lg，禁用态有的灰底有的只是变淡。
 * 现在只有一个 CONTROL 常量，三个控件共用。
 *
 * 焦点用全局 focus-visible 环（globals.css 里兜的底），这里不再单独写 focus 样式，
 * 否则会出现「鼠标点一下也有环」的重复反馈。
 *
 * 注意：这里**不写宽度和高度以外的尺寸**。宽度由调用方给（w-full / w-60 / w-auto），
 * 高度由 size 给。原因是 Tailwind 的类按生成顺序生效、不按你在字符串里写的顺序，
 * 基础类里放 w-full 再传 w-60，谁赢是随机的——这种坑踩一次就查半天。
 */
const CONTROL = [
  'rounded-control border border-line bg-surface',
  'text-body text-ink placeholder:text-ink-muted',
  'transition-colors duration-150',
  'hover:border-ink-muted/40',
  'disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-ink-muted',
  'aria-[invalid=true]:border-danger',
].join(' ');

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** 校验没通过：边框变红，配合 <Field error> 用 */
  invalid?: boolean;
  /** 控件高度：md 36px（默认）/ sm 32px（表格工具条、弹窗里的行内输入） */
  density?: 'sm' | 'md';
}

export function Input({ invalid, density = 'md', className = '', ...rest }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={`${CONTROL} ${density === 'sm' ? 'h-8' : 'h-9'} px-3 ${className}`}
      {...rest}
    />
  );
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export function Select({ invalid, className = '', children, ...rest }: SelectProps) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={`${CONTROL} h-9 cursor-pointer pl-3 pr-8 ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ invalid, className = '', rows = 3, ...rest }: TextareaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      rows={rows}
      className={`${CONTROL} resize-y px-3 py-2 leading-normal ${className}`}
      {...rest}
    />
  );
}

/**
 * 表单一行：标签 + 控件 + 一句说明 + 错误。
 *
 * 抽出来是因为「标签在上、说明在下、间距 6px」这件事原来在每个弹窗里各写一遍，
 * 五处弹窗的间距分别是 4/6/8px，看着就是没对齐。
 */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className = '',
}: {
  label: ReactNode;
  htmlFor?: string;
  /** 一句人话解释，放在控件下面 */
  hint?: ReactNode;
  /** 校验错误，出现时替换 hint，不再两句挤在一起 */
  error?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-note font-medium text-ink">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p className="mt-1.5 text-meta leading-normal text-danger-text">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-meta leading-normal text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}
