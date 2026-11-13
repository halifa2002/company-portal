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
        className="hidden text-body text-ink-mid transition-colors hover:text-ink sm:block"
      >
        注册
      </Link>
      <Link href={loginUrl} className="pv-btn pv-btn--primary h-9 px-4 text-note">
        登录
      </Link>
    </>
  );
}

/**
 * 顶部导航（预览版，2026-11-13 按参考站重排）
 *
 * 三处跟原来不同，都是为了「一眼看得出是一套系统」：
 * 1. **一条线**：整条导航只有下边一条浅线，不加投影、不加渐变——
 *    参考站靠这条线跟内容分开，不靠阴影。
 * 2. **单行标识**：logo 与中英名排在同一行，英文名缩成 10px 的字距放宽小标。
 *    原来是上下两行，高度被撑到 72，跟下面每一段的节奏都对不上。
 * 3. **只有一级按钮**：登录是实心块，注册是纯文字——导航里两个按钮一样重，
 *    等于没有主次。
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const signedIn = useSessionHint();

  // 切换页面时收起手机端菜单
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e4eaf1] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-6 px-6 md:px-8">
        {/* 品牌区：图形 logo + 中英同行 */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <LogoMark glow />
          <span className="text-title font-bold tracking-tight text-ink">{brand.name}</span>
          <span className="hidden text-[10px] font-medium uppercase tracking-[0.24em] text-ink-muted lg:inline">
            {brand.shortName}
          </span>
        </Link>

        {/* 导航项：hover 只变字色，不加下划线、不加底色 */}
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => {
            const active =
              !item.external &&
              (item.href === '/' ? pathname === '/' : pathname.startsWith(item.href));

            const linkClass = `text-body transition-colors ${
              active ? 'font-medium text-ink' : 'text-ink-mid hover:text-ink'
            }`;

            // 控制台在独立地址上，用普通 <a>，不走 Next 路由
            if (item.external) {
              return (
                <a key={item.href} href={item.href} className={linkClass}>
                  {item.label}
                </a>
              );
            }

            return (
              <Link key={item.href} href={item.href} className={linkClass}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 右侧：注册 / 登录，或已登录时的控制台入口 */}
        <div className="flex items-center gap-4">
          {signedIn === null ? (
            // 水合前先占位，避免已登录的人看到「注册 / 登录」闪一下
            <span aria-hidden className="invisible flex items-center gap-4">
              <span className="hidden text-body sm:block">注册</span>
              <span className="h-9 w-[68px] text-note">登录</span>
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
            className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-[#e4eaf1] text-ink-mid transition-colors hover:text-ink md:hidden"
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
        <div id="mobile-nav" className="border-t border-[#e4eaf1] bg-white md:hidden">
          <nav className="mx-auto flex max-w-[1200px] flex-col px-6 py-3 md:px-8">
            {nav.map((item) => {
              const active =
                !item.external &&
                (item.href === '/' ? pathname === '/' : pathname.startsWith(item.href));

              const itemClass = `px-2 py-3 text-body transition-colors ${
                active ? 'font-medium text-ink' : 'text-ink-mid hover:text-ink'
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
                className="mt-1 border-t border-[#e4eaf1] px-2 py-3 text-body text-ink-mid sm:hidden"
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
 * 页脚（预览版，2026-11-13 第四版）
 *
 * 上一版照参考站做「左深右浅两块拼」：左块深海军蓝放品牌，右块浅灰放链接。
 * 想法没错，落在 1240 的容器里出了两个问题：
 *   1. 两块之间那道竖缝在浅底上像"图没对齐"——左块 430 宽，右块 810 宽，
 *      右边三列链接只占 560，剩下的 250 全空着，收尾看着像没写完；
 *   2. 上面刚是一整块浅蓝 CTA，紧接浅灰页脚，两个浅色叠在一起，
 *      页面最后没有一个"落下来"的结尾。
 *
 * 现在整幅深海军蓝、通栏到底，四列（品牌 + 三列链接）+ 一条底栏。
 * 收尾要沉，深色是唯一能压住上面那块浅蓝的办法；颜色仍是品牌色阶里的深海军蓝。
 */
export function SiteFooter() {
  return (
    <footer className="bg-[#061c2e] text-white">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-16">
          {/* 左：品牌块 */}
          <div>
            <Link href="/" className="group flex w-fit items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-[6px] text-white ring-1 ring-white/10"
                style={{ background: 'var(--gradient-brand)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M6 7h12L6 17h12"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="flex items-baseline gap-2.5">
                <span className="text-title font-bold tracking-tight text-white">{brand.name}</span>
                <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/40">
                  {brand.shortName}
                </span>
              </span>
            </Link>

            <p className="mt-7 max-w-[18em] text-[19px] font-medium leading-[1.45] tracking-tight text-white/90">
              {brand.tagline}
            </p>
            {/*
              按句号断行，不让浏览器自己折。
              中文可以在任意两个字之间断，自动换行会把「为企 / 业与开发者」劈成两半。
            */}
            <p className="mt-3 max-w-[22em] text-note leading-[1.9] text-white/50">
              {brand.description
                .split('。')
                .map((sentence) => sentence.trim())
                .filter(Boolean)
                .map((sentence) => (
                  <span key={sentence} className="block">
                    {sentence}。
                  </span>
                ))}
            </p>

            <p className="mt-8 inline-flex w-fit items-center gap-2 rounded-[4px] border border-white/12 bg-white/[0.06] px-3 py-1.5 text-meta text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" aria-hidden />
              已接入 DeepSeek，OpenAI 协议兼容
            </p>
          </div>

          {/* 右：三列链接。col 之间用竖线分开，跟上面的正文分区同一套语言 */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:pl-10">
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
        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-meta text-white/40 md:flex-row md:items-center md:justify-between">
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
      {/*
        列标题原来用 #688091 的常规字重，落在 #eef3f9 上只有 3:1 出头，
        远看像一行没加载完的占位字。改成 #45647a + 600 字重、字距拉开，
        跟下面的链接形成"标题 / 条目"两级，扫读时先看见三个分组。
      */}
      <h3 className="text-meta font-semibold tracking-[0.12em] text-ink-mid">{title}</h3>
      <ul className="mt-4 space-y-3.5">
        {links.map((link) => {
          const className =
            'inline-flex items-center gap-1 text-body text-ink-soft transition-colors duration-200 hover:text-brand';

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
