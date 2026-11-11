'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { authApi, ApiError } from '@portal/api-client';
import { brand, siteUrl } from '@/lib/brand';

/**
 * 重置密码落地页 —— 路径必须是 /user/reset
 *
 * 官方发出的邮件链接是 {ServerAddress}/user/reset?email=..&token=..
 * 路径对不上就是 404，所以这里不能改成 /reset 之类的短路径。
 *
 * 官方行为（controller/misc.go ResetPassword）：不是让用户填新密码，
 * 而是生成一个随机密码直接返回在 data 里 —— 页面必须显眼地展示，并提示登录后立刻改掉。
 */
/**
 * 官方后端返回的是英文文案（官方前端自己翻译，我们得自己映射），
 * 这几种是重置流程里真正会出现的，别的原样显示、不假装认识。
 */
function resetErrorMessage(error: unknown): string {
  const raw = error instanceof ApiError ? error.message : '';
  if (raw.includes('invalid or has expired')) {
    return '链接已失效或已被使用过，请重新申请一条重置链接。';
  }
  if (raw.includes('Invalid parameters')) {
    return '链接不完整，请从邮件里的完整链接进入。';
  }
  return raw || '重置失败，请稍后重试。';
}

function ResetForm() {
  const params = useSearchParams();
  const email = params.get('email') ?? '';
  const token = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const missingParams = !email || !token;

  useEffect(() => {
    if (missingParams) {
      setError('链接不完整，请重新在找回密码页申请一次');
    }
  }, [missingParams]);

  async function onReset() {
    setError('');
    setLoading(true);
    try {
      const value = await authApi.resetPassword({ email, token });
      setPassword(value);
    } catch (err) {
      setError(resetErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('复制失败，请手动选中密码复制');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white">
            {brand.initial}
          </span>
          <h1 className="mt-4 text-xl font-semibold text-ink">重置密码</h1>
          <p className="mt-1.5 text-xs text-ink-muted">
            {email ? `账号邮箱：${email}` : '请从邮件里的链接进入本页'}
          </p>
        </div>

        <div className="rounded-panel border border-line bg-surface p-6 shadow-[var(--shadow-card)]">
          {password ? (
            <>
              <p className="text-sm font-medium text-ink">新密码已生成</p>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                这是系统生成的一次性密码，请立刻复制保存；登录后请到账户设置里改成自己的密码。
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-md border border-line bg-surface-subtle px-3 py-3">
                <code className="flex-1 select-all break-all font-mono text-sm text-ink">
                  {password}
                </code>
                <button
                  type="button"
                  onClick={() => void onCopy()}
                  className="shrink-0 rounded border border-line bg-surface px-2 py-1 text-[11px] text-ink-muted transition-colors hover:border-brand hover:text-brand"
                >
                  {copied ? '已复制' : '复制'}
                </button>
              </div>
              <Link
                href="/login"
                className="mt-5 block rounded-md bg-brand py-2 text-center text-sm font-medium text-white transition-colors hover:bg-brand-hover"
              >
                去登录
              </Link>
            </>
          ) : (
            <>
              <p className="text-xs leading-relaxed text-ink-muted">
                点下面的按钮完成验证，系统会为你生成一个新密码。
                重置成功后当前链接立即失效。
              </p>

              {error && (
                <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs text-danger">{error}</p>
              )}

              <button
                type="button"
                disabled={loading || missingParams}
                onClick={() => void onReset()}
                className="mt-5 w-full rounded-md bg-brand py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
              >
                {loading ? '处理中…' : '生成新密码'}
              </button>

              <p className="mt-4 text-center text-xs text-ink-muted">
                <Link href="/forgot-password" className="text-brand">
                  重新申请重置链接
                </Link>
              </p>
            </>
          )}
        </div>

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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center px-6 text-xs text-ink-muted">
          加载中…
        </div>
      }
    >
      <ResetForm />
    </Suspense>
  );
}
