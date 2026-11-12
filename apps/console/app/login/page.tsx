'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, ApiError } from '@portal/api-client';
import { brand, siteUrl } from '@/lib/brand';

/** 登录页 —— md 第十章 Phase 2 第 1 步 */
export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  /**
   * 被后端限流后还要等多少秒。
   * 后端对登录接口的限流不是「十几秒」，被连点几次会锁十几分钟（retry-after 728 秒）。
   * 倒计时期间锁住按钮：不然用户一直点，每次违规都把等待时间重新顶满，越点越出不去。
   */
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((left) => left - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (cooldown > 0) return;
    setError('');
    setLoading(true);
    try {
      await authApi.login({ username, password });
      router.replace('/');
    } catch (err) {
      if (err instanceof ApiError && err.status === 429 && err.retryAfter) {
        // 等待提示改由倒计时自己渲染：归零时它自动消失，
        // 不会出现「按钮已经能点、红字还挂着请等 12 分钟」。
        setCooldown(err.retryAfter);
        setError('');
      } else {
        setError(err instanceof ApiError ? err.message : '登录失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  }

  const cooldownLabel =
    cooldown >= 60
      ? `${Math.floor(cooldown / 60)} 分 ${cooldown % 60} 秒`
      : `${cooldown} 秒`;

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* 头部：Logo + 标题 */}
        <div className="mb-6 text-center">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white">
            {brand.initial}
          </span>
          <h1 className="mt-4 text-xl font-semibold text-ink">登录控制台</h1>
          <p className="mt-1.5 text-xs text-ink-muted">
            使用平台账号登录，管理密钥与用量
          </p>
        </div>

        {/* 登录表单 */}
        <form
          onSubmit={onSubmit}
          className="rounded-panel border border-line bg-surface p-6 shadow-[var(--shadow-card)]"
        >
          <label className="block text-xs font-medium text-ink">
            用户名
            <input
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-line px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-brand"
              placeholder="请输入用户名"
            />
          </label>

          <label className="mt-4 block text-xs font-medium text-ink">
            密码
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-line px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-brand"
              placeholder="请输入密码"
            />
          </label>

          {cooldown > 0 ? (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs text-danger">
              请求太频繁，请等 {cooldownLabel} 后重试
            </p>
          ) : (
            error && (
              <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs text-danger">
                {error}
              </p>
            )
          )}

          <button
            type="submit"
            disabled={loading || cooldown > 0}
            className="mt-6 w-full rounded-md bg-brand py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
          >
            {cooldown > 0
              ? `${cooldownLabel}后可再试`
              : loading
                ? '登录中…'
                : '登录'}
          </button>

          <div className="mt-4 flex items-center justify-between text-xs text-ink-muted">
            <Link href="/forgot-password" className="text-brand">
              忘记密码？
            </Link>
            <span>
              还没有账号？
              <Link href="/register" className="ml-1 text-brand">
                立即注册
              </Link>
            </span>
          </div>
        </form>

        {/* 返回官网：放在表单下面，不抢主按钮视线 */}
        <p className="mt-4 text-center">
          <a
            href={siteUrl}
            className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-4 py-2 text-xs text-ink-muted transition-colors hover:border-brand hover:text-brand"
          >
            ← 返回官网
          </a>
        </p>
      </div>
    </div>
  );
}
