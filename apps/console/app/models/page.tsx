'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { modelsApi, systemApi, ApiError } from '@portal/api-client';
import {
  computePrice,
  summarizePrice,
  type Conversion,
  type ModelPrice,
  type PricingRow,
} from '@portal/pricing';
import { CATEGORY_ORDER, findCatalogEntry } from '@portal/types';
import { Card, Input, Segmented } from '@portal/ui';
import type { SegmentedOption } from '@portal/ui';
import { ConsoleSidebar, ConsoleTopbar } from '@/components/console-chrome';
import { PageContainer } from '@/components/page-shell';
import { EmptyHint, ErrorBox, Skeleton } from '@/components/data-state';
import { formatNumber } from '@/lib/format';

/**
 * 模型广场（控制台内）—— md 4.2 B
 *
 * 文档要求：全部模型、模型分类、模型搜索、模型能力标签、输入/输出价格、
 * 模型详情、API 调用代码示例。
 * 模型是否存在以 /api/user/models 为准；分类与能力标签来自共享模型目录
 * （@portal/types 的 MODEL_CATALOG），目录里没有的模型归入「其他」，
 * 不编造标签。
 */
export default function ConsoleModelsPage() {
  const router = useRouter();
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<string>('全部');
  /** 模型名 → 解析后的价格（分时模型含多个档位） */
  const [prices, setPrices] = useState<Map<string, ModelPrice>>(new Map());

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [data, status, pricing] = await Promise.all([
        modelsApi.listUserModels(),
        systemApi.getStatus().catch(() => null),
        modelsApi.listPricing().catch(() => null),
      ]);
      setModels(Array.isArray(data) ? data : []);

      // 价格：换算参数取自 /api/status，单价取自 /api/pricing 的计费表达式
      const conv: Conversion = {
        quotaPerUsd: Number(status?.quota_per_unit) || 500_000,
        usdToCny: Number(status?.usd_exchange_rate) || 7.3,
      };
      const raw = pricing as unknown;
      const pricingRows: PricingRow[] = Array.isArray(raw)
        ? (raw as PricingRow[])
        : ((raw as { data?: PricingRow[] })?.data ??
          (raw as { models?: PricingRow[] })?.models ??
          []);
      const priceMap = new Map<string, ModelPrice>();
      for (const row of pricingRows) {
        priceMap.set(row.model_name, computePrice(row, conv));
      }
      setPrices(priceMap);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace('/login');
        return;
      }
      setError('数据加载失败，稍等片刻再试一次');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  /** 模型名 → 目录条目；目录里没有就是 undefined（新接入但还没登记资料） */
  const rows = useMemo(
    () => models.map((name) => ({ name, entry: findCatalogEntry(name) })),
    [models],
  );

  /** 只显示真的有模型的分类，不摆一排空标签 */
  const categories = useMemo(() => {
    const present = new Set(rows.map((row) => row.entry?.category ?? '其他'));
    return [
      '全部',
      ...CATEGORY_ORDER.filter((item) => present.has(item)),
      ...(present.has('其他') ? ['其他'] : []),
    ];
  }, [rows]);

  const categoryOptions: SegmentedOption<string>[] = categories.map((item) => ({
    value: item,
    label: item,
  }));

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return rows.filter((row) => {
      if (category !== '全部' && (row.entry?.category ?? '其他') !== category) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        (row.entry?.displayName ?? '').toLowerCase().includes(q) ||
        (row.entry?.vendorName ?? '').toLowerCase().includes(q) ||
        (row.entry?.capabilities ?? []).some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [rows, keyword, category]);

  return (
    <div className="min-h-screen md:pl-56">
      <ConsoleSidebar />
      <ConsoleTopbar title="模型广场" />

      <PageContainer>
        {error && (
          <div className="mb-4">
            <ErrorBox message={error} onRetry={() => void load()} retrying={loading} />
          </div>
        )}

        {/* 工具条：左边找模型，右边给条数 */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索模型名称、厂商、能力"
              aria-label="搜索模型"
              className="w-72"
            />
            {/* 分类一多就折行，别把工具条顶宽 */}
            {categories.length > 2 && (
              <Segmented
                ariaLabel="按分类筛选模型"
                value={category}
                onChange={setCategory}
                options={categoryOptions}
                wrap
              />
            )}
          </div>
          <span className="text-meta text-ink-muted">
            {loading ? '正在统计…' : `共 ${formatNumber(filtered.length)} 个可用模型`}
          </span>
        </div>

        {loading ? (
          /* 骨架照真实卡片排：名称 / 模型 ID / 厂商 / 价格，加载完不会整块跳一下 */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="mt-1.5 h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-14 rounded-control" />
                </div>
                <Skeleton className="mt-3 h-3 w-36" />
                <Skeleton className="mt-3 h-4 w-16 rounded-control" />
                <Skeleton className="mt-auto h-5 w-24" />
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <EmptyHint
              text={models.length === 0 ? '当前档位下还没有可用模型' : '没有匹配的模型'}
              hint={
                models.length === 0
                  ? '联系管理员开通模型权限，开通后这里会显示可用清单'
                  : '清掉搜索词或换个分类看看'
              }
            />
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((row) => {
              const price = summarizePrice(prices.get(row.name) ?? { mode: 'unknown' });
              return (
                <Link
                  key={row.name}
                  href={`/models/${encodeURIComponent(row.name)}`}
                  className="group flex h-full flex-col rounded-card border border-line bg-surface p-card transition-colors hover:border-brand/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-body font-medium text-ink">
                        {row.entry?.displayName ?? row.name}
                      </div>
                      <div className="mt-0.5 truncate font-mono text-meta text-ink-muted">
                        {row.name}
                      </div>
                    </div>
                    <span className="whitespace-nowrap shrink-0 rounded-control bg-brand-soft px-2 py-0.5 text-meta text-brand">
                      {row.entry?.category ?? '其他'}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-meta text-ink-muted">
                    <span>{row.entry?.vendorName ?? '未登记厂商'}</span>
                    {row.entry?.contextWindow && (
                      <>
                        <span aria-hidden className="text-line">
                          |
                        </span>
                        <span>上下文 {row.entry.contextWindow}</span>
                      </>
                    )}
                  </div>

                  <div className="mt-2 flex min-h-[22px] flex-wrap gap-1">
                    {(row.entry?.capabilities ?? []).slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="whitespace-nowrap rounded border border-line px-1.5 py-0.5 text-meta text-ink-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* 价格贴底：网格里每张卡内容多少不一，价格在同一水平线才好横向比 */}
                  <div className="mt-auto flex items-baseline gap-1.5 pt-3">
                    <span className="text-title font-semibold tabular-nums text-ink">
                      {price.text}
                    </span>
                    {price.hint && (
                      <span className="whitespace-nowrap rounded bg-surface-subtle px-1.5 py-0.5 text-meta text-ink-muted">
                        {price.hint}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-meta text-ink-muted transition-colors group-hover:text-brand">
                    查看价格与调用示例 →
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
