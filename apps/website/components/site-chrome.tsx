'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogoMark } from '@portal/ui';
import { brand, consoleUrl, loginUrl, nav, registerUrl } from '@/lib/brand';
import { UserMenu } from './user-menu';

/** 后端登录成功时会写一个可读标记 cookie（SSR 读不到，只在水合后判断） */
function readSessionHint(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some((item) => item.trim().startsWith('new_api_has_session='));
}

function useSessionHint(): boolean | null {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    const sync = () => setSignedIn(readSessionHint());
    sync();
    // 别的标签页登录/退出后切回来也要跟上
    window.addEventListener('focus', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      window.removeEventListener('focus', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);
  return signedIn;
}

/** 已登录：头像 + 账户下拉（身份信息在控制台那一侧，这里只给入口） */
function SignedInEntry() {
  return <UserMenu />;
}

/** 未登录时右上角的两个入口 */
function GuestEntry() {
  return (
    <>
      <Link
        href={registerUrl}
        className="hidden rounded-full px-4 py-2 text-body text-ink-soft transition-colors hover:text-brand sm:block"
      >
        注册
      </Link>
      <Link
        href={loginUrl}
        className="rounded-full px-5 py-2 text-body font-medium text-white 2xl:px-7 2xl:py-2.5 shadow-brand transition-all duration-300 hover:-translate-y-px hover:shadow-brand-lg"
        style={{ background: 'var(--gradient-primary)' }}
      >
        登录
      </Link>
    </>
  );
}

/** 顶部导航：品牌区 + 导航项 + 登录入口 */
export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const signedIn = useSessionHint();

  // 切换页面时收起手机端菜单
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6 2xl:h-[72px] 2xl:px-10">
        {/* 品牌区：图形 logo + 中英双行 */}
        <Link href="/" className="group flex items-center gap-2.5">
          <LogoMark glow />
          <span className="flex flex-col leading-none">
            <span className="text-heading font-bold tracking-tight text-ink 2xl:text-heading">
              {brand.name}
            </span>
            <span className="mt-1 text-meta font-medium uppercase tracking-[0.18em] text-ink-muted">
              {brand.shortName}
            </span>
          </span>
        </Link>

        {/* 导航项：当前页高亮 + hover 下划线 */}
        <nav className="hidden items-center gap-9 md:flex 2xl:gap-11">
          {nav.map((item) => {
            const active =
              !item.external &&
              (item.href === '/' ? pathname === '/' : pathname.startsWith(item.href));

            const linkClass = `group relative py-1 text-title transition-colors ${
              active ? 'font-medium text-brand' : 'text-ink-soft hover:text-ink'
            }`;

            const underline = (
              <span
                className={`absolute inset-x-0 -bottom-0.5 h-0.5 origin-left rounded-full bg-brand transition-transform duration-300 ${
                  active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}
              />
            );

            // 控制台在独立地址上，用普通 <a>，不走 Next 路由
            if (item.external) {
              return (
                <a key={item.href} href={item.href} className={linkClass}>
                  {item.label}
                  {underline}
                </a>
              );
            }

            return (
              <Link key={item.href} href={item.href} className={linkClass}>
                {item.label}
                {underline}
              </Link>
            );
          })}
        </nav>

        {/* 右侧：注册 / 登录，或已登录时的控制台入口 */}
        <div className="flex items-center gap-2">
          {signedIn === null ? (
            // 水合前先占位，避免已登录的人看到「注册 / 登录」闪一下
            <span aria-hidden className="invisible flex items-center gap-2">
              <span className="hidden rounded-full px-4 py-2 text-body sm:block">注册</span>
              <span className="rounded-full px-5 py-2 text-body font-medium 2xl:px-7 2xl:py-2.5">
                登录
              </span>
            </span>
          ) : signedIn ? (
            <SignedInEntry />
          ) : (
            <GuestEntry />
          )}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-control border border-line text-ink-soft transition-colors hover:border-brand/30 hover:text-brand md:hidden"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* 手机端下拉菜单：md 以下才出现 */}
      {menuOpen && (
        <div id="mobile-nav" className="border-t border-line bg-white md:hidden">
          <nav className="mx-auto flex max-w-[1600px] flex-col px-6 py-3">
            {nav.map((item) => {
              const active =
                !item.external &&
                (item.href === '/' ? pathname === '/' : pathname.startsWith(item.href));

              const itemClass = `rounded-control px-2 py-3 text-body transition-colors ${
                active ? 'font-medium text-brand' : 'text-ink-soft hover:bg-surface-tint'
              }`;

              if (item.external) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={itemClass}
                  >
                    {item.label}
                  </a>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={itemClass}
                >
                  {item.label}
                </Link>
              );
            })}
            {signedIn === false && (
              <Link
                href={registerUrl}
                onClick={() => setMenuOpen(false)}
                className="mt-1 rounded-control border-t border-line px-2 py-3 text-body text-ink-soft sm:hidden"
              >
                注册
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

/**
 * 页脚：品牌区 + 三组链接 + 底部版权条。
 *
 * 容器宽度与页头一致（max-w-[1600px]），否则页脚比页头窄一截，页面收尾会歪。
 * 顶部留一条从品牌色淡出的细线 + 一层很淡的靛蓝晕，给白底页面收个尾；
 * 除此之外不加装饰，md 7.1 要求浅色底 + 单一强调色。
 *
 * 链接分三组而不是四组：「条款」只有两条，单独成列会在右侧留一块空洞，
 * 并进「公司」后三列高度接近，整块不再一边重一边轻。
 * 分组标题用弱化的小字，不用竖线——竖线会让页脚看起来像表格。
 */
export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-footer">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(129,140,248,0.55),transparent)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/4 h-64 w-[760px] rounded-full bg-brand/[0.18] blur-3xl"
      />

      <div className="relative mx-auto max-w-[1600px] px-6 pt-16 pb-8 2xl:px-10 2xl:pt-20">
        {/*
          两段式：左侧品牌固定宽度，右侧三组链接跟随其后。
          早先用四等分 grid，每列右侧都要留一截空白，整块看起来碎；
          改成「品牌 | 链接组」两块后，中间的空是整块留白。
          2026-11-12：正文容器从 1024 放宽到 1600 后，原来「整块居中」的页脚
          在 1440 屏上从 x=323 才开始，和页头 logo（x=24）错开一大截，
          看着像没对齐的另一个站。改成两端对拉，品牌贴左、链接贴右，与页头一致。
        */}
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-x-16 xl:gap-x-24">
          {/* 品牌区：与页头同一套 logo 与中英双行，避免两块像两个网站 */}
          <div className="lg:max-w-[380px]">
            <Link href="/" className="group flex w-fit items-center gap-3">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-card text-white shadow-brand ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105"
                style={{ background: 'var(--gradient-brand)' }}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M6 7h12L6 17h12"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-heading font-bold tracking-tight text-white">
                  {brand.name}
                </span>
                <span className="mt-1.5 text-meta font-medium uppercase tracking-[0.2em] text-white/40">
                  {brand.shortName}
                </span>
              </span>
            </Link>

            <p className="mt-7 text-body font-medium tracking-tight text-white/85">
              {brand.tagline}
            </p>
            <p className="mt-2.5 max-w-[300px] text-note leading-[1.85] text-white/50">
              {brand.description}
            </p>

            <p className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-meta text-white/65">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" aria-hidden />
              已接入 DeepSeek，OpenAI 协议兼容
            </p>
          </div>

          {/* 三组链接：组内三列等距，整组靠右与品牌区对拉 */}
          <div className="grid grid-cols-2 gap-x-10 gap-y-10 sm:grid-cols-3 lg:gap-x-16 xl:gap-x-24">
            <FooterColumn
              title="产品"
              links={[
                { label: '模型广场', href: '/models' },
                { label: '价格说明', href: '/pricing' },
                { label: '更新记录', href: '/docs/changelog' },
                { label: '控制台', href: consoleUrl, external: true },
              ]}
            />
            <FooterColumn
              title="开发者"
              links={[
                { label: '接口文档', href: '/docs' },
                { label: '快速开始', href: '/docs/quickstart' },
                { label: '接口鉴权', href: '/docs/auth' },
                { label: '错误码', href: '/docs/errors' },
              ]}
            />
            <FooterColumn
              title="公司"
              links={[
                { label: '关于我们', href: '/about' },
                { label: '生态合作', href: '/partner' },
                { label: '服务协议', href: '/terms' },
                { label: '隐私政策', href: '/privacy' },
              ]}
            />
          </div>
        </div>

        {/* 版权条：公司主体与备案号未定前不摆「待定」字样，等定案再补真实信息 */}
        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-note text-white/45 md:flex-row md:items-center md:justify-between">
          <span>
            © {new Date().getFullYear()} {brand.name} · 保留所有权利
          </span>
          {/* ⚠️ AGPL 要求：对外提供服务需提供源码获取入口，仓库转为公开后这里换成链接 */}
          <span className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>基于开源项目构建</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}) {
  return (
    <div>
      <h3 className="text-note font-semibold tracking-[0.08em] text-white/50">{title}</h3>
      <ul className="mt-5 space-y-3.5">
        {links.map((link) => {
          const className =
            'inline-flex items-center gap-1 text-body text-white/70 transition-colors duration-200 hover:text-white';

          // 控制台在独立地址上，用普通 <a>，不走 Next 路由
          if (link.external) {
            return (
              <li key={link.href}>
                <a href={link.href} className={className}>
                  {link.label}
                  <span className="text-meta opacity-60" aria-hidden>
                    ↗
                  </span>
                </a>
              </li>
            );
          }

          return (
            <li key={link.href}>
              <Link href={link.href} className={className}>
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
