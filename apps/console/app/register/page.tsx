'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, ApiError } from '@portal/api-client';
import { Button, Field, Input } from '@portal/ui';
import { AuthAlert, AuthShell } from '@/components/auth-shell';
import { siteUrl } from '@/lib/brand';

/**
 * 注册页 —— md 第十章 Phase 2 第 1 步
 *
 * 后端当前状态（实测 /api/status）：
 *   register_enabled = true、password_register_enabled = true、email_verification = false
 * 所以只需要用户名 + 密码；若管理员日后开启邮箱验证，这里要补邮箱与验证码字段。
 */
export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    if (password !== password2) {
      setError('两次输入的密码不一致');
      return;
    }
    if (username.trim().length > 20) {
      setError('用户名最多 20 个字符');
      return;
    }
    if (password.length < 8) {
      setError('密码至少 8 位');
      return;
    }
    if (!agreed) {
      setError('请先阅读并勾选同意服务条款与隐私政策');
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        username: username.trim(),
        password,
        password2,
      });
      // 注册成功后直接登录，省掉再输一次
      await authApi.login({ username: username.trim(), password });
      router.replace('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="创建账号" description="注册后即可创建 API 密钥、查看用量与账单">
      <form onSubmit={onSubmit} noValidate>
        <Field label="用户名" htmlFor="username" hint="用于登录，注册后不可修改">
          <Input
            id="username"
            type="text"
            required
            autoComplete="username"
            autoFocus
            maxLength={20}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="请输入用户名"
            className="w-full"
          />
        </Field>

        <Field label="密码" htmlFor="password" hint="至少 8 位" className="mt-4">
          <Input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            className="w-full"
          />
        </Field>

        <Field label="确认密码" htmlFor="password2" className="mt-4">
          <Input
            id="password2"
            type="password"
            required
            autoComplete="new-password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            placeholder="再输入一次"
            className="w-full"
          />
        </Field>

        {/*
          2026-11-16：加协议勾选。此前注册页没有任何协议确认，
          后台 user_agreement_enabled / privacy_policy_enabled 又都是关的，
          等于对外服务时既没提示也没依据。勾选框走前端强校验，
          两个链接指向官网的正式页面（新窗口打开，别把用户带离注册流程）。
        */}
        <label className="mt-5 flex cursor-pointer items-start gap-2 text-note leading-normal text-ink-muted">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[var(--brand-primary)]"
          />
          <span>
            我已阅读并同意
            <a
              href={`${siteUrl}/terms`}
              target="_blank"
              rel="noreferrer"
              className="mx-1 text-brand hover:underline"
            >
              《服务条款》
            </a>
            与
            <a
              href={`${siteUrl}/privacy`}
              target="_blank"
              rel="noreferrer"
              className="ml-1 text-brand hover:underline"
            >
              《隐私政策》
            </a>
          </span>
        </label>

        {error && <AuthAlert>{error}</AuthAlert>}

        <Button
          type="submit"
          loading={loading}
          loadingLabel="注册中…"
          className="mt-6 w-full"
        >
          注册并登录
        </Button>

        <p className="mt-4 text-center text-note text-ink-muted">
          已有账号？
          <Link href="/login" className="ml-1 font-medium text-brand hover:underline">
            直接登录
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
