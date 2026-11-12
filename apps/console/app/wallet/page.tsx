'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, billingApi, ApiError } from '@portal/api-client';
import type { SelfUser } from '@portal/types';
import type { TopUpRecord } from '@portal/api-client';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Input,
  TableWrap,
  THead,
  Th,
  Tr,
  Td,
  TdSub,
} from '@portal/ui';
import { ConsoleSidebar, ConsoleTopbar } from '@/components/console-chrome';
import { PageContainer } from '@/components/page-shell';
import {
  EmptyHint,
  ErrorBox,
  PLACEHOLDER_DASH,
  Skeleton,
  TableLoading,
} from '@/components/data-state';
import { ensureMoneySettings, formatNumber, formatTime, moneyUnit, quotaToAmount } from '@/lib/format';

/** 充值订单状态：官方按字符串返回，未知值原样显示，不假装懂 */
function TopUpBadge({ status }: { status: string }) {
  switch (status) {
    case 'success':
      return <Badge tone="success">已完成</Badge>;
    case 'pending':
      return <Badge tone="warning">待支付</Badge>;
    case 'expired':
      return <Badge tone="neutral">已过期</Badge>;
    default:
      return <Badge tone="neutral">{status || '未知'}</Badge>;
  }
}

/** 支付方式：兑换码在官方记录里是 balance，其余为通道名 */
function topUpMethodLabel(record: TopUpRecord): string {
  const method = record.payment_provider || record.payment_method;
  if (method === 'balance') return '兑换码';
  return method || PLACEHOLDER_DASH;
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
  /** 拉数据失败，和「兑换码填错」这类操作失败分开——前者该带重试，后者不该 */
  const [loadFailed, setLoadFailed] = useState(false);
  /** 充值记录单独失败，不影响上面的余额数字 */
  const [recordsFailed, setRecordsFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setLoadFailed(false);
    setRecordsFailed(false);
    let recordsMissing = false;
    try {
      await ensureMoneySettings();
      const [me, records] = await Promise.all([
        authApi.getSelf(),
        billingApi
          .listMyTopUps({ page: 1, page_size: 20 })
          .catch(() => {
            // 记录拉不到不能连带把余额也判失败，单独记一笔
            recordsMissing = true;
            return null;
          }),
      ]);
      setUser(me);
      setTopups(records?.items ?? []);
      setTopupTotal(records?.total ?? 0);
      setRecordsFailed(recordsMissing);
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
      setError(err instanceof Error ? err.message : '兑换失败，检查一下兑换码');
    } finally {
      setRedeeming(false);
    }
  }

  /** 三张数字卡，与概览页同一套三层结构：标签 / 数字 / 口径 */
  const cards = [
    {
      label: '当前余额',
      value: user ? quotaToAmount(user.quota) : '',
      unit: moneyUnit(),
      foot: '充值后可用于调用',
      failed: !user,
    },
    {
      label: '累计已用',
      value: user ? quotaToAmount(user.used_quota) : '',
      unit: moneyUnit(),
      foot: '开户至今累计',
      failed: !user,
    },
    {
      label: '累计请求',
      value: user ? formatNumber(user.request_count) : '',
      unit: '次',
      foot: '开户至今累计',
      failed: !user,
    },
  ];

  return (
    <div className="min-h-screen md:pl-56">
      <ConsoleSidebar />
      <ConsoleTopbar title="充值" balance={user ? quotaToAmount(user.quota) : undefined} />

      <PageContainer>
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

        <div className="grid gap-4 sm:grid-cols-3">
          {cards.map((item) => (
            <Card key={item.label}>
              <div className="text-meta text-ink-muted">{item.label}</div>
              <div className="mt-1 flex h-8 items-center">
                {loading ? (
                  <Skeleton className="h-6 w-24" />
                ) : item.failed ? (
                  <span className="text-meta text-ink-muted" title="暂时没读到，稍后重试一下">
                    暂时没读到
                  </span>
                ) : (
                  <>
                    <span className="truncate text-display font-semibold tabular-nums text-ink">
                      {item.value}
                    </span>
                    <span className="ml-1 shrink-0 text-meta text-ink-muted">{item.unit}</span>
                  </>
                )}
              </div>
              <div className="mt-1 text-meta text-ink-muted">{item.foot}</div>
            </Card>
          ))}
        </div>

        <Card className="mt-4">
          <CardHeader title="使用兑换码充值" />
          <form onSubmit={handleRedeem} className="flex flex-wrap items-start gap-3">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="输入兑换码"
              aria-label="兑换码"
              className="w-72"
            />
            <Button type="submit" loading={redeeming} disabled={!code.trim()}>
              {redeeming ? '兑换中…' : '立即兑换'}
            </Button>
          </form>
        </Card>

        <div className="mt-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-title font-semibold text-ink">充值记录</h2>
            <span className="text-meta text-ink-muted">
              {loading
                ? '正在统计…'
                : recordsFailed
                  ? '条数未知'
                  : `共 ${formatNumber(topupTotal)} 条`}
            </span>
          </div>

          <TableWrap>
            <THead>
              <Th>时间</Th>
              <Th>实付</Th>
              <Th>到账额度</Th>
              <Th>方式</Th>
              <Th>状态</Th>
              <Th>订单号</Th>
            </THead>
            <tbody>
              {loading ? (
                <TableLoading colSpan={6} rows={4} />
              ) : recordsFailed ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyHint
                      text="暂时读不到充值记录"
                      hint="可能是网络波动，稍等片刻再试一次"
                    />
                  </td>
                </tr>
              ) : topups.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyHint
                      text="还没有充值记录"
                      hint="兑换成功后，记录会出现在这里"
                    />
                  </td>
                </tr>
              ) : (
                topups.map((record) => (
                  <Tr key={record.id}>
                    <Td className="whitespace-nowrap text-ink-muted">
                      {formatTime(record.create_time)}
                    </Td>
                    <Td className="whitespace-nowrap tabular-nums">
                      ¥{record.money}
                    </Td>
                    <Td className="whitespace-nowrap tabular-nums">
                      {quotaToAmount(record.amount)}
                    </Td>
                    <Td className="whitespace-nowrap text-ink-mid">{topUpMethodLabel(record)}</Td>
                    <Td>
                      <TopUpBadge status={record.status} />
                    </Td>
                    <Td>
                      <TdSub>
                        <span className="font-mono">
                          {record.trade_no || PLACEHOLDER_DASH}
                        </span>
                      </TdSub>
                    </Td>
                  </Tr>
                ))
              )}
            </tbody>
          </TableWrap>
        </div>
      </PageContainer>
    </div>
  );
}
