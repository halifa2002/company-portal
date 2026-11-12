'use client';

/**
 * 分段切换：2~6 个互斥选项里挑一个（时间范围、成功/失败、按模型/按密钥、代码语言）。
 *
 * 为什么单独抽：
 *   原来这套「外层灰框 + 里面一排小按钮 + 选中给实心靛蓝」在 4 个页面手写了 7 处，
 *   内边距在 p-0.5 / p-1 之间跳，选中态有的是靛蓝实心有的是描边。
 *   更麻烦的是选中态用了品牌实心色，跟同一个页面里的主按钮一样重，
 *   一屏出现三块靛蓝，用户分不清哪个才是「下一步」。
 *
 * 所以这里选中态改成「淡品牌底 + 品牌字」：像一排白纸条里挑出一张浅蓝色的，
 * 靠底色和字色区分，视觉重量比实心按钮轻得多，不会跟主按钮抢。
 * 一开始试过「白底 + 浅阴影」，但卡片本身就是白的、页面底色又是 #f9fafb，
 * 两者相差不到 2%，截图里根本看不出选中的是哪个。
 */

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  /** 数量角标，例如「成功 128」里的 128。传 undefined 就不显示 */
  count?: string;
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  wrap = false,
  className = '',
}: {
  value: T;
  options: ReadonlyArray<SegmentedOption<T>>;
  onChange: (value: T) => void;
  /** 读屏用。这组按钮切换的是什么，不给就只有「按钮」两个字 */
  ariaLabel: string;
  /** 选项多到一行放不下时置 true，允许折行 */
  wrap?: boolean;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-0.5 rounded-control border border-line bg-surface p-0.5 ${
        wrap ? 'flex-wrap' : ''
      } ${className}`}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`rounded-[6px] px-2.5 py-1 text-meta font-medium transition-colors ${
              active
                ? 'bg-brand-soft text-brand'
                : 'text-ink-muted hover:bg-surface-subtle hover:text-ink'
            }`}
          >
            {option.label}
            {option.count && (
              <span className={`ml-1 tabular-nums ${active ? 'text-brand' : 'text-ink-muted'}`}>
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
