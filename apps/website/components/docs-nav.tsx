'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DOC_GROUPS, DOC_TABS } from '@/lib/docs-nav';

/** 顶部三个一级入口：文档 / 接口速查 / 更新记录 */
export function DocsTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-7 border-b border-black/5">
      {DOC_TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`-mb-px border-b-2 py-3 text-sm transition-colors ${
              active
                ? 'border-brand font-medium text-brand'
                : 'border-transparent text-ink/60 hover:text-ink'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** 左侧分组导航 */
export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="hidden shrink-0 lg:block lg:w-[200px] xl:w-[220px]">
      <div className="sticky top-24 space-y-7">
        {DOC_GROUPS.map((group) => (
          <div key={group.title}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              {group.title}
            </div>
            <ul className="mt-2.5 space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block rounded-md px-2.5 py-1.5 text-[13.5px] transition-colors ${
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
