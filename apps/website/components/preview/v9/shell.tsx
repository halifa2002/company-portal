'use client';

import Link from 'next/link';
import { LogoMark } from '@portal/ui';
import { brand, registerUrl } from '@/lib/brand';
import { Arrow } from '@/components/ui/arrow';

/**
 * v8 预览页的页脚。
 *
 * 页头已于 2026-11-14 改回复用正式站：app/preview/home/page.tsx 直接用
 * components/site-chrome 的 SiteHeader（用户：「顶部栏目我正式版就不错，复用他」），
 * 所以这里不再有 V8Header；预览页只保留自己的页脚，定稿后可整块丢弃。
 */

export function V8Footer() {
  const updated = new Date().toISOString().slice(0, 10);

  const columns = [
    {
      title: '产品',
      links: [
        { label: '模型广场', href: '/models' },
        { label: '价格', href: '/pricing' },
        { label: '控制台', href: '/console' },
      ],
    },
    {
      title: '开发者',
      links: [
        { label: '快速开始', href: '/docs/quickstart' },
        { label: '接口鉴权', href: '/docs/auth' },
        { label: '错误码', href: '/docs/errors' },
        { label: '常见问题', href: '/docs/faq' },
      ],
    },
    {
      title: '公司',
      links: [
        { label: '关于我们', href: '/about' },
        { label: '生态合作', href: '/partner' },
        { label: '服务协议', href: '/terms' },
        { label: '隐私政策', href: '/privacy' },
      ],
    },
  ];

  /*
   * 2026-11-13 晚：页脚改深色。
   *
   * 为什么改：浅底页脚在全站白底的末尾「没有收口」，看着像内容排完了草草结束；
   * 参考的几个站（硅基流动、agtcloud、fireworks、aihubmix）页脚都是深色，
   * 作用是给长页面一个明确的终点。深色只此两处：接入代码区（S6）与页脚，
   * 仍符合「浅色为默认、深色只做区段」的约束（C-V-01）。
   */
  return (
    <footer className="bg-code text-white">
      <div className="relative mx-auto w-full max-w-[1280px] px-6 py-14 md:px-10 md:py-16">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <div className="flex items-center gap-2.5">
              <LogoMark size="xs" />
              <span className="text-note font-semibold tracking-tight text-white">{brand.name}</span>
            </div>
            <p className="mt-4 max-w-[280px] text-meta leading-relaxed text-white/60">
              {brand.description}
            </p>
            <Link
              href={registerUrl}
              className="group mt-5 inline-flex items-center gap-2 text-meta font-medium text-white/80 transition-colors hover:text-white"
            >
              创建账号
              <Arrow />
            </Link>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <div className="text-meta font-medium uppercase tracking-[0.16em] text-white/50">
                {column.title}
              </div>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-meta text-white/65 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-meta text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {brand.name} · 保留所有权利
          </span>
          <span className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span>模型与价格数据更新于 {updated}</span>
            <span aria-hidden className="hidden h-3 w-px bg-white/15 sm:block" />
            <Link href="/partner" className="transition-colors hover:text-white/80">
              联系我们
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}