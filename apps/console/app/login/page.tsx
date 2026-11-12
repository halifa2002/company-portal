'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, ApiError } from '@portal/api-client';
import { Button, Field, Input } from '@portal/ui';
import { AuthAlert, AuthShell } from '@/components/auth-shell';

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
    <AuthShell title="登录控制台" description="使用平台账号登录，管理密钥与用量">
      <form onSubmit={onSubmit} noValidate>
        <Field label="用户名" htmlFor="username">
          <Input
            id="username"
            type="text"
            required
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="请输入用户名"
            className="w-full"
          />
        </Field>

        <Field label="密码" htmlFor="password" className="mt-4">
          <Input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            className="w-full"
          />
        </Field>

        {cooldown > 0 ? (
          <AuthAlert tone="warn">请求太频繁，请等 {cooldownLabel} 后重试</AuthAlert>
        ) : (
          error && <AuthAlert>{error}</AuthAlert>
        )}

        <Button
          type="submit"
          loading={loading}
          loadingLabel="登录中…"
          disabled={cooldown > 0}
          className="mt-6 w-full"
        >
          {cooldown > 0 ? `${cooldownLabel}后可再试` : '登录'}
        </Button>

        <div className="mt-4 flex items-center justify-between text-note text-ink-muted">
          <Link href="/forgot-password" className="transition-colors hover:text-brand">
            忘记密码？
          </Link>
          <span>
            还没有账号？
            <Link href="/register" className="ml-1 font-medium text-brand hover:underline">
              立即注册
            </Link>
          </span>
        </div>
      </form>
    </AuthShell>
  );
}
