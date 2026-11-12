'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, accountApi, ApiError } from '@portal/api-client';
import type { SelfUser } from '@portal/types';
import type { LoginSession } from '@portal/api-client';
import { Badge, Button, Card, ConfirmDialog, Input, Modal } from '@portal/ui';
import { ConsoleSidebar, ConsoleTopbar } from '@/components/console-chrome';
import {
  BlockLoading,
  DataValue,
  EmptyHint,
  ErrorBox,
  PLACEHOLDER_DASH,
  Skeleton,
} from '@/components/data-state';
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
 *
 * 2026-11-12：样式统一到 @portal/ui。之前这页是全站唯一没换零件的页面，
 * 手写的输入框圆角 6、按钮 8，跟别的页摆一起差一眼就能看出来。
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
  const [revokingAll, setRevokingAll] = useState(false);
  /** 待确认退出的设备；null 表示没弹窗 */
  const [revokeTarget, setRevokeTarget] = useState<LoginSession | null>(null);
  const [revokeAllOpen, setRevokeAllOpen] = useState(false);
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
      setError('数据加载失败，稍等片刻再试一次');
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

  function openPwdDialog() {
    setError('');
    setNotice('');
    setPwdOpen(true);
  }

  function closePwdDialog() {
    setPwdOpen(false);
    setOldPassword('');
    setNewPassword('');
    setNewPassword2('');
    setShowPwd({ old: false, next: false, again: false });
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
      closePwdDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : '修改密码失败');
    } finally {
      setChangingPassword(false);
    }
  }

  /** 真正退出某台设备。确认这一步交给 ConfirmDialog，不再用浏览器原生弹窗 */
  async function doRevoke(session: LoginSession) {
    setRevoking(session.sid);
    try {
      await accountApi.revokeSession(session.sid);
      if (session.current) {
        router.replace('/login');
        return;
      }
      setRevokeTarget(null);
      setNotice('该设备已退出');
      await load();
    } catch (err) {
      // 关掉弹窗再报错：错误条在页面上，弹窗盖着看不见
      setRevokeTarget(null);
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setRevoking(null);
    }
  }

  async function doRevokeOthers() {
    setRevokingAll(true);
    try {
      await accountApi.revokeOtherSessions();
      setRevokeAllOpen(false);
      setNotice('其他设备已退出');
      await load();
    } catch (err) {
      setRevokeAllOpen(false);
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setRevokingAll(false);
    }
  }

  return (
    <div className="min-h-screen md:pl-56">
      <ConsoleSidebar />
      <ConsoleTopbar title="账户设置" />

      <main className="px-page pb-8 pt-0">
        {error && (
          <div className="mb-4">
            {loadFailed ? (
              <ErrorBox message={error} onRetry={() => void load()} retrying={loading} />
            ) : (
              <p className="rounded-control border border-danger/25 bg-danger-soft px-3.5 py-2.5 text-note text-danger-text">
                {error}
              </p>
            )}
          </div>
        )}
        {notice && (
          <p className="mb-4 rounded-control border border-ok/25 bg-ok-soft px-3.5 py-2.5 text-note text-ok-text">
            {notice}
          </p>
        )}

        <div className="grid gap-4 xl:grid-cols-3">
          {/* 左栏：账号 / 额度 / 安全 */}
          <div className="space-y-4 xl:col-span-2">
            {/* 账号卡 */}
            <Card>
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand text-heading font-semibold text-white">
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
                    <h2 className="text-heading font-semibold text-ink">
                      {loading ? (
                        <Skeleton className="h-5 w-28" />
                      ) : loadFailed ? (
                        <span className="text-note font-normal text-ink-muted">暂时没读到</span>
                      ) : (
                        user?.display_name || user?.username || PLACEHOLDER_DASH
                      )}
                    </h2>
                    {roleLabel && (
                      <Badge tone="brand" withDot={false}>
                        {roleLabel}
                      </Badge>
                    )}
                    {/* 读不到账号信息时不能显示「标准档」——那是编的，groupLabel 会把空值默认成标准档 */}
                    {user && (
                      <span title="档位由管理员分配，无法自行修改">
                        <Badge tone="neutral" withDot={false}>
                          计费档位 {groupLabel(user.group)}
                        </Badge>
                      </span>
                    )}
                    {/* 文档 4.2 F 的「账户状态」：后端 1=启用 2=禁用 */}
                    {user && (
                      <Badge tone={user.status === 1 ? 'success' : 'danger'}>
                        {user.status === 1 ? '账号正常' : '账号已禁用'}
                      </Badge>
                    )}
                  </div>

                  <p className="mt-1.5 text-note text-ink-muted">
                    {loading ? (
                      <Skeleton className="h-3.5 w-20" />
                    ) : loadFailed ? (
                      '暂时没读到'
                    ) : user?.username ? (
                      `@${user.username}`
                    ) : (
                      PLACEHOLDER_DASH
                    )}
                  </p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-meta text-ink-mid">
                    <span className="inline-flex items-center gap-1">
                      邮箱
                      {loading ? (
                        <Skeleton className="h-3 w-16" />
                      ) : loadFailed ? (
                        '暂时没读到'
                      ) : (
                        <span className="text-ink">{user?.email || '未绑定'}</span>
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      用户 ID
                      {loading ? (
                        <Skeleton className="h-3 w-10" />
                      ) : loadFailed ? (
                        '暂时没读到'
                      ) : (
                        <span className="tabular-nums text-ink">
                          {user?.id ?? PLACEHOLDER_DASH}
                        </span>
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      余额
                      {loading ? (
                        <Skeleton className="h-3 w-16" />
                      ) : loadFailed ? (
                        '暂时没读到'
                      ) : user ? (
                        <span className="tabular-nums text-ink">
                          {quotaToAmount(user.quota)} {moneyUnit()}
                        </span>
                      ) : (
                        PLACEHOLDER_DASH
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleSave}
                className="mt-5 border-t border-line pt-4"
              >
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label htmlFor="display-name" className="block text-note font-medium text-ink">
                      显示名称
                    </label>
                    <Input
                      id="display-name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="输入显示名称"
                      className="mt-1.5 w-64"
                    />
                  </div>
                  <Button type="submit" variant="secondary" loading={saving} loadingLabel="保存中…">
                    保存
                  </Button>
                </div>
                <p className="mt-1.5 text-meta text-ink-muted">只改展示用的名字，登录用户名不变</p>
              </form>
            </Card>

            {/* 额度概览 */}
            <Card flush>
              <div className="flex items-center justify-between gap-3 border-b border-line px-card py-3">
                <h2 className="text-title font-semibold text-ink">额度与用量</h2>
                <div className="flex items-center gap-4 text-note">
                  <Link href="/wallet" className="text-ink-mid transition-colors hover:text-brand">
                    去充值
                  </Link>
                  <Link href="/billing" className="text-ink-mid transition-colors hover:text-brand">
                    消费记录
                  </Link>
                </div>
              </div>
              <div className="grid gap-4 px-card py-card sm:grid-cols-3">
                <div>
                  <div className="text-meta text-ink-muted">可用余额</div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <DataValue loading={loading} failed={loadFailed} width="w-24">
                      {user ? quotaToAmount(user.quota) : PLACEHOLDER_DASH}
                    </DataValue>
                    <span className="text-meta text-ink-muted">{moneyUnit()}</span>
                  </div>
                </div>
                <div>
                  <div className="text-meta text-ink-muted">已用额度</div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <DataValue loading={loading} failed={loadFailed} width="w-24">
                      {user ? quotaToAmount(user.used_quota) : PLACEHOLDER_DASH}
                    </DataValue>
                    <span className="text-meta text-ink-muted">{moneyUnit()}</span>
                  </div>
                </div>
                <div>
                  <div className="text-meta text-ink-muted">总调用次数</div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <DataValue loading={loading} failed={loadFailed} width="w-20">
                      {user ? formatNumber(user.request_count) : PLACEHOLDER_DASH}
                    </DataValue>
                    <span className="text-meta text-ink-muted">次</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* 登录与认证 —— 改密码不常驻表单，只留一行入口，点开走弹窗 */}
            <Card>
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-ink-mid">
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
                    <div className="text-body font-medium text-ink">更改密码</div>
                    <div className="mt-0.5 text-meta text-ink-muted">定期更换更安全</div>
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={openPwdDialog}>
                  更改密码
                </Button>
              </div>
            </Card>
          </div>

          {/* 右栏：登录设备 */}
          <Card flush className="h-fit">
            <div className="border-b border-line px-card py-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-title font-semibold text-ink">登录设备</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRevokeAllOpen(true)}
                  className="text-danger-text hover:bg-danger-soft"
                  disabled={sessions.length === 0}
                >
                  全部退出登录
                </Button>
              </div>
              <p className="mt-0.5 text-meta text-ink-muted">
                {loading
                  ? '正在读取…'
                  : loadFailed || sessionsFailed
                    ? '暂时读不到设备数'
                    : `共 ${sessions.length} 台在用，可逐个退出`}
              </p>
            </div>

            <div className="divide-y divide-line">
              {loading ? (
                <div className="px-card py-card">
                  <BlockLoading lines={2} />
                </div>
              ) : loadFailed || sessionsFailed ? (
                <EmptyHint
                  text="暂时读不到登录记录"
                  hint="可能是网络波动，稍等片刻再试一次"
                />
              ) : sessions.length === 0 ? (
                <EmptyHint text="没有其他登录记录" hint="在其他设备登录后，会显示在这里" />
              ) : (
                sessions.map((session) => (
                  <div key={session.sid} className="flex items-start justify-between gap-3 px-card py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-body text-ink">
                          {describeAgent(session.user_agent)}
                        </span>
                        {session.current && (
                          <Badge tone="brand" withDot={false}>
                            当前
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1.5 text-meta text-ink-mid">
                        {session.ip === '::1' || session.ip === '127.0.0.1'
                          ? '本机'
                          : session.ip || '未知 IP'}
                        {session.login_method
                          ? ` · ${session.login_method === 'password' ? '密码登录' : session.login_method}`
                          : ''}
                      </div>
                      <div className="mt-1 text-meta text-ink-muted">
                        最近活跃 {formatTime(session.last_active_at ?? session.created_at)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRevokeTarget(session)}
                      loading={revoking === session.sid}
                      loadingLabel="退出中"
                      className="shrink-0 text-ink-muted hover:bg-danger-soft hover:text-danger-text"
                    >
                      退出
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </main>

      {/* 更改密码弹窗 —— 常见的「点按钮弹窗改密码」做法，页面上不留常驻表单 */}
      <Modal
        open={pwdOpen}
        onClose={closePwdDialog}
        busy={changingPassword}
        width="md"
        title="更改密码"
        description={`更新账户密码：${user?.email || user?.username || '当前账号'}`}
        footer={
          <>
            <Button variant="secondary" onClick={closePwdDialog} disabled={changingPassword}>
              取消
            </Button>
            <Button
              type="submit"
              form="change-password-form"
              loading={changingPassword}
              loadingLabel="提交中…"
            >
              更改密码
            </Button>
          </>
        }
      >
        <form id="change-password-form" onSubmit={handleChangePassword} className="space-y-4">
          <PwdField
            id="pwd-old"
            label="当前密码"
            autoComplete="current-password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            reveal={showPwd.old}
            onToggleReveal={() => setShowPwd((s) => ({ ...s, old: !s.old }))}
          />
          <PwdField
            id="pwd-new"
            label="新密码"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            reveal={showPwd.next}
            onToggleReveal={() => setShowPwd((s) => ({ ...s, next: !s.next }))}
            hint="使用 8 位以上字符；改完后其他设备需重新登录。"
          />
          <PwdField
            id="pwd-new2"
            label="确认新密码"
            autoComplete="new-password"
            value={newPassword2}
            onChange={(e) => setNewPassword2(e.target.value)}
            reveal={showPwd.again}
            onToggleReveal={() => setShowPwd((s) => ({ ...s, again: !s.again }))}
          />

          {error && (
            <p className="rounded-control bg-danger-soft px-3 py-2 text-meta text-danger-text">
              {error}
            </p>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(revokeTarget)}
        title={revokeTarget?.current ? '退出当前设备？' : '让这台设备退出登录？'}
        description={revokeTarget ? describeAgent(revokeTarget.user_agent) : undefined}
        detail={
          revokeTarget?.current
            ? '退出后会立刻回到登录页，需要重新输入账号和密码。'
            : '退出后，这台设备需要重新登录才能继续使用。'
        }
        confirmLabel="退出登录"
        loading={Boolean(revoking)}
        onConfirm={() => {
          if (revokeTarget) void doRevoke(revokeTarget);
        }}
        onCancel={() => setRevokeTarget(null)}
      />

      <ConfirmDialog
        open={revokeAllOpen}
        title="让其他设备退出登录？"
        detail="除当前设备外，其他所有已登录的设备都会立刻失效，需要重新登录。"
        confirmLabel="全部退出"
        loading={revokingAll}
        onConfirm={() => void doRevokeOthers()}
        onCancel={() => setRevokeAllOpen(false)}
      />
    </div>
  );
}

/** 密码输入：右侧一个眼睛，点一下切换明文。三个框长得一样，抽出来省得改三遍 */
function PwdField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  hint,
  reveal,
  onToggleReveal,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete: string;
  hint?: string;
  reveal: boolean;
  onToggleReveal: () => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-note font-medium text-ink">
        {label}
      </label>
      <div className="relative mt-1.5">
        <Input
          id={id}
          type={reveal ? 'text' : 'password'}
          required
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          className="w-full pr-10"
        />
        <button
          type="button"
          aria-label={reveal ? '隐藏密码' : '显示密码'}
          onClick={onToggleReveal}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-ink-muted transition-colors hover:text-ink"
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
      </div>
      {hint && <p className="mt-1.5 text-meta text-ink-muted">{hint}</p>}
    </div>
  );
}
