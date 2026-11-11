'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authApi, ApiError } from '@portal/api-client';
import { brand, siteUrl } from '@/lib/brand';

/**
 * 找回密码 —— 发重置邮件
 *
 * 官方链路（controller/misc.go）：
 *   GET /api/reset_password?email= → 后端生成验证码、往邮箱发一条带 token 的链接
 *   链接指向 {ServerAddress}/user/reset?email=..&token=..，所以控制台必须有 /user/reset
 *
 * 两个必须跟用户讲清楚的点：
 *   1. 无论邮箱存不存在，后端都回 success（防账号枚举），所以"已发送"不代表一定发到了；
 *   2. 管理员没配邮件服务时，后端只写日志、仍回 success —— 页面必须给出"联系管理员"的兜底。
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    const value = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      setError('请填写正确的邮箱地址');
      return;
    }
    setLoading(true);
    try {
      await authApi.sendPasswordResetEmail(value);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '发送失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white">
            {brand.initial}
          </span>
          <h1 className="mt-4 text-xl font-semibold text-ink">找回密码</h1>
          <p className="mt-1.5 text-xs text-ink-muted">
            填写注册时使用的邮箱，我们会发一条重置链接过去
          </p>
        </div>

        {sent ? (
          <div className="rounded-panel border border-line bg-surface p-6 shadow-[var(--shadow-card)]">
            <p className="text-sm font-medium text-ink">重置邮件已发出</p>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              请到 <span className="text-ink">{email.trim()}</span> 的收件箱里找一封标题含「密码重置」的邮件，
              点开里面的链接即可设置新密码。链接 10 分钟内有效。
            </p>
            <p className="mt-3 rounded-md bg-surface-subtle px-3 py-2 text-xs leading-relaxed text-ink-muted">
              没收到？先看垃圾邮件；还是没有，可能系统尚未开通邮件服务，
              请联系管理员在后台为你重置密码。
            </p>
            <div className="mt-5 flex items-center gap-2">
              <Link
                href="/login"
                className="flex-1 rounded-md bg-brand py-2 text-center text-sm font-medium text-white transition-colors hover:bg-brand-hover"
              >
                返回登录
              </Link>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="rounded-md border border-line px-3 py-2 text-xs text-ink-muted transition-colors hover:text-ink"
              >
                再发一次
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="rounded-panel border border-line bg-surface p-6 shadow-[var(--shadow-card)]"
          >
            <label className="block text-xs font-medium text-ink">
              邮箱
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-line px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-brand"
                placeholder="注册时填的邮箱"
              />
            </label>

            {error && (
              <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs text-danger">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-md bg-brand py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
            >
              {loading ? '发送中…' : '发送重置邮件'}
            </button>

            <p className="mt-4 text-center text-xs text-ink-muted">
              想起来了？
              <Link href="/login" className="ml-1 text-brand">
                返回登录
              </Link>
            </p>
          </form>
        )}

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
