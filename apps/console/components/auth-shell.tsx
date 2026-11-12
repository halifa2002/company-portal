'use client';

import type { ReactNode } from 'react';
import { LogoMark } from '@portal/ui';
import { siteUrl } from '@/lib/brand';

/**
 * 登录 / 注册共用的外框。
 *
 * 这两页原来各写了一遍：logo 尺寸 40、标题 text-xl、说明 text-xs、面板 p-6、
 * 圆角 rounded-panel、阴影手写变量——两页的字号和间距还能看出细微差别。
 * 现在共用一份，改一处两页同时变。
 *
 * 不加左右分栏的大插画：这两页是「路过一次就走」的页面，多一块视觉只会让
 * 焦点从输入框上移开，而且没有真实产品截图时，插画越大越像模板。
 */
export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-subtle px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <LogoMark size="md" />
          <h1 className="mt-4 text-heading font-semibold text-ink">{title}</h1>
          <p className="mt-1.5 text-note leading-normal text-ink-muted">{description}</p>
        </div>

        <div className="rounded-panel border border-line bg-surface p-card shadow-[var(--shadow-card)]">
          {children}
        </div>

        {/* 回官网放在表单下面：它是退路，不该跟「登录」抢同一个视觉高度 */}
        <p className="mt-7 text-center">
          <BackToSite />
        </p>
      </div>
    </div>
  );
}

/**
 * 「返回官网」入口。
 *
 * 原来登录页是一行灰色裸文字，找回密码和重置密码是描边小按钮——同一个动作
 * 三种长相。更实际的问题是：裸文字贴在表单正下方，看着像表单的附属说明，
 * 用户想退出时会先去试卡片里的链接。
 *
 * 现在统一成一枚描边胶囊：有边界、能点、离表单留够气口（mt-7），
 * 但仍是白底描边而不是实心——退路不该和「登录」这个主按钮同重量。
 */
export function BackToSite() {
  return (
    <a
      href={siteUrl}
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-note text-ink-muted transition-all duration-200 hover:border-brand/40 hover:bg-brand-soft hover:text-brand"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M11 6l-6 6 6 6M5 12h14"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      返回官网
    </a>
  );
}

/**
 * 表单级提示条。用它替代原来那种 `bg-red-50 + text-danger` 的手写红块——
 * 那套红底不在 tokens 里，换皮改不到，而且红底配正红字对比度只有 3 点几。
 */
export function AuthAlert({ tone = 'danger', children }: { tone?: 'danger' | 'warn'; children: ReactNode }) {
  const skin =
    tone === 'warn'
      ? 'border-warn/25 bg-warn-soft text-warn-text'
      : 'border-danger/25 bg-danger-soft text-danger-text';

  return (
    <p
      role="alert"
      className={`mt-4 flex items-start gap-2 rounded-control border px-3 py-2 text-note leading-normal ${skin}`}
    >
      <span aria-hidden className="mt-px shrink-0 font-semibold">
        !
      </span>
      <span className="min-w-0">{children}</span>
    </p>
  );
}
