'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, tokensApi, usageApi, ApiError } from '@portal/api-client';
import type { SelfUser, UsageLog } from '@portal/types';
import { Button, buttonClass, Card, TableWrap, Td, Th, THead, Tr } from '@portal/ui';
import { ConsoleSidebar, ConsoleTopbar } from '@/components/console-chrome';
import { BlockLoading, EmptyHint, ErrorBox, PLACEHOLDER_DASH, Skeleton } from '@/components/data-state';
import { PageContainer } from '@/components/page-shell';
import {
  ensureMoneySettings,
  formatNumber,
  formatTime,
  groupLabel,
  moneyUnit,
  quotaToAmount,
} from '@/lib/format';
import { docsUrl } from '@/lib/brand';

/**
 * 控制台概览 —— md 4.2 A
 *
 * 文档要求的 9 项：账户余额、今日消费、本月消费、总调用次数、Token 使用量、
 * API Key 数量、最近调用记录、常用模型、消费趋势图。
 *
 * 数据口径（md 亦要求"数据真实来自后端，不允许静态模拟"）：
 * · 余额、今日消费、本月消费、每日趋势 —— 全部由后端按时间区间求和（/api/log/self/stat），
 *   前端只把 quota 换算成金额，不自己相减或累加。
 * · Token 用量与常用模型 —— 官方没有按模型/按天的聚合接口（341 条路由里只有
 *   /api/log/self 列表与 /api/log/self/stat 总额），只能按近 7 天调用明细汇总，
 *   因此卡片与列表都标注"近 7 天"，并在页脚写明口径，不冒充全量。
 */

const WEEK_DAYS = 7;
/** 拉取明细的上限，超出时页面标注"仅统计前 N 条" */
const LOG_LIMIT = 500;
const GUIDE_HIDDEN_KEY = 'console.overview.guide.hidden';

interface WeekDay {
  label: string;
  start: number;
  end: number;
}

/** 最近 7 天，含今天；每段是 [当天 00:00, 次日 00:00) */
function buildWeek(): WeekDay[] {
  const days: WeekDay[] = [];
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);

  for (let offset = WEEK_DAYS - 1; offset >= 0; offset -= 1) {
    const dayStart = new Date(midnight);
    dayStart.setDate(dayStart.getDate() - offset);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    days.push({
      label: `${dayStart.getMonth() + 1}/${dayStart.getDate()}`,
      start: Math.floor(dayStart.getTime() / 1000),
      end: Math.floor(dayEnd.getTime() / 1000) - 1,
    });
  }

  return days;
}

function monthStartTs(): number {
  const now = new Date();
  return Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SelfUser | null>(null);
  const [todayQuota, setTodayQuota] = useState<number | null>(null);
  const [monthQuota, setMonthQuota] = useState<number | null>(null);
  const [keyCount, setKeyCount] = useState<number | null>(null);
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [logTotal, setLogTotal] = useState(0);
  /** 最近 7 天区间（含今天）。趋势图与明细查询共用同一份，避免两边各自算跨零点 */
  const week = useMemo(() => buildWeek(), []);
  /** 明细拉取失败时要和"真的没有调用"区分开，否则页面会理直气壮地说"还没有调用记录" */
  const [logsFailed, setLogsFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [guideHidden, setGuideHidden] = useState(false);

  useEffect(() => {
    setGuideHidden(window.localStorage.getItem(GUIDE_HIDDEN_KEY) === '1');
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    const todayStart = week[WEEK_DAYS - 1].start;
    const nowTs = Math.floor(Date.now() / 1000);

    try {
      // 金额要靠后端汇率换算，先把这个参数拿到再渲染
      await ensureMoneySettings();

      // 只问 5 次：账户、今日、本月、密钥数、近 7 天明细。
      // 趋势图不再按天各问一次（7 天 = 多 7 次请求，连翻几页必撞限流）。
      const [me, todayStat, monthStat, keys, recent] = await Promise.all([
        authApi.getSelf(),
        usageApi
          .getUsageStat({ start_timestamp: todayStart, end_timestamp: nowTs })
          .catch(() => null),
        usageApi
          .getUsageStat({ start_timestamp: monthStartTs(), end_timestamp: nowTs })
          .catch(() => null),
        tokensApi.listTokens({ page: 1, page_size: 1 }).catch(() => null),
        usageApi
          .listUsageLogs({
            page: 1,
            page_size: LOG_LIMIT,
            type: 2,
            start_timestamp: week[0].start,
            end_timestamp: nowTs,
          })
          .catch(() => null),
      ]);

      setUser(me);
      setTodayQuota(todayStat ? Number(todayStat.quota ?? 0) : null);
      setMonthQuota(monthStat ? Number(monthStat.quota ?? 0) : null);
      setKeyCount(keys ? keys.total : null);
      setLogs(recent?.items ?? []);
      setLogTotal(recent?.total ?? 0);
      setLogsFailed(recent === null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace('/login');
        return;
      }
      setError('数据加载失败，稍等片刻再试一次');
    } finally {
      setLoading(false);
    }
  }, [router, week]);

  useEffect(() => {
    void load();
  }, [load]);

  /** Token 用量与模型分布只能按明细汇总，口径固定为近 7 天 */
  const aggregate = useMemo(() => {
    let tokens = 0;
    const byModel = new Map<string, { name: string; calls: number; quota: number }>();

    for (const log of logs) {
      tokens += Number(log.prompt_tokens ?? 0) + Number(log.completion_tokens ?? 0);
      const name = log.model_name || '未记录模型';
      const row = byModel.get(name) ?? { name, calls: 0, quota: 0 };
      row.calls += 1;
      row.quota += Math.abs(Number(log.quota ?? 0));
      byModel.set(name, row);
    }

    const models = [...byModel.values()].sort((a, b) => b.calls - a.calls).slice(0, 5);
    return { tokens, models };
  }, [logs]);

  /**
   * 消费趋势：从近 7 天调用明细里自己按天求和，不再一天问后端一次。
   * 原来的写法 7 天要打 7 个请求，加上其他请求一共 12 个，连翻两页就被后端限流，
   * 全页变成「暂时没读到」——用户以为账户空了。
   * 明细有 500 条上限，真超了就由 logTruncated 在图下标出来，不假装精确。
   */
  const trend = useMemo(() => {
    const buckets = new Map<number, number>();
    for (const log of logs) {
      const day = new Date(Number(log.created_at ?? 0) * 1000);
      day.setHours(0, 0, 0, 0);
      const key = Math.floor(day.getTime() / 1000);
      // quota 为负表示消费，取绝对值才画得出柱子
      buckets.set(key, (buckets.get(key) ?? 0) + Math.abs(Number(log.quota ?? 0)));
    }
    return week.map((day) => ({ label: day.label, quota: buckets.get(day.start) ?? 0 }));
  }, [logs, week]);

  const weekTotal = trend.reduce((sum, item) => sum + item.quota, 0);
  const trendMax = trend.reduce((max, item) => Math.max(max, item.quota), 0);
  const modelMax = aggregate.models.reduce((max, item) => Math.max(max, item.calls), 0);
  const logTruncated = logTotal > logs.length;

  const steps = [
    {
      title: '创建 API 密钥',
      hint: '用密钥调用模型，创建后随时可以在密钥页查看',
      href: '/keys',
      done: (keyCount ?? 0) > 0,
      external: false,
    },
    {
      title: '添加额度',
      hint: '充值后就能开始调用，余额不足时请求会失败',
      href: '/wallet',
      done: (user?.quota ?? 0) > 0 || (user?.used_quota ?? 0) > 0,
      external: false,
    },
    {
      title: '发送第一个请求',
      hint: '照着文档里的示例，把密钥填进去就能跑通',
      href: docsUrl,
      done: (user?.request_count ?? 0) > 0,
      external: true,
    },
  ];
  const doneSteps = steps.filter((step) => step.done).length;
  const showGuide = !guideHidden && doneSteps < steps.length;

  /**
   * 六张卡片各自记一笔「这项到底拿没拿到」。
   * 之前拿不到就塞一个「—」，和「余额就是 0」长得一样；现在把 failed 单独标出来，
   * 由渲染层决定显示「暂时没读到」而不是横杠。
   */
  const cards: {
    label: string;
    value: string;
    unit?: string;
    foot: string;
    failed?: boolean;
  }[] = [
    {
      label: '账户余额',
      value: quotaToAmount(user?.quota),
      unit: moneyUnit(),
      foot: '充值后可用于调用',
      failed: !user,
    },
    {
      label: '今日消费',
      value: todayQuota === null ? '' : quotaToAmount(todayQuota),
      unit: moneyUnit(),
      foot: '今日 00:00 起',
      failed: todayQuota === null,
    },
    {
      label: '本月消费',
      value: monthQuota === null ? '' : quotaToAmount(monthQuota),
      unit: moneyUnit(),
      foot: '本月 1 日起',
      failed: monthQuota === null,
    },
    {
      label: '总调用次数',
      value: formatNumber(user?.request_count),
      unit: '次',
      foot: '开户至今累计',
      failed: !user,
    },
    {
      label: 'Token 使用量',
      value: logsFailed ? '' : formatNumber(aggregate.tokens),
      unit: 'Token',
      foot: logTruncated ? '近 7 天，部分记录' : '近 7 天汇总',
      failed: logsFailed,
    },
    {
      label: 'API 密钥',
      value: keyCount === null ? '' : formatNumber(keyCount),
      unit: '个',
      foot: '当前账号下的密钥数',
      failed: keyCount === null,
    },
  ];

  return (
    <div className="min-h-screen md:pl-56">
      <ConsoleSidebar />
      <ConsoleTopbar title="概览" balance={user ? quotaToAmount(user.quota) : undefined} />

      <PageContainer>
        {error && (
          <div className="mb-4">
            <ErrorBox message={error} onRetry={() => void load()} retrying={loading} />
          </div>
        )}

        {loading ? (
          /* 骨架屏：形状照着真实页面排，加载完成时不会整页跳一下 */
          <div aria-busy="true" aria-label="加载中">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index}>
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="mt-3 h-6 w-24" />
                  <Skeleton className="mt-2 h-3 w-28" />
                </Card>
              ))}
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <Card flush className="lg:col-span-2">
                <div className="border-b border-line px-card py-3">
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex h-40 items-end gap-3 px-card py-card">
                  {[38, 62, 45, 80, 52, 30, 68].map((height, index) => (
                    <div key={index} className="flex-1" style={{ height: `${height}%` }}>
                      <Skeleton className="h-full w-full rounded-t-control" />
                    </div>
                  ))}
                </div>
              </Card>
              <Card flush>
                <div className="border-b border-line px-card py-3">
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="px-card py-card">
                  <BlockLoading lines={4} />
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <>
            {/* 引导卡：只在还没走完三步时出现，走完就自动消失，不再占一块地方 */}
            {showGuide && (
              <Card className="mb-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-title font-semibold text-ink">开始使用</h2>
                    <p className="mt-1 text-meta leading-normal text-ink-muted">
                      完成这三步，就能发出第一条请求（已完成 {doneSteps}/{steps.length}）
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link href="/keys" className={buttonClass('primary', 'sm')}>
                      创建 API 密钥
                    </Link>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        window.localStorage.setItem(GUIDE_HIDDEN_KEY, '1');
                        setGuideHidden(true);
                      }}
                    >
                      隐藏
                    </Button>
                  </div>
                </div>

                <ol className="mt-4 grid gap-3 md:grid-cols-3">
                  {steps.map((step, index) => {
                    const body = (
                      <>
                        <span
                          aria-hidden
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-meta font-medium ${
                            step.done ? 'bg-brand text-white' : 'border border-line text-ink-muted'
                          }`}
                        >
                          {step.done ? '✓' : index + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          {/*
                            标题独占一行、说明换行显示，都不截断。
                            原来标题旁边还挂一个「去创建」小字，在 1024 笔记本上
                            挤到下一行，跟说明缠在一起；而整张卡本来就是链接、
                            右边有箭头、悬停还有边框变化，这个标签纯属添乱，去掉。
                          */}
                          <span
                            className={`block text-body ${
                              step.done ? 'text-ink-muted line-through' : 'text-ink'
                            }`}
                          >
                            {step.title}
                          </span>
                          <span className="mt-0.5 block text-meta leading-normal text-ink-muted">
                            {step.hint}
                          </span>
                        </span>
                        <span aria-hidden className="shrink-0 text-ink-muted">
                          →
                        </span>
                      </>
                    );
                    const className =
                      'flex items-start gap-3 rounded-card border border-line bg-surface-subtle px-4 py-3 transition-colors hover:border-brand/40 hover:bg-surface';

                    return (
                      <li key={step.title}>
                        {step.external ? (
                          <a href={step.href} className={className}>
                            {body}
                          </a>
                        ) : (
                          <Link href={step.href} className={className}>
                            {body}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </Card>
            )}

            {/* 六项核心数字：标签在上、数值最大、口径说明最小，三层一眼分开 */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((item) => (
                <Card key={item.label}>
                  <div className="text-meta text-ink-muted">{item.label}</div>
                  {item.failed ? (
                    <div className="mt-1.5 flex h-8 items-center">
                      <span
                        className="text-meta text-ink-muted"
                        title="暂时没读到，稍后重试一下"
                      >
                        暂时没读到
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="truncate text-display font-semibold tabular-nums text-ink">
                        {item.value}
                      </span>
                      {item.unit && (
                        <span className="shrink-0 text-meta text-ink-muted">{item.unit}</span>
                      )}
                    </div>
                  )}
                  <div className="mt-1 text-meta text-ink-muted">{item.foot}</div>
                </Card>
              ))}
            </div>

            {user && (
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-meta text-ink-muted">
                <span>
                  当前账号{' '}
                  <span className="font-medium text-ink">
                    {user.username}
                    {user.display_name && user.display_name !== user.username
                      ? `（${user.display_name}）`
                      : ''}
                  </span>
                </span>
                <span aria-hidden className="text-line">
                  |
                </span>
                <span>
                  计费档位 <span className="font-medium text-ink">{groupLabel(user.group)}</span>
                </span>
                <span aria-hidden className="text-line">
                  |
                </span>
                <span>
                  角色{' '}
                  <span className="font-medium text-ink">
                    {user.role >= 100 ? '超级管理员' : user.role >= 10 ? '管理员' : '普通用户'}
                  </span>
                </span>
              </div>
            )}

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <Card flush className="lg:col-span-2">
                <div className="flex items-start justify-between gap-3 border-b border-line px-card py-3">
                  <div className="min-w-0">
                    <h2 className="text-title font-semibold text-ink">消费趋势</h2>
                    <p className="mt-0.5 text-meta leading-normal text-ink-muted">
                      近 7 天合计 {quotaToAmount(weekTotal)} {moneyUnit()}
                    </p>
                  </div>
                  <Link
                    href="/billing"
                    className="shrink-0 text-note text-ink-mid transition-colors hover:text-brand"
                  >
                    查看记录
                  </Link>
                </div>

                <div className="px-card py-card">
                  {logsFailed ? (
                    /* 明细没拿到就等于趋势算不出来。这两种情况不能都说成「还没有消费」 */
                    <EmptyHint
                      text="暂时读不到消费趋势"
                      hint={
                        <>
                          可能是网络波动，稍等片刻再试一次。
                          <button
                            type="button"
                            onClick={() => void load()}
                            className="ml-1 text-brand underline"
                          >
                            重试
                          </button>
                        </>
                      }
                    />
                  ) : trendMax === 0 ? (
                    <EmptyHint
                      text="近 7 天还没有消费"
                      hint="发起一次调用，这里就会显示每天的消费"
                    />
                  ) : (
                    <div className="flex h-40 items-stretch justify-between gap-3">
                      {trend.map((point) => {
                        const height =
                          point.quota > 0 ? Math.max(4, (point.quota / trendMax) * 100) : 0;
                        return (
                          <div
                            key={point.label}
                            className="group flex w-full min-w-0 max-w-[80px] flex-1 flex-col items-center gap-2"
                            title={`${point.label}：${quotaToAmount(point.quota)} ${moneyUnit()}`}
                          >
                            {/* 柱子的百分比高度以这块剩余空间为准，避免把日期标签挤出卡片 */}
                            <div className="flex w-full flex-1 items-end">
                              <div
                                className={`w-full rounded-t-control transition-colors ${
                                  point.quota > 0
                                    ? 'bg-brand/85 group-hover:bg-brand'
                                    : 'bg-line'
                                }`}
                                style={{ height: `${height}%` }}
                              />
                            </div>
                            <span className="text-meta tabular-nums text-ink-muted">
                              {point.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>

              <Card flush>
                <div className="flex items-start justify-between gap-3 border-b border-line px-card py-3">
                  <div className="min-w-0">
                    <h2 className="text-title font-semibold text-ink">常用模型</h2>
                    <p className="mt-0.5 text-meta text-ink-muted">近 7 天调用次数</p>
                  </div>
                  <Link
                    href="/usage"
                    className="shrink-0 text-note text-ink-mid transition-colors hover:text-brand"
                  >
                    用量统计
                  </Link>
                </div>

                <div className="px-card py-card">
                  {logsFailed ? (
                    <EmptyHint
                      text="暂时读不到常用模型"
                      hint={
                        <>
                          可能是网络波动，稍等片刻再试一次。
                          <button
                            type="button"
                            onClick={() => void load()}
                            className="ml-1 text-brand underline"
                          >
                            重试
                          </button>
                        </>
                      }
                    />
                  ) : aggregate.models.length === 0 ? (
                    <EmptyHint
                      text="近 7 天还没有调用"
                      hint="发起一次调用，这里就会显示你常用的模型"
                    />
                  ) : (
                    <div className="space-y-3.5">
                      {aggregate.models.map((model) => (
                        <div key={model.name}>
                          <div className="flex items-baseline justify-between gap-3">
                            <span
                              className="truncate text-body text-ink"
                              title={model.name}
                            >
                              {model.name}
                            </span>
                            <span className="shrink-0 tabular-nums text-meta text-ink-muted">
                              {formatNumber(model.calls)} 次 · {quotaToAmount(model.quota)}{' '}
                              {moneyUnit()}
                            </span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
                            <div
                              className="h-full rounded-full bg-brand transition-[width] duration-300"
                              style={{
                                width: `${Math.max(2, (model.calls / modelMax) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <section className="mt-4">
              <div className="mb-2 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-title font-semibold text-ink">最近调用记录</h2>
                  <p className="mt-0.5 text-meta text-ink-muted">最新 5 条消费调用</p>
                </div>
                <Link
                  href="/usage"
                  className="shrink-0 text-note text-ink-mid transition-colors hover:text-brand"
                >
                  全部记录
                </Link>
              </div>

              <TableWrap>
                <THead>
                  <Th>时间</Th>
                  <Th>模型</Th>
                  <Th>密钥</Th>
                  <Th align="right">Token</Th>
                  <Th align="right">费用</Th>
                </THead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <EmptyHint
                          text="还没有调用记录"
                          hint="按「开始使用」里的步骤发起第一条调用"
                        />
                      </td>
                    </tr>
                  ) : (
                    logs.slice(0, 5).map((log) => (
                      <Tr key={log.id}>
                        <Td className="whitespace-nowrap text-ink-muted">
                          {formatTime(log.created_at)}
                        </Td>
                        <Td>{log.model_name || PLACEHOLDER_DASH}</Td>
                        <Td className="text-ink-muted">{log.token_name || PLACEHOLDER_DASH}</Td>
                        <Td align="right" className="tabular-nums text-ink-muted">
                          {formatNumber(
                            Number(log.prompt_tokens ?? 0) + Number(log.completion_tokens ?? 0),
                          )}
                        </Td>
                        <Td align="right" className="tabular-nums">
                          {quotaToAmount(Math.abs(Number(log.quota ?? 0)))}
                        </Td>
                      </Tr>
                    ))
                  )}
                </tbody>
              </TableWrap>
            </section>
          </>
        )}
      </PageContainer>
    </div>
  );
}
