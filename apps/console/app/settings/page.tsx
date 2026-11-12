'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, accountApi, ApiError } from '@portal/api-client';
import type { SelfUser } from '@portal/types';
import type { LoginSession } from '@portal/api-client';
import { ConsoleSidebar, ConsoleTopbar } from '@/components/console-chrome';
import { BlockLoading, EmptyHint, PLACEHOLDER_DASH, Skeleton } from '@/components/data-state';
import {
  ensureMoneySettings,
  formatNumber,
  formatTime,
  groupLabel,
  moneyUnit,
  quotaToAmount,
} from '@/lib/format';

/**
 * 账户设置 —— md 4.2 F
 *
 * 结构参考 agtcloud.cn/profile（官方 new-api 的个人资料页）：
 * 顶部一张账号卡把身份信息收拢，金额与安全各占一块，登录设备独立成栏。
 * 与参考站的差别：参考站的「两步验证 / Passkey」我们没做界面——后端接口有，
 * 但要接验证码、恢复码、WebAuthn 一整套，属于后续功能，这里不摆空按钮。
 */

/** User-Agent → 人能看懂的一句话（浏览器 · 系统） */
function describeAgent(ua: string | undefined): string {
  if (!ua) return '未知设备';
  const browsers: [RegExp, string][] = [
    [/Edg\//i, 'Edge'],
    [/OPR\/|Opera/i, 'Opera'],
    [/Firefox\//i, 'Firefox'],
    [/Chrome\//i, 'Chrome'],
    [/Safari\//i, 'Safari'],
  ];
  const systems: [RegExp, string][] = [
    [/Windows NT/i, 'Windows'],
    [/Mac OS X/i, 'macOS'],
    [/Android/i, 'Android'],
    [/iPhone|iPad/i, 'iOS'],
    [/Linux/i, 'Linux'],
  ];
  const browser = browsers.find(([re]) => re.test(ua))?.[1] ?? '浏览器';
  const system = systems.find(([re]) => re.test(ua))?.[1] ?? '未知系统';
  return `${browser} · ${system}`;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<SelfUser | null>(null);
  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  /** 改密码默认收起：这是高风险操作，列表页只留一行入口，表单放进弹窗 */
  const [pwdOpen, setPwdOpen] = useState(false);
  /** 三个密码框各自的「显示/隐藏」开关，跟常见做法一致 */
  const [showPwd, setShowPwd] = useState({ old: false, next: false, again: false });
  const [revoking, setRevoking] = useState<string | null>(null);
  /**
   * 「加载失败」和「保存 / 改密码失败」分开记。
   * 后者是操作反馈，不该带「重试拉数据」的按钮；前者才是页面没内容可看。
   */
  const [loadFailed, setLoadFailed] = useState(false);
  /** 设备列表单独失败：它是另一个接口，挂了不该把整页判死，也不能谎报「0 台在用」 */
  const [sessionsFailed, setSessionsFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setLoadFailed(false);
    setSessionsFailed(false);
    let sessionsMissing = false;
    try {
      await ensureMoneySettings();
      const [me, sess] = await Promise.all([
        authApi.getSelf(),
        accountApi.listSessions().catch(() => {
          sessionsMissing = true;
          return [] as LoginSession[];
        }),
      ]);
      setUser(me);
      setDisplayName(me.display_name || '');
      setSessionsFailed(sessionsMissing);
      const items = Array.isArray(sess) ? sess : [];
      // 当前设备排最前，其余按最近活跃时间倒序
      setSessions(
        [...items].sort((a, b) => {
          if (a.current !== b.current) return a.current ? -1 : 1;
          return (b.last_active_at ?? b.created_at) - (a.last_active_at ?? a.created_at);
        }),
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace('/login');
        return;
      }
      setLoadFailed(true);
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const roleLabel = useMemo(() => {
    if (!user) return '';
    if (user.role >= 100) return '超级管理员';
    if (user.role >= 10) return '管理员';
    return '普通用户';
  }, [user]);

  /** 没名字时留空，交给头像去画人形轮廓——之前拿「?」当首字母，看着像图片加载失败 */
  const initial = (user?.display_name || user?.username || '').slice(0, 1).toUpperCase();

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await accountApi.updateProfile({ display_name: displayName });
      setNotice('资料已更新');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setNotice('');
    if (newPassword !== newPassword2) {
      setError('两次输入的新密码不一致');
      return;
    }
    if (newPassword.length < 8) {
      setError('新密码至少 8 位');
      return;
    }
    setChangingPassword(true);
    try {
      await accountApi.changePassword({
        original_password: oldPassword,
        password: newPassword,
      });
      setNotice('密码已修改，其他设备需重新登录');
      setOldPassword('');
      setNewPassword('');
      setNewPassword2('');
      setPwdOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '修改密码失败');
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleRevoke(session: LoginSession) {
    if (
      !window.confirm(
        session.current
          ? '退出当前设备会立刻回到登录页，确定吗？'
          : `让这台设备退出登录？${describeAgent(session.user_agent)}`,
      )
    ) {
      return;
    }
    setRevoking(session.sid);
    try {
      await accountApi.revokeSession(session.sid);
      if (session.current) {
        router.replace('/login');
        return;
      }
      setNotice('该设备已退出');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setRevoking(null);
    }
  }

  async function handleRevokeOthers() {
    if (!window.confirm('确定要让其他所有设备退出登录？')) return;
    try {
      await accountApi.revokeOtherSessions();
      setNotice('其他设备已退出');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    }
  }

  return (
    <div className="min-h-screen md:pl-56">
      <ConsoleSidebar />
      <ConsoleTopbar title="账户设置" />

      <main className="px-6 py-6">
        <div className="w-full">
          {error && (
            <div className="mb-5 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-xs text-danger">
              {error}
            </div>
          )}
          {notice && (
            <div className="mb-5 rounded-card border border-green-200 bg-green-50 px-4 py-3 text-xs text-ok">
              {notice}
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-3">
            {/* 左栏：账号 / 额度 / 安全 */}
            <div className="space-y-5 lg:col-span-2">
              {/* 账号卡 */}
              <section className="rounded-card border border-line bg-surface p-6">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand text-xl font-semibold text-white">
                    {loading ? (
                      <Skeleton className="h-full w-full rounded-full" />
                    ) : initial ? (
                      initial
                    ) : (
                      /* 没设名字时画人形轮廓。以前用「?」当首字母，用户以为头像加载失败 */
                      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
                        <circle cx="12" cy="8.5" r="3.4" stroke="currentColor" strokeWidth="1.6" />
                        <path
                          d="M4.8 19.6c1.3-3.4 4-5.2 7.2-5.2s5.9 1.8 7.2 5.2"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-ink">
                        {loading ? (
                          <Skeleton className="h-5 w-28" />
                        ) : loadFailed ? (
                          <span className="text-sm font-normal text-ink-muted">读取失败</span>
                        ) : (
                          user?.display_name || user?.username || PLACEHOLDER_DASH
                        )}
                      </h2>
                      {roleLabel && (
                        <span className="rounded bg-brand-soft px-2 py-0.5 text-[11px] text-brand">
                          {roleLabel}
                        </span>
                      )}
                      {/* 读不到账号信息时不能显示「标准档」——那是编的，groupLabel 会把空值默认成标准档 */}
                      {user && (
                        <span
                          title="不同档位的价格与可用模型不同，由管理员分配，用户不能自己改"
                          className="rounded border border-line px-2 py-0.5 text-[11px] text-ink-muted"
                        >
                          计费档位 {groupLabel(user.group)}
                        </span>
                      )}
                      {/* 文档 4.2 F 的「账户状态」：后端 1=启用 2=禁用 */}
                      {user && (
                        <span
                          className={`rounded px-2 py-0.5 text-[11px] ${
                            user.status === 1
                              ? 'bg-green-50 text-ok'
                              : 'bg-red-50 text-danger'
                          }`}
                        >
                          {user.status === 1 ? '账号正常' : '账号已禁用'}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-ink-muted">
                      {loading ? (
                        <Skeleton className="h-3.5 w-20" />
                      ) : loadFailed ? (
                        '读取失败'
                      ) : user?.username ? (
                        `@${user.username}`
                      ) : (
                        PLACEHOLDER_DASH
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-ink-muted">
                      <span className="inline-flex items-center gap-1">
                        邮箱
                        {loading ? (
                          <Skeleton className="h-3 w-16" />
                        ) : loadFailed ? (
                          '读取失败'
                        ) : (
                          user?.email || '未绑定'
                        )}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        用户 ID
                        {loading ? (
                          <Skeleton className="h-3 w-10" />
                        ) : loadFailed ? (
                          '读取失败'
                        ) : (
                          (user?.id ?? PLACEHOLDER_DASH)
                        )}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        余额
                        {loading ? (
                          <Skeleton className="h-3 w-16" />
                        ) : loadFailed ? (
                          '读取失败'
                        ) : user ? (
                          `${quotaToAmount(user.quota)} ${moneyUnit()}`
                        ) : (
                          PLACEHOLDER_DASH
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSave} className="mt-5 flex flex-wrap items-end gap-3 border-t border-line pt-4">
                  <label className="min-w-0">
                    <span className="block text-xs text-ink-muted">显示名称</span>
                    <input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="输入显示名称"
                      className="mt-1 w-64 rounded-md border border-line px-3 py-2 text-sm outline-none transition-colors focus:border-brand"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={saving || loading}
                    className="rounded-md border border-line px-4 py-2 text-sm text-ink transition-colors hover:bg-surface-subtle disabled:opacity-50"
                  >
                    {saving ? '保存中…' : '保存'}
                  </button>
                  <span className="pb-2 text-[11px] text-ink-muted">
                    只改展示用的名字，登录用户名不变
                  </span>
                </form>
              </section>

              {/* 额度概览 */}
              <section className="rounded-card border border-line bg-surface">
                <div className="flex items-center justify-between border-b border-line px-6 py-3">
                  <h2 className="text-sm font-medium text-ink">额度与用量</h2>
                  <div className="flex gap-4 text-xs">
                    <a href="/wallet" className="text-brand hover:underline">
                      去充值
                    </a>
                    <a href="/billing" className="text-brand hover:underline">
                      消费记录
                    </a>
                  </div>
                </div>
                <div className="grid gap-4 px-6 py-5 sm:grid-cols-3">
                  <div>
                    <div className="text-xs text-ink-muted">可用余额</div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <StatValue loading={loading} failed={loadFailed}>
                        {user ? quotaToAmount(user.quota) : PLACEHOLDER_DASH}
                      </StatValue>
                      <span className="text-xs text-ink-muted">{moneyUnit()}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-ink-muted">已用额度</div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <StatValue loading={loading} failed={loadFailed}>
                        {user ? quotaToAmount(user.used_quota) : PLACEHOLDER_DASH}
                      </StatValue>
                      <span className="text-xs text-ink-muted">{moneyUnit()}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-ink-muted">总调用次数</div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <StatValue loading={loading} failed={loadFailed}>
                        {user ? formatNumber(user.request_count) : PLACEHOLDER_DASH}
                      </StatValue>
                      <span className="text-xs text-ink-muted">次</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 登录与认证 —— 改密码不常驻表单，只留一行入口，点开走弹窗 */}
              <section>
                <h2 className="mb-3 text-sm font-medium text-ink">登录与认证</h2>
                <div className="flex items-center justify-between gap-4 rounded-card border border-line bg-surface p-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-ink-muted">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 3l7 3v6c0 4.2-2.9 7.4-7 9-4.1-1.6-7-4.8-7-9V6l7-3Z" />
                        <path d="M9.5 12.2l1.8 1.8 3.4-3.6" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink">更改密码</div>
                      <div className="mt-0.5 truncate text-xs text-ink-muted">
                        更新您的密码以确保账户安全
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setNotice('');
                      setPwdOpen(true);
                    }}
                    className="shrink-0 rounded-md border border-line px-3 py-1.5 text-xs text-ink transition-colors hover:border-brand hover:text-brand"
                  >
                    更改密码
                  </button>
                </div>
              </section>
            </div>

            {/* 右栏：登录设备 */}
            <section className="h-fit rounded-card border border-line bg-surface">
              <div className="border-b border-line px-5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-medium text-ink">登录设备</h2>
                  <button
                    type="button"
                    onClick={() => void handleRevokeOthers()}
                    className="text-xs text-danger transition-opacity hover:opacity-70"
                  >
                    全部踢出
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-ink-muted">
                  {loading
                    ? '正在读取…'
                    : loadFailed || sessionsFailed
                      ? '设备数读不出来'
                      : `共 ${sessions.length} 台在用，逐台可踢`}
                </p>
              </div>

              <div className="divide-y divide-line">
                {loading ? (
                  <div className="px-5 py-5">
                    <BlockLoading lines={2} />
                  </div>
                ) : loadFailed || sessionsFailed ? (
                  <EmptyHint
                    text="设备列表没读出来"
                    hint="点页面上方「重试」再拉一次——这不是没有登录记录"
                  />
                ) : sessions.length === 0 ? (
                  <EmptyHint
                    text="暂无其他登录记录"
                    hint="在当前浏览器外的设备登录后，会在这里逐条列出来"
                  />
                ) : (
                  sessions.map((session) => (
                    <div key={session.sid} className="px-5 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm text-ink">
                              {describeAgent(session.user_agent)}
                            </span>
                            {session.current && (
                              <span className="shrink-0 rounded bg-brand-soft px-1.5 py-0.5 text-[10px] text-brand">
                                当前
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-[11px] text-ink-muted">
                            {session.ip === '::1' || session.ip === '127.0.0.1'
                              ? '本机'
                              : session.ip || '未知 IP'}
                            {session.login_method
                              ? ` · ${session.login_method === 'password' ? '密码登录' : session.login_method}`
                              : ''}
                          </div>
                          <div className="mt-0.5 text-[11px] text-ink-muted">
                            最近活跃{' '}
                            {formatTime(session.last_active_at ?? session.created_at)}
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={revoking === session.sid}
                          onClick={() => void handleRevoke(session)}
                          className="shrink-0 rounded border border-line px-2 py-1 text-[11px] text-ink-muted transition-colors hover:border-danger hover:text-danger disabled:opacity-50"
                        >
                          {revoking === session.sid ? '…' : '退出'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* 更改密码弹窗 —— 常见的「点按钮弹窗改密码」做法，页面上不留常驻表单 */}
      {pwdOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
          onClick={() => {
            setPwdOpen(false);
          }}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-panel border border-line bg-surface shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-line px-6 py-4">
              <div>
                <h2 className="text-sm font-medium text-ink">更改密码</h2>
                <p className="mt-1 text-xs text-ink-muted">
                  更新账户密码：{user?.email || user?.username || '当前账号'}
                </p>
              </div>
              <button
                type="button"
                aria-label="关闭"
                onClick={() => setPwdOpen(false)}
                className="-mr-1 rounded p-1 text-ink-muted transition-colors hover:text-ink"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="px-6 py-5">
              <div className="grid gap-4">
                <label className="block">
                  <span className="block text-xs font-medium text-ink">当前密码</span>
                  <span className="relative mt-1.5 block">
                    <input
                      type={showPwd.old ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full rounded-md border border-line px-3 py-2 pr-10 text-sm outline-none transition-colors focus:border-brand"
                    />
                    <button
                      type="button"
                      aria-label={showPwd.old ? '隐藏密码' : '显示密码'}
                      onClick={() => setShowPwd((s) => ({ ...s, old: !s.old }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-muted transition-colors hover:text-ink"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      >
                        <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" />
                        <circle cx="12" cy="12" r="2.6" />
                      </svg>
                    </button>
                  </span>
                </label>

                <label className="block">
                  <span className="block text-xs font-medium text-ink">新密码</span>
                  <span className="relative mt-1.5 block">
                    <input
                      type={showPwd.next ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-md border border-line px-3 py-2 pr-10 text-sm outline-none transition-colors focus:border-brand"
                    />
                    <button
                      type="button"
                      aria-label={showPwd.next ? '隐藏密码' : '显示密码'}
                      onClick={() => setShowPwd((s) => ({ ...s, next: !s.next }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-muted transition-colors hover:text-ink"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      >
                        <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" />
                        <circle cx="12" cy="12" r="2.6" />
                      </svg>
                    </button>
                  </span>
                  <span className="mt-1 block text-[11px] text-ink-muted">
                    使用 8 位以上字符；改完后其他设备需重新登录。
                  </span>
                </label>

                <label className="block">
                  <span className="block text-xs font-medium text-ink">确认新密码</span>
                  <span className="relative mt-1.5 block">
                    <input
                      type={showPwd.again ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={newPassword2}
                      onChange={(e) => setNewPassword2(e.target.value)}
                      className="w-full rounded-md border border-line px-3 py-2 pr-10 text-sm outline-none transition-colors focus:border-brand"
                    />
                    <button
                      type="button"
                      aria-label={showPwd.again ? '隐藏密码' : '显示密码'}
                      onClick={() => setShowPwd((s) => ({ ...s, again: !s.again }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-muted transition-colors hover:text-ink"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      >
                        <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" />
                        <circle cx="12" cy="12" r="2.6" />
                      </svg>
                    </button>
                  </span>
                </label>
              </div>

              {error && (
                <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs text-danger">{error}</p>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPwdOpen(false);
                    setOldPassword('');
                    setNewPassword('');
                    setNewPassword2('');
                  }}
                  className="rounded-md border border-line px-4 py-2 text-sm text-ink-muted transition-colors hover:text-ink"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="rounded-md bg-brand px-4 py-2 text-sm text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
                >
                  {changingPassword ? '提交中…' : '更改密码'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/** 额度数字位：加载中骨架、失败写明「读取失败」、成功才给数字。别再拿横杠一锅端。 */
function StatValue({
  loading,
  failed,
  children,
}: {
  loading: boolean;
  failed: boolean;
  children: React.ReactNode;
}) {
  return (
    <span className="text-2xl font-semibold tabular-nums text-ink">
      {loading ? (
        <Skeleton className="h-6 w-24" />
      ) : failed ? (
        <span className="text-xs font-normal text-ink-muted">读取失败</span>
      ) : (
        children
      )}
    </span>
  );
}
