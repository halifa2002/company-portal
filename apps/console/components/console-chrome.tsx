'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authApi, setAccessToken } from '@portal/api-client';
import { LogoMark } from '@portal/ui';
import type { SelfUser } from '@portal/types';
import { brand, docsUrl, pricingUrl, siteUrl } from '@/lib/brand';
import { ensureMoneySettings, moneyUnit, quotaToAmount } from '@/lib/format';
import { Skeleton } from '@/components/data-state';

/**
 * 控制台侧边导航
 * 对应 md 4.2 的 A–G 七个模块
 *
 * 2026-11-10 改版：原来每项是「标题 + 一行说明」两行，七个两行块堆在一起
 * 显得又高又碎。参考站的做法是单行 + 小图标 + 均匀行距，扫起来快一倍。
 * 说明文字没有删，挪到 title 里，鼠标停一下还能看到。
 */
const items = [
  {
    href: '/',
    label: '概览',
    hint: '余额、消费、调用量',
    icon: (
      <path d="M3 13h4l2.5-7 3.5 12 2.5-5H21" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    href: '/models',
    label: '可用模型',
    hint: '你能调用的模型与价格',
    icon: (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
      </>
    ),
  },
  {
    href: '/keys',
    label: 'API 密钥',
    hint: '创建与管理 Key',
    icon: (
      <>
        <circle cx="8" cy="12" r="4" />
        <path d="M12 12h9m-3 0v3m-3-3v2" strokeLinecap="round" />
      </>
    ),
  },
  {
    href: '/usage',
    label: '用量统计',
    hint: '按天/模型/Key',
    icon: (
      <>
        <path d="M4 20V10m5 10V5m5 15v-7m5 7V8" strokeLinecap="round" />
      </>
    ),
  },
  {
    href: '/billing',
    label: '消费记录',
    hint: '逐笔明细',
    icon: (
      <>
        <path d="M6 3.5h12v17l-3-2-3 2-3-2-3 2z" strokeLinejoin="round" />
        <path d="M9 8h6M9 12h6" strokeLinecap="round" />
      </>
    ),
  },
  {
    href: '/wallet',
    label: '充值',
    section: '账户',
    hint: '余额与充值',
    icon: (
      <>
        <rect x="3.5" y="6" width="17" height="12" rx="2.5" />
        <path d="M3.5 10h17" />
        <circle cx="16.5" cy="14" r="1.1" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    href: '/settings',
    label: '账户设置',
    section: '账户',
    hint: '资料与安全',
    icon: (
      <>
        <circle cx="12" cy="8.5" r="3.5" />
        <path d="M5 20c1.2-3.4 3.8-5 7-5s5.8 1.6 7 5" strokeLinecap="round" />
      </>
    ),
  },
] as const;

/**
 * 顶栏站点导航，与官网顶栏**逐项一致**（首页 · 控制台 · 模型广场 · 价格 · 文档 · 生态合作 · 关于）。
 *
 * 为什么必须一致：用户在官网和控制台之间来回跳，两套不同的菜单等于要重新认一次路。
 * 参考站就是这么做的——站点导航在两边保持同一套项目与顺序。
 *
 * 左侧栏的「模型广场」已改名「可用模型」，避免和顶栏的站点页同名不同去向。
 * 站点链接一律新标签页打开：控制台不卸载，登录态与手头进度都不受影响。
 */
const SITE_LINKS = [
  { label: '首页', href: siteUrl },
  { label: '模型广场', href: `${siteUrl}/models` },
  { label: '价格', href: pricingUrl },
  { label: '文档', href: docsUrl },
  { label: '生态合作', href: `${siteUrl}/partner` },
  { label: '关于', href: `${siteUrl}/about` },
];

/** 取某一项所属的小节名；没有声明小节的项目归到上一组 */
function sectionOf(entry: (typeof items)[number]): string | undefined {
  return 'section' in entry ? (entry as { section?: string }).section : undefined;
}

/**
 * 顶栏余额的模块级缓存（只存金额数字，单位在渲染时统一拼 moneyUnit()）。
 *
 * 60 秒内翻页复用同一个值，不去碰接口。
 * 两条硬规则：
 *   · 取失败不写缓存 —— 失败也被记住一分钟的话，用户点「重试」也换不回新结果，
 *     看着就是页面坏了。失败后下次进页面重新问一次，代价只是一个请求。
 *   · 退出登录必须清空 —— 否则下一个人 60 秒内登录，看到的是上一个人的余额。
 */
const BALANCE_TTL = 60_000;
let balanceCache: { at: number; value: string } | null = null;

function readBalanceCache(): string | undefined {
  if (!balanceCache) return undefined;
  if (Date.now() - balanceCache.at > BALANCE_TTL) return undefined;
  return balanceCache.value;
}

function writeBalanceCache(value: string) {
  balanceCache = { at: Date.now(), value };
}

function clearBalanceCache() {
  balanceCache = null;
}

/**
 * 顶栏头像要知道「我是谁」。余额那条链路本来就要问一次 /user/self，
 * 这里共用同一个请求，不额外多打一次接口（后端对 self 也有限流）。
 * 失败不记住：下次进页面重新问，头像退化成品牌色圆点。
 */
let selfCache: SelfUser | null = null;
let selfPending: Promise<SelfUser> | null = null;

function loadSelf(): Promise<SelfUser> {
  if (selfCache) return Promise.resolve(selfCache);
  if (!selfPending) {
    selfPending = authApi
      .getSelf()
      .then((me) => {
        selfCache = me;
        return me;
      })
      .catch((err) => {
        selfPending = null;
        throw err;
      });
  }
  return selfPending;
}

function clearSelfCache() {
  selfCache = null;
  selfPending = null;
}


export function ConsoleSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed bottom-0 left-0 top-16 hidden w-56 border-r border-line bg-surface md:block">
      <nav className="px-3 py-4">
        {items.map((item, index) => {
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          // 只在分组变化时打一次小标题（参考站那种「聊天 / 常规 / 个人」的节奏）
          const section = sectionOf(item);
          const previous = index > 0 ? sectionOf(items[index - 1]) : undefined;
          const showSection = Boolean(section) && section !== previous;

          return (
            <div key={item.href}>
              {showSection && (
                <div className="mx-3 mb-1 mt-4 text-meta font-medium text-ink-muted">{section}</div>
              )}
              <Link
                href={item.href}
                title={item.hint}
                className={`mb-0.5 flex items-center gap-2.5 rounded-control px-3 py-2.5 text-body transition-colors ${
                  active
                    ? 'bg-surface-subtle font-medium text-ink'
                    : 'text-ink-muted hover:bg-surface-subtle/70 hover:text-ink'
                }`}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden
                  className={active ? 'text-ink' : 'text-ink-muted'}
                >
                  {item.icon}
                </svg>
                <span className="truncate">{item.label}</span>
              </Link>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

export function ConsoleTopbar({
  title,
  subtitle,
  balance,
}: {
  title: string;
  /**
   * 标题下面那句话，交代「这一页是什么」。
   *
   * 2026-11-12：用户连删三次，最后一句「标题就孤零零的不就行了」——
   * 现在**没有任何页面传它**，八个页面的标题全部单独一行。
   * 参数留着是因为这件事（要不要解释）按页判断，不是按项目判断；
   * 真要再加，传一句 20 字以内的话即可。
   */
  subtitle?: string;
  /** 页面自己已经拿到余额金额（不带单位）时直接传入，省一次请求；不传则顶栏自己取 */
  balance?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);
  /**
   * 手机端导航抽屉。
   * 侧边栏在 md 以下整块隐藏，之前也没有汉堡菜单，手机用户只能从右上角「我」
   * 进账户设置——密钥、用量、消费、充值全部无路可走。
   */
  const [navOpen, setNavOpen] = useState(false);
  /**
   * 顶栏余额：以前只有概览页传了 balance，其余六个页面顶栏永远显示「余额 —」，
   * 看上去像"余额读不出来"。现在页面不传时顶栏自己取一次，并用模块级缓存
   * 60 秒内复用——翻页不会因此多打接口（后端有限流，多打会撞 429）。
   * undefined = 还在取，null = 取失败。
   */
  const [ownBalance, setOwnBalance] = useState<string | null | undefined>(balance);
  /** 头像里的那个字：显示名称优先，没有就用用户名。取不到就画品牌色圆点 */
  const [selfName, setSelfName] = useState('');

  useEffect(() => {
    let alive = true;
    void loadSelf()
      .then((me) => {
        if (alive) setSelfName(me.display_name || me.username || '');
      })
      .catch(() => {
        // 静默：头像退化成圆点，不打扰用户
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (balance !== undefined) {
      setOwnBalance(balance);
      return;
    }
    const cached = readBalanceCache();
    if (cached !== undefined) {
      setOwnBalance(cached);
      return;
    }
    let alive = true;
    void (async () => {
      try {
        await ensureMoneySettings();
        const me = await loadSelf();
        const text = quotaToAmount(me.quota);
        writeBalanceCache(text);
        if (alive) setOwnBalance(text);
      } catch {
        // 失败不入缓存：让下一次进入页面重新问一次，而不是把失败记住一分钟
        if (alive) setOwnBalance(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [balance]);

  // 换页面就收起抽屉，否则点完还能看到它盖在新页面上
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await authApi.logout();
    } catch {
      // 后端登出失败也要让本地退出，否则页面卡住
    } finally {
      setAccessToken(null);
      // 余额是上个账号的，退出时必须连缓存一起清掉，否则下一个人登录会看到它
      clearBalanceCache();
      clearSelfCache();
      router.replace('/login');
    }
  }

  return (
    <>
      {/*
        全宽固定顶栏，版式与官网顶栏保持一致：
        品牌靠左 · 导航居中 · 账户靠右，字号同为 16px。
        之前导航紧贴 logo 左边、字号 15px，和官网不成一套。
      */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
        <div className="flex h-16 w-full items-center justify-between px-6 2xl:px-10">
          <div className="flex min-w-0 items-center gap-2">
            {/* 手机端导航入口：md 以下侧边栏不存在，这个按钮是唯一的入口 */}
            <button
              type="button"
              onClick={() => setNavOpen((open) => !open)}
              aria-label={navOpen ? '关闭导航菜单' : '打开导航菜单'}
              aria-expanded={navOpen}
              aria-controls="console-mobile-nav"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line text-ink-muted transition-colors hover:text-ink md:hidden"
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
                {navOpen ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
            <a href={siteUrl} className="group flex shrink-0 items-center gap-2.5">
              <LogoMark size="xs" />
              <span className="hidden text-title font-bold tracking-tight text-ink sm:inline">
                {brand.name}
              </span>
            </a>
          </div>

          <nav className="hidden items-center gap-9 md:flex 2xl:gap-11">
            {/* 首页 → 控制台（当前）→ 其余站点页，与官网顶栏顺序完全一致；
                跨应用跳转统一走同标签页，行为与官网点「控制台」一致 */}
            <a
              href={siteUrl}
              className="py-1 text-title text-ink-muted transition-colors hover:text-ink"
            >
              首页
            </a>
            <Link
              href="/"
              className="relative py-1 text-title font-medium text-brand"
            >
              控制台
              <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-brand" />
            </Link>
            {SITE_LINKS.slice(1).map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="py-1 text-title text-ink-muted transition-colors hover:text-ink"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4 text-sm text-ink-muted">
          <span className="hidden items-center gap-1.5 sm:flex">
            <span className="text-ink-muted">余额</span>
            {ownBalance === undefined ? (
              <Skeleton className="h-3.5 w-14" />
            ) : ownBalance === null ? (
              <span
                className="text-meta text-ink-muted"
                title="余额暂时读不到，稍后重试一下"
              >
                暂时没读到
              </span>
            ) : (
              <span className="tabular-nums text-ink">
                {ownBalance} {moneyUnit()}
              </span>
            )}
          </span>

          {/* 账户区：头像（点进账户设置）+ 退出。头顶两件事，不藏进菜单 */}
          <div className="flex items-center gap-2">
            <Link
              href="/settings"
              title={selfName ? `${selfName} · 账户设置` : '账户设置'}
              className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-note font-medium text-brand">
                {selfName ? selfName.slice(0, 1).toUpperCase() : ''}
              </span>
            </Link>
            <button
              type="button"
              disabled={signingOut}
              onClick={() => void handleSignOut()}
              className="rounded-control border border-line px-2.5 py-1 text-note text-ink-mid transition-colors hover:border-ink/25 hover:text-ink disabled:opacity-60"
            >
              {signingOut ? '退出中…' : '退出'}
            </button>
          </div>
        </div>
        </div>
      </header>

      {/* 手机端导航抽屉：与侧边栏同一份 items，另加官网六个入口 */}
      {navOpen && (
        <>
          <div
            aria-hidden
            onClick={() => setNavOpen(false)}
            className="fixed inset-0 top-16 z-20 bg-black/20 md:hidden"
          />
          <nav
            id="console-mobile-nav"
            className="fixed inset-x-0 top-16 z-30 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-line bg-surface px-3 pb-4 pt-3 shadow-lg md:hidden"
          >
            {items.map((item) => {
              const active =
                item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setNavOpen(false)}
                  className={`flex items-center gap-3 rounded-control px-3 py-2.5 text-body ${
                    active
                      ? 'bg-surface-subtle font-medium text-ink'
                      : 'text-ink-muted hover:bg-surface-subtle/70 hover:text-ink'
                  }`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    aria-hidden
                  >
                    {item.icon}
                  </svg>
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}

            <div className="mt-3 border-t border-line pt-3">
              <div className="whitespace-nowrap px-3 text-meta font-medium text-ink-muted">官网</div>
              <div className="mt-1 grid grid-cols-2 gap-1">
                {SITE_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="truncate rounded-control px-3 py-2 text-body text-ink-muted hover:bg-surface-subtle/70 hover:text-ink"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </nav>
        </>
      )}

      {/* 给固定顶栏让位；页面标题跟随内容滚动，不占用固定高度。
          标题和内容用同一个最大宽度 + 同一个左右内边距，宽屏下才对得齐——
          之前标题是 px-6、内容也是 px-6 但内容没有宽度上限，一放大屏幕就错位。 */}
      <div className="h-16" />
      {/*
        标题区：跟内容同一个左边距，贴在左上角。
        以前这里套了 max-w-content + mx-auto，而下面各页的 <main> 是铺满的，
        于是在 1664 以上的宽屏上出现「标题跑到中间、内容贴在左边」——
        看着就是两个字孤零零挂在半空。现在两边都不设上限，宽度天然一致。
        间距也收紧了：mt-7/mb-6 → mt-5/mb-4，标题成为页头的一部分，而不是独立一段。
      */}
      <div className="mb-4 mt-5 w-full px-page text-left">
        <h1 className="text-heading font-semibold text-ink">{title}</h1>
        {subtitle ? (
          <p className="mt-1 max-w-[68ch] text-note leading-normal text-ink-muted">{subtitle}</p>
        ) : null}
      </div>
    </>
  );
}
