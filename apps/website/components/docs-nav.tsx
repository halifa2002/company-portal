'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DOC_GROUPS } from '@/lib/docs-nav';

const FLAT = DOC_GROUPS.flatMap((group) => group.items);

/**
 * 左侧分组导航。文档站的导航只有这一套：
 * 顶部原来还有一条「文档 / 接口速查 / 更新记录」的一级 tab，
 * 和这里的分组重复，2026-11-11 去掉了。
 */
export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="hidden shrink-0 lg:block lg:w-[200px] xl:w-[220px]">
      <div className="sticky top-24 space-y-7">
        {DOC_GROUPS.map((group) => (
          <div key={group.title}>
            <div className="text-meta font-semibold uppercase tracking-[0.12em] text-ink-muted">
              {group.title}
            </div>
            <ul className="mt-2.5 space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block rounded-control px-2.5 py-1.5 text-body transition-colors ${
                        active
                          ? 'bg-brand/8 font-medium text-brand'
                          : 'text-ink-mid hover:bg-black/[0.03] hover:text-ink'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

/** 窄屏没有左侧栏，换成一行可横向滑动的目录 */
export function DocsMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="-mx-6 mb-6 overflow-x-auto px-6 lg:hidden">
      <ul className="flex w-max items-center gap-1.5">
        {FLAT.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block whitespace-nowrap rounded-full border px-3 py-1.5 text-note transition-colors ${
                  active
                    ? 'border-brand/20 bg-brand/8 font-medium text-brand'
                    : 'border-line text-ink-mid hover:text-ink'
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
