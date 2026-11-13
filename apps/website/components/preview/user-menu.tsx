'use client';

import { useEffect, useRef, useState } from 'react';
import { consoleUrl } from '@/lib/brand';

/**
 * 已登录时的头像入口。
 *
 * 为什么只有一个头像、没有邮箱和用户名：官网是静态导出（output: 'export'），
 * 拿不到「当前登录的是谁」——用户名、邮箱都在控制台那一侧，两边不同源，
 * 跨源去问还要吃后端的登录限流额度。所以头像用一个品牌图形代替首字母，
 * 头部文字说明这里是账户区，真实身份点进去由控制台显示。
 *
 * 退出为什么跳到控制台的 /logout 而不是在这里直接清 cookie：
 * refresh cookie 的 Path 是 /api/user/auth，跨源请求会被浏览器拦掉，
 * 在这里发请求等于什么都没做，用户会以为退出了、其实服务端会话还在。
 */

const items = [
  { label: '数据看板', href: consoleUrl, Icon: GridIcon },
  { label: '个人资料', href: `${consoleUrl}/settings`, Icon: PersonIcon },
  { label: '钱包', href: `${consoleUrl}/wallet`, Icon: WalletIcon },
];

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="账户菜单"
        className="flex h-9 w-9 items-center justify-center rounded-full text-white ring-1 ring-black/5 transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 2xl:h-10 2xl:w-10"
        style={{ background: 'var(--gradient-primary)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 7h12L6 17h12"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="账户菜单"
          className="absolute right-0 top-full z-50 mt-2.5 w-[264px] overflow-hidden rounded-card border border-line bg-white shadow-[var(--shadow-popover)]"
        >
          {/* 头部：说的是「这里是账户」，不是「你是谁」——名字拿不到，就不编一个 */}
          <div className="flex items-center gap-3 px-4 py-4">
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 7h12L6 17h12"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="min-w-0">
              <span className="block text-body font-semibold leading-tight text-ink">
                我的账户
              </span>
              <span className="mt-1 block text-meta leading-tight text-ink-muted">
                已登录 · 点下方进入
              </span>
            </span>
          </div>

          <div className="h-px bg-black/[0.06]" />

          <div className="py-1.5">
            {items.map(({ label, href, Icon }) => (
              <a
                key={label}
                role="menuitem"
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-body text-ink transition-colors hover:bg-surface-tint hover:text-ink"
              >
                <Icon />
                {label}
              </a>
            ))}
          </div>

          <div className="h-px bg-black/[0.06]" />

          <div className="py-1.5">
            <a
              role="menuitem"
              href={`${consoleUrl}/logout`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-body text-danger transition-colors hover:bg-danger/5"
            >
              <ExitIcon />
              退出登录
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function GridIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.6" />
      <rect x="14" y="3.5" width="6.5" height="6.5" rx="1.6" />
      <rect x="3.5" y="14" width="6.5" height="6.5" rx="1.6" />
      <rect x="14" y="14" width="6.5" height="6.5" rx="1.6" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.8 20c.6-3.6 3.5-5.6 7.2-5.6s6.6 2 7.2 5.6" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3.8 8.2A2.4 2.4 0 0 1 6.2 5.8h11.6a2.4 2.4 0 0 1 2.4 2.4v8.6a2.4 2.4 0 0 1-2.4 2.4H6.2a2.4 2.4 0 0 1-2.4-2.4z" />
      <path d="M16.2 12.6h2.4" />
    </svg>
  );
}

function ExitIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14.5 4.8H7.2a2.4 2.4 0 0 0-2.4 2.4v9.6a2.4 2.4 0 0 0 2.4 2.4h7.3" />
      <path d="M16.8 8.6 20.2 12l-3.4 3.4M10.2 12h9.6" />
    </svg>
  );
}
