'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usageApi, ApiError } from '@portal/api-client';
import type { UsageLog, UsageStat } from '@portal/types';
import {
  Button,
  Card,
  Segmented,
  THead,
  Th,
  Tr,
  Td,
} from '@portal/ui';
import type { SegmentedOption } from '@portal/ui';
import { ConsoleSidebar, ConsoleTopbar } from '@/components/console-chrome';
import { PageContainer } from '@/components/page-shell';
import {
  BlockLoading,
  EmptyHint,
  ErrorBox,
  PLACEHOLDER_DASH,
  Skeleton,
  TableLoading,
} from '@/components/data-state';
import { ensureMoneySettings, formatNumber, formatTime, moneyUnit, quotaToAmount } from '@/lib/format';

/**
 * 用量统计 —— md 4.2 D
 *
 * 覆盖要求：每日调用量 / 每日 Token / 每日消费 / 模型维度 / API Key 维度 / 调用明细。
 *
 * 关于分组统计的说明：官方后端没有"按模型/按密钥汇总"的接口（341 条路由里只有
 * /api/log/self 列表与 /api/log/self/stat 总额）。按 md 第六章"优先沿用官方接口、
 * 不轻易改后端"，这里改为从列表接口拉一批记录在前端聚合。
 * 因此分组结果的准确性受 STAT_LIMIT 限制，界面上要如实标注，不能假装是全量。
 */

const STAT_LIMIT = 500;

type RangeKey = 'today' | '7d' | '30d' | 'all';
type GroupKey = 'model' | 'token';
type TrendKey = 'quota' | 'calls' | 'tokens';

const RANGE_LABEL: Record<RangeKey, string> = {
  today: '今天',
  '7d': '近 7 天',
  '30d': '近 30 天',
  all: '全部',
};

const RANGE_OPTIONS: SegmentedOption<RangeKey>[] = (
  ['today', '7d', '30d', 'all'] as RangeKey[]
).map((key) => ({ value: key, label: RANGE_LABEL[key] }));

const TREND_OPTIONS: SegmentedOption<TrendKey>[] = [
  { value: 'quota', label: '消费' },
  { value: 'calls', label: '调用次数' },
  { value: 'tokens', label: 'Token' },
];

const GROUP_OPTIONS: SegmentedOption<GroupKey>[] = [
  { value: 'model', label: '按模型' },
  { value: 'token', label: '按密钥' },
];

/** 把范围算成秒级时间戳；all 不设边界 */
function rangeToTimestamps(range: RangeKey): {
  start_timestamp?: number;
  end_timestamp?: number;
} {
  if (range === 'all') return {};
  const now = Math.floor(Date.now() / 1000);
  if (range === 'today') {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return { start_timestamp: Math.floor(d.getTime() / 1000), end_timestamp: now };
  }
  const days = range === '7d' ? 7 : 30;
  return { start_timestamp: now - days * 86400, end_timestamp: now };
}

interface AggRow {
  name: string;
  count: number;
  promptTokens: number;
  completionTokens: number;
  quota: number;
}

function aggregate(logs: UsageLog[], by: GroupKey): AggRow[] {
  const map = new Map<string, AggRow>();
  for (const log of logs) {
    const name =
      by === 'model'
        ? log.model_name || '未知模型'
        : log.token_name || '未知密钥';
    const row =
      map.get(name) ??
      ({ name, count: 0, promptTokens: 0, completionTokens: 0, quota: 0 } as AggRow);
    row.count += 1;
    row.promptTokens += Number(log.prompt_tokens ?? 0);
    row.completionTokens += Number(log.completion_tokens ?? 0);
    row.quota += Number(log.quota ?? 0);
    map.set(name, row);
  }
  return [...map.values()].sort((a, b) => b.quota - a.quota);
}

export default function UsagePage() {
  const router = useRouter();
  const [range, setRange] = useState<RangeKey>('7d');
  const [groupBy, setGroupBy] = useState<GroupKey>('model');
  const [stat, setStat] = useState<UsageStat | null>(null);
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [statLogs, setStatLogs] = useState<UsageLog[]>([]);
  const [statTruncated, setStatTruncated] = useState(false);
  const [total, setTotal] = useState(0);
  /**
   * 区间内失败请求数（日志 type=5），用来算成功率。
   * null = 这个数这次没取到。此时成功率不能算：分母少一块，
   * 一次接口失败就会把成功率算成「100%」——比不显示更糟。
   */
  const [failedCalls, setFailedCalls] = useState<number | null>(null);
  const [trendMetric, setTrendMetric] = useState<TrendKey>('quota');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  /**
   * 汇总和明细是两次独立请求，各自可能失败。
   * 失败必须单独记一笔——否则失败后 stat 为 null、logs 为空，
   * 页面会理直气壮地显示「这段时间没有调用记录」，把故障说成事实。
   */
  const [statFailed, setStatFailed] = useState(false);
  const [logsFailed, setLogsFailed] = useState(false);
  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setStatFailed(false);
    setLogsFailed(false);
    const ts = rangeToTimestamps(range);
    let statsMissing = false;
    let logsMissing = false;
    let failedMissing = false;
    try {
      await ensureMoneySettings();
      const [s, l, batch, failed] = await Promise.all([
        // 汇总 / 趋势 / 分布都算"统计类数据"，任一处没拿到就一起标失败
        usageApi.getUsageStat({ type: 2, ...ts }).catch(() => {
          statsMissing = true;
          return null;
        }),
        usageApi.listUsageLogs({ page, page_size: pageSize, type: 2, ...ts }).catch(() => {
          logsMissing = true;
          return { items: [] as UsageLog[], total: 0 };
        }),
        usageApi
          .listUsageLogs({ page: 1, page_size: STAT_LIMIT, type: 2, ...ts })
          .catch(() => {
            statsMissing = true;
            return { items: [] as UsageLog[], total: 0 };
          }),
        // 失败调用记在 type=5 的日志里，只要总数，page_size 取 1 最省
        usageApi
          .listUsageLogs({ page: 1, page_size: 1, type: 5, ...ts })
          .catch(() => {
            failedMissing = true;
            return { total: 0 };
          }),
      ]);
      setStat(s);
      setStatFailed(statsMissing);
      setLogsFailed(logsMissing);
      setLogs(l.items ?? []);
      setTotal(l.total ?? 0);
      setFailedCalls(failedMissing ? null : Number(failed.total ?? 0));
      const batchItems = batch.items ?? [];
      setStatLogs(batchItems);
      setStatTruncated((batch.total ?? 0) > batchItems.length);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace('/login');
        return;
      }
      setError('数据加载失败，稍等片刻再试一次');
    } finally {
      setLoading(false);
    }
  }, [page, range, router]);

  useEffect(() => {
    void load();
  }, [load]);

  // 换筛选条件时回到第 1 页，否则会出现"第 3 页但只有 1 页数据"的空表
  useEffect(() => {
    setPage(1);
  }, [range]);

  const agg = useMemo(() => aggregate(statLogs, groupBy), [statLogs, groupBy]);
  const aggMax = agg.length > 0 ? agg[0].quota : 0;
  const totalCalls = statLogs.length;
  const totalTokens = statLogs.reduce(
    (acc, log) => acc + Number(log.prompt_tokens ?? 0) + Number(log.completion_tokens ?? 0),
    0,
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  /**
   * 每日趋势：把明细分按本地日期归组。
   * 官方没有按天聚合的接口，明细又最多取 500 条，所以这一块的口径写死在标题上，
   * 不让它看起来像全量统计。
   */
  const daily = useMemo(() => {
    const map = new Map<
      number,
      { ts: number; label: string; calls: number; tokens: number; quota: number }
    >();
    for (const log of statLogs) {
      const day = new Date(log.created_at * 1000);
      day.setHours(0, 0, 0, 0);
      const ts = day.getTime();
      const row =
        map.get(ts) ??
        {
          ts,
          label: `${day.getMonth() + 1}/${day.getDate()}`,
          calls: 0,
          tokens: 0,
          quota: 0,
        };
      row.calls += 1;
      row.tokens += Number(log.prompt_tokens ?? 0) + Number(log.completion_tokens ?? 0);
      row.quota += Math.abs(Number(log.quota ?? 0));
      map.set(ts, row);
    }
    return [...map.values()].sort((a, b) => a.ts - b.ts);
  }, [statLogs]);

  const dailyMax = daily.reduce((max, row) => Math.max(max, row[trendMetric]), 0);
  /**
   * 成功率 = 成功（type=2）÷（成功 + 失败（type=5）），两个数都来自后端分页总数。
   * 失败数没取到就整个不出这个数——分母缺一块会算成 100%，比不显示更误导。
   */
  const successRate =
    failedCalls === null || total + failedCalls === 0
      ? null
      : (total / (total + failedCalls)) * 100;

  return (
    <div className="min-h-screen md:pl-56">
      <ConsoleSidebar />
      <ConsoleTopbar title="用量统计" />

      <PageContainer>
        {error && (
          <div className="mb-4">
            <ErrorBox message={error} onRetry={() => void load()} retrying={loading} />
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="text-meta text-ink-muted">时间范围</span>
          <Segmented
            ariaLabel="选择统计时间范围"
            value={range}
            onChange={setRange}
            options={RANGE_OPTIONS}
          />
        </div>

        {/* 汇总：与概览页同一套三层结构 */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label="区间消费"
            value={stat ? quotaToAmount(stat.quota) : ''}
            unit={moneyUnit()}
            loading={loading}
            failed={!loading && statFailed}
          />
          <Metric
            label="调用次数"
            value={
              statTruncated ? `${formatNumber(totalCalls)}+` : formatNumber(totalCalls)
            }
            unit="次"
            loading={loading}
            failed={!loading && statFailed}
          />
          <Metric
            label="Token 用量"
            value={
              statTruncated ? `${formatNumber(totalTokens)}+` : formatNumber(totalTokens)
            }
            unit="Token"
            loading={loading}
            failed={!loading && statFailed}
          />
          <Metric
            label="请求成功率"
            value={
              failedCalls === null
                ? ''
                : successRate === null
                  ? '暂无调用'
                  : `${successRate.toFixed(1)}%`
            }
            loading={loading}
            failed={!loading && (statFailed || logsFailed || failedCalls === null)}
            foot={
              failedCalls === null
                ? '成功与失败次数暂未取到'
                : `成功 ${formatNumber(total)} 次 · 失败 ${formatNumber(failedCalls)} 次`
            }
          />
        </div>

        {/* 每日趋势 —— 文档 4.2 D 要求「每日调用量 / 每日 Token / 每日消费」 */}
        <Card flush className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-card py-3">
            <h2 className="text-title font-semibold text-ink">每日趋势</h2>
            <Segmented
              ariaLabel="切换趋势指标"
              value={trendMetric}
              onChange={setTrendMetric}
              options={TREND_OPTIONS}
            />
          </div>

          <div className="px-card py-card">
            {loading ? (
              /* 骨架照着柱状图排：几条长短不一的灰条看着像文字加载失败，柱子形状才对得上 */
              <div
                className="flex h-40 items-end justify-center gap-1.5"
                aria-busy="true"
                aria-label="加载中"
              >
                {[38, 62, 45, 80, 52, 30, 68].map((height, index) => (
                  <div
                    key={index}
                    className="w-full max-w-[80px] flex-1"
                    style={{ height: `${height}%` }}
                  >
                    <Skeleton className="h-full w-full rounded-t-control" />
                  </div>
                ))}
              </div>
            ) : statFailed ? (
              <EmptyHint
                text="暂时读不到趋势"
                hint="可能是网络波动，稍等片刻再试一次"
              />
            ) : daily.length === 0 ? (
              <EmptyHint
                text="这段时间还没有调用"
                hint="换个时间范围，或发起一次调用试试"
              />
            ) : (
              <div className="flex h-40 items-stretch justify-center gap-1.5">
                {daily.map((row) => {
                  const value = row[trendMetric];
                  const height =
                    dailyMax > 0 ? Math.max(value > 0 ? 4 : 0, (value / dailyMax) * 100) : 0;
                  const text =
                    trendMetric === 'quota'
                      ? `${quotaToAmount(row.quota)} ${moneyUnit()}`
                      : trendMetric === 'calls'
                        ? `${row.calls} 次`
                        : `${formatNumber(row.tokens)} Token`;
                  return (
                    <div
                      key={row.ts}
                      /* 只有一天数据时别让柱子撑成整块色块：给个最大宽度 */
                      className="group flex w-full min-w-0 max-w-[80px] flex-1 flex-col items-center gap-2"
                      title={`${row.label}：${text}`}
                    >
                      <div className="flex w-full flex-1 items-end">
                        <div
                          className={`w-full rounded-t-control transition-colors ${
                            value > 0 ? 'bg-brand/85 group-hover:bg-brand' : 'bg-line'
                          }`}
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="truncate text-meta text-ink-muted">{row.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* 分组统计 */}
        <Card flush className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-card py-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-title font-semibold text-ink">分布统计</h2>
              <Segmented
                ariaLabel="切换统计维度"
                value={groupBy}
                onChange={setGroupBy}
                options={GROUP_OPTIONS}
              />
            </div>
            <span className="text-meta text-ink-muted">
              {statTruncated ? `按最近 ${formatNumber(STAT_LIMIT)} 条估算` : '全部调用'}
            </span>
          </div>

          {loading ? (
            <div className="px-card py-card">
              <BlockLoading lines={3} />
            </div>
          ) : statFailed ? (
            <EmptyHint
              text="暂时读不到分布"
              hint="可能是网络波动，稍等片刻再试一次"
            />
          ) : agg.length === 0 ? (
            <EmptyHint
              text="这段时间还没有调用"
              hint={
                groupBy === 'model'
                  ? '发起调用后，这里会按模型显示各自的花费'
                  : '按密钥分开看，能知道哪一把花得最多'
              }
            />
          ) : (
            <div className="divide-y divide-line">
              {agg.map((row) => (
                <div key={row.name} className="px-card py-3">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="truncate text-body text-ink">{row.name}</span>
                    <span className="shrink-0 tabular-nums text-meta text-ink-muted">
                      {row.count} 次 · {quotaToAmount(row.quota)}
                    </span>
                  </div>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{
                        width: `${aggMax > 0 ? Math.max(2, (row.quota / aggMax) * 100) : 0}%`,
                      }}
                    />
                  </div>
                  <div className="mt-1.5 text-meta text-ink-muted">
                    输入 {formatNumber(row.promptTokens)} · 输出{' '}
                    {formatNumber(row.completionTokens)} Token
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 调用明细 */}
        <Card flush className="mt-4">
          <div className="flex items-center justify-between border-b border-line px-card py-3">
            <h2 className="text-title font-semibold text-ink">调用明细</h2>
            <span className="text-meta text-ink-muted">
              {loading ? '正在统计…' : logsFailed ? '条数未知' : `共 ${formatNumber(total)} 条`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-full text-left">
              <THead>
                <Th>时间</Th>
                <Th>模型</Th>
                <Th>密钥</Th>
                <Th>输入</Th>
                <Th>输出</Th>
                <Th>费用</Th>
                <Th>耗时</Th>
              </THead>
              <tbody>
                {loading ? (
                  <TableLoading colSpan={7} rows={5} />
                ) : logsFailed ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyHint
                        text="暂时读不到调用明细"
                        hint="可能是网络波动，稍等片刻再试一次"
                      />
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyHint
                        text="这段时间还没有调用"
                        hint="换个时间范围，或先去创建一把密钥"
                      />
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <Tr key={log.id}>
                      <Td className="whitespace-nowrap text-ink-muted">
                        {formatTime(log.created_at)}
                      </Td>
                      <Td>{log.model_name || PLACEHOLDER_DASH}</Td>
                      <Td className="text-ink-mid">{log.token_name || PLACEHOLDER_DASH}</Td>
                      <Td className="tabular-nums text-ink-mid">
                        {formatNumber(log.prompt_tokens)}
                      </Td>
                      <Td className="tabular-nums text-ink-mid">
                        {formatNumber(log.completion_tokens)}
                      </Td>
                      <Td className="tabular-nums">{quotaToAmount(log.quota)}</Td>
                      <Td className="tabular-nums text-ink-mid">
                        {log.use_time ? `${log.use_time}s` : PLACEHOLDER_DASH}
                      </Td>
                    </Tr>
                  ))
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

function Metric({
  label,
  value,
  unit,
  foot,
  loading,
  failed,
}: {
  label: string;
  value: string;
  unit?: string;
  foot?: string;
  loading?: boolean;
  failed?: boolean;
}) {
  /* 加载中不摆脚注：原来这里会写「成功与失败次数暂未取到」，
     数还没回来就先给用户报一个缺失，等于把加载中当成失败说。 */
  const showFoot = !loading && !failed && foot;
  return (
    <Card>
      <div className="text-meta text-ink-muted">{label}</div>
      <div className="mt-1 flex h-8 items-center">
        {loading ? (
          <Skeleton className="h-6 w-24" />
        ) : failed ? (
          <span className="text-meta text-ink-muted" title="暂时没读到，稍后重试一下">
            暂时没读到
          </span>
        ) : (
          <>
            <span className="truncate text-display font-semibold tabular-nums text-ink">
              {value}
            </span>
            {unit && <span className="ml-1 shrink-0 text-meta text-ink-muted">{unit}</span>}
          </>
        )}
      </div>
      <div className="mt-1 truncate text-meta text-ink-muted">
        {showFoot ? foot : '\u00a0'}
      </div>
    </Card>
  );
}
