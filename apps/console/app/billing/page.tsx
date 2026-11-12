'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usageApi, ApiError } from '@portal/api-client';
import type { UsageLog } from '@portal/types';
import {
  Badge,
  Button,
  Card,
  Segmented,
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
  TableLoading,
} from '@/components/data-state';
import { ensureMoneySettings, quotaToAmount, formatNumber, formatTime } from '@/lib/format';

/**
 * 消费记录 —— md 4.2 E
 *
 * 文档要求：消费时间、模型名称、Token 用量、输入 Token、输出 Token、
 * 消费金额、请求状态、关联请求标识。
 *
 * 请求状态为什么不在一张表里混排：官方把失败调用记成 type=5 的独立日志，
 * 和消费日志（type=2）不是同一批数据，分页也各算各的。混在一张表会打乱分页，
 * 所以做成「成功 / 失败」两个页签，两边都带状态列与请求编号。
 */
type Tab = 'success' | 'failed';

export default function BillingPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('success');
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [total, setTotal] = useState(0);
  const [otherTotal, setOtherTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const logType = tab === 'success' ? 2 : 5;
    const otherType = tab === 'success' ? 5 : 2;
    try {
      await ensureMoneySettings();
      const [data, other] = await Promise.all([
        usageApi.listUsageLogs({ page, page_size: pageSize, type: logType }),
        usageApi
          .listUsageLogs({ page: 1, page_size: 1, type: otherType })
          .catch(() => ({ total: 0 })),
      ]);
      setLogs(data.items ?? []);
      setTotal(data.total ?? 0);
      setOtherTotal(other.total ?? 0);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace('/login');
        return;
      }
      setError('数据加载失败，稍等片刻再试一次');
    } finally {
      setLoading(false);
    }
  }, [page, tab, router]);

  useEffect(() => {
    void load();
  }, [load]);

  // 换页签回第 1 页，否则会出现「第 3 页但只有 1 页数据」
  useEffect(() => {
    setPage(1);
  }, [tab]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const successCount = tab === 'success' ? total : otherTotal;
  const failedCount = tab === 'success' ? otherTotal : total;
  /** 读不到数就别在页签上摆一个 0，那会被当成「一次都没成功」 */
  const countsReady = !loading && !error;

  return (
    <div className="min-h-screen md:pl-56">
      <ConsoleSidebar />
      <ConsoleTopbar title="消费记录" />

      <PageContainer>
        {error && (
          <div className="mb-4">
            <ErrorBox message={error} onRetry={() => void load()} retrying={loading} />
          </div>
        )}

        <Card flush>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-card py-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-title font-semibold text-ink">调用明细</h2>
              <Segmented
                ariaLabel="切换成功与失败记录"
                value={tab}
                onChange={setTab}
                options={[
                  {
                    value: 'success',
                    label: '成功',
                    count: countsReady ? formatNumber(successCount) : undefined,
                  },
                  {
                    value: 'failed',
                    label: '失败',
                    count: countsReady ? formatNumber(failedCount) : undefined,
                  },
                ]}
              />
            </div>
            <span className="text-meta text-ink-muted">
              {loading
                ? '正在统计…'
                : error
                  ? '条数未知'
                  : `${tab === 'success' ? '每笔扣费都记一条' : '未扣费，悬停可看原因'} · 共 ${formatNumber(total)} 条`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-full text-left">
              <THead>
                <Th>时间</Th>
                <Th>状态</Th>
                <Th>模型</Th>
                <Th>密钥</Th>
                <Th>输入 / 输出</Th>
                <Th>费用</Th>
                <Th>请求编号</Th>
              </THead>
              <tbody>
                {loading ? (
                  <TableLoading colSpan={7} rows={5} />
                ) : error ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyHint
                        text="暂时读不到明细"
                        hint="可能是网络波动，稍等片刻再试一次"
                      />
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyHint
                        text={tab === 'success' ? '还没有消费记录' : '没有失败记录'}
                        hint={
                          tab === 'success'
                            ? '发起一次调用，这里会记下每一笔扣费'
                            : '这段时间的调用都成功了'
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const failed = tab === 'failed';
                    return (
                      <Tr key={log.id}>
                        <Td className="whitespace-nowrap text-ink-muted">
                          {formatTime(log.created_at)}
                        </Td>
                        <Td>
                          {/* 失败原因挂在标签上，扫表时不占列宽 */}
                          <span title={failed ? log.content : undefined}>
                            <Badge tone={failed ? 'danger' : 'success'}>
                              {failed ? '失败' : '成功'}
                            </Badge>
                          </span>
                        </Td>
                        <Td>{log.model_name || PLACEHOLDER_DASH}</Td>
                        <Td className="text-ink-mid">{log.token_name || PLACEHOLDER_DASH}</Td>
                        <Td className="whitespace-nowrap tabular-nums text-ink-mid">
                          {failed
                            ? PLACEHOLDER_DASH
                            : `${formatNumber(log.prompt_tokens)} / ${formatNumber(log.completion_tokens)}`}
                        </Td>
                        <Td className="whitespace-nowrap tabular-nums">
                          {/* 失败调用不扣费，这是事实而不是"没数据"，写出来比横杠有用 */}
                          {failed ? (
                            <span className="text-ink-muted">未扣费</span>
                          ) : (
                            quotaToAmount(log.quota)
                          )}
                        </Td>
                        <Td>
                          <TdSub>
                            <span className="font-mono">
                              {log.request_id || PLACEHOLDER_DASH}
                            </span>
                          </TdSub>
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-line px-card py-3 text-meta text-ink-muted">
              <span>
                第 {page} / {totalPages} 页，每页 {pageSize} 条
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  上一页
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </Card>
      </PageContainer>
    </div>
  );
}
