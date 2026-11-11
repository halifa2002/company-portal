'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, billingApi, ApiError } from '@portal/api-client';
import type { SelfUser } from '@portal/types';
import type { TopUpRecord } from '@portal/api-client';
import { ConsoleSidebar, ConsoleTopbar } from '@/components/console-chrome';
import { ensureMoneySettings, formatTime, quotaToAmount } from '@/lib/format';

/** 充值订单状态：官方按字符串返回，未知值原样显示，不假装懂 */
function topUpStatusLabel(status: string): { text: string; className: string } {
  switch (status) {
    case 'success':
      return { text: '已完成', className: 'text-ok' };
    case 'pending':
      return { text: '待支付', className: 'text-ink-muted' };
    case 'expired':
      return { text: '已过期', className: 'text-danger' };
    default:
      return { text: status || '未知', className: 'text-ink-muted' };
  }
}

/** 支付方式：兑换码在官方记录里是 balance，其余为通道名 */
function topUpMethodLabel(record: TopUpRecord): string {
  const method = record.payment_provider || record.payment_method;
  if (method === 'balance') return '兑换码';
  return method || '—';
}

/** 充值与余额 —— md 4.2 G（优先沿用官方充值能力） */
export default function WalletPage() {
  const router = useRouter();
  const [user, setUser] = useState<SelfUser | null>(null);
  const [topups, setTopups] = useState<TopUpRecord[]>([]);
  const [topupTotal, setTopupTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [code, setCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await ensureMoneySettings();
      const [me, records] = await Promise.all([
        authApi.getSelf(),
        billingApi.listMyTopUps({ page: 1, page_size: 20 }).catch(() => null),
      ]);
      setUser(me);
      setTopups(records?.items ?? []);
      setTopupTotal(records?.total ?? 0);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace('/login');
        return;
      }
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleRedeem(event: React.FormEvent) {
    event.preventDefault();
    if (!code.trim()) return;
    setRedeeming(true);
    setError('');
    setNotice('');
    try {
      await billingApi.redeemTopUpCode(code.trim());
      setCode('');
      setNotice('兑换成功，余额已更新');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '兑换失败');
    } finally {
      setRedeeming(false);
    }
  }

  return (
    <div className="min-h-screen md:pl-56">
      <ConsoleSidebar />
      <ConsoleTopbar title="充值" balance={user ? quotaToAmount(user.quota) : undefined} />

      <main className="px-6 py-6">
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

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-card border border-line bg-surface p-5">
            <div className="text-xs text-ink-muted">当前余额</div>
            <div className="mt-2 text-3xl font-semibold tabular-nums text-ink">
              {loading ? '…' : user ? quotaToAmount(user.quota) : '—'}
            </div>
          </div>
          <div className="rounded-card border border-line bg-surface p-5">
            <div className="text-xs text-ink-muted">累计已用</div>
            <div className="mt-2 text-3xl font-semibold tabular-nums text-ink">
              {loading ? '…' : user ? quotaToAmount(user.used_quota) : '—'}
            </div>
          </div>
          <div className="rounded-card border border-line bg-surface p-5">
            <div className="text-xs text-ink-muted">累计请求</div>
            <div className="mt-2 text-3xl font-semibold tabular-nums text-ink">
              {loading ? '…' : user ? user.request_count : '—'}
            </div>
          </div>
        </div>

        {/* 兑换码充值 */}
        <div className="mt-6 rounded-card border border-line bg-surface p-6">
          <h2 className="text-sm font-medium text-ink">使用兑换码充值</h2>
          <p className="mt-1.5 text-xs text-ink-muted">
            向管理员获取兑换码，输入后额度立即到账。
          </p>
          <form onSubmit={handleRedeem} className="mt-4 flex flex-wrap gap-3">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="输入兑换码"
              className="w-72 rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand"
            />
            <button
              type="submit"
              disabled={redeeming || !code.trim()}
              className="rounded-md bg-brand px-5 py-2 text-sm text-white disabled:opacity-50"
            >
              {redeeming ? '兑换中…' : '立即兑换'}
            </button>
          </form>
        </div>

        {/* 充值记录 —— 官方 /api/user/topup/self */}
        <div className="mt-6 rounded-card border border-line bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-ink">充值记录</h2>
            {topupTotal > 0 && (
              <span className="text-xs text-ink-muted">共 {topupTotal} 条</span>
            )}
          </div>
          <p className="mt-1.5 text-xs text-ink-muted">
            兑换码与在线支付都在这里留痕；未完成的订单不会入账。
          </p>

          {loading ? (
            <div className="mt-4 py-8 text-center text-xs text-ink-muted">加载中…</div>
          ) : topups.length === 0 ? (
            <div className="mt-4 py-8 text-center text-xs text-ink-muted">
              还没有充值记录
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead className="text-ink-muted">
                  <tr className="border-b border-line">
                    <th className="py-2.5 pr-4 font-normal">时间</th>
                    <th className="py-2.5 pr-4 font-normal">实付</th>
                    <th className="py-2.5 pr-4 font-normal">到账额度</th>
                    <th className="py-2.5 pr-4 font-normal">方式</th>
                    <th className="py-2.5 pr-4 font-normal">状态</th>
                    <th className="py-2.5 font-normal">订单号</th>
                  </tr>
                </thead>
                <tbody>
                  {topups.map((record) => {
                    const status = topUpStatusLabel(record.status);
                    return (
                      <tr key={record.id} className="border-b border-line/60 last:border-0">
                        <td className="py-3 pr-4 whitespace-nowrap text-ink-muted">
                          {formatTime(record.create_time)}
                        </td>
                        <td className="py-3 pr-4 whitespace-nowrap tabular-nums text-ink">
                          ¥{record.money}
                        </td>
                        <td className="py-3 pr-4 whitespace-nowrap tabular-nums text-ink">
                          {quotaToAmount(record.amount)}
                        </td>
                        <td className="py-3 pr-4 whitespace-nowrap text-ink-muted">
                          {topUpMethodLabel(record)}
                        </td>
                        <td className={`py-3 pr-4 whitespace-nowrap ${status.className}`}>
                          {status.text}
                        </td>
                        <td className="py-3 font-mono text-[11px] text-ink-muted">
                          {record.trade_no || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 在线支付说明 */}
        <div className="mt-6 rounded-card border border-line bg-surface-subtle p-6">
          <h2 className="text-sm font-medium text-ink">在线支付</h2>
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">
            官方后端内置多种支付通道（Epay / Stripe / Creem / Waffo 等），
            是否开启取决于管理员在后台的配置。开启后此页会出现对应支付入口；
            未开启时请使用上面的兑换码方式。
          </p>
        </div>
      </main>
    </div>
  );
}
