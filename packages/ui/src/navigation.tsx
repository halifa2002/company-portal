'use client';

/**
 * 统一导航：领导文档 7.2 要求的 11 项设计系统之一。
 *
 * 之前在官网和控制台各写了一遍「顶上/侧边一排链接 + 选中态」，两边的
 * 选中样式、间距、hover 都不一样，改一处忘一处。这里收成一个组件：
 *
 * - 选中态用「淡品牌底 + 品牌字」，和 Segmented 一致，不与主按钮抢视觉重量；
 * - 键盘可达（原生 a 元素）、当前页给 `aria-current="page"`，读屏能报出「当前页」；
 * - 不依赖 Next 的 Link，用普通 `a`，两端（官网 / 控制台）都能直接用；
 * - `orientation="vertical"` 给侧栏用，项多时自动折行不撑破布局。
 */

export interface NavigationItem {
  /** 目标地址，站内用相对路径 */
  href: string;
  /** 展示文案（已翻译好的文本，不在组件里做 i18n） */
  label: string;
  /** 可选数量角标，例如「调用日志 12」里的 12 */
  count?: string;
  /** 可选前置图标（已经渲染好的节点，通常是 16px 的 SVG） */
  icon?: React.ReactNode;
}

export function Navigation({
  items,
  activeHref,
  orientation = 'horizontal',
  ariaLabel,
  className = '',
}: {
  items: ReadonlyArray<NavigationItem>;
  /** 当前所在地址，匹配到这个 href 的项会进入选中态 */
  activeHref: string;
  orientation?: 'horizontal' | 'vertical';
  /** 读屏用：这组链接是干什么的，例如「主导航」 */
  ariaLabel: string;
  className?: string;
}) {
  const vertical = orientation === 'vertical';

  return (
    <nav
      aria-label={ariaLabel}
      className={`flex ${vertical ? 'flex-col gap-0.5' : 'flex-wrap items-center gap-1'} ${className}`}
    >
      {items.map((item) => {
        const active = item.href === activeHref;
        return (
          <a
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-2 rounded-control px-3 py-1.5 text-body font-medium transition-colors ${
              active
                ? 'bg-brand-soft text-brand'
                : 'text-ink-mid hover:bg-surface hover:text-ink'
            } ${vertical ? 'justify-between' : ''}`}
          >
            <span className="flex items-center gap-2">
              {item.icon ? (
                <span aria-hidden="true" className="shrink-0">
                  {item.icon}
                </span>
              ) : null}
              <span>{item.label}</span>
            </span>
            {item.count ? (
              <span className="text-meta tabular-nums opacity-70">
                {item.count}
              </span>
            ) : null}
          </a>
        );
      })}
    </nav>
  );
}
