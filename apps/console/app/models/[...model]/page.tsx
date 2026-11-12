'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { modelsApi, ApiError } from '@portal/api-client';
import { Badge, Card, Notice, Segmented } from '@portal/ui';
import type { SegmentedOption } from '@portal/ui';
import { ConsoleSidebar, ConsoleTopbar } from '@/components/console-chrome';
import { PageContainer } from '@/components/page-shell';
import { ErrorBox, Skeleton } from '@/components/data-state';
import { ensureMoneySettings, moneyUnit, usdToDisplay } from '@/lib/format';
import { pricingUrl } from '@/lib/brand';

/**
 * 模型详情页 —— md 4.2 B「模型详情 / 输入价格 / 输出价格 / API 调用代码示例」
 *
 * 价格换算（已核对 backend/common/constants.go 与 model/pricing.go）：
 *   QuotaPerUnit = 500000，即 $1 = 500000 quota；
 *   每 1K 输入 token 消耗 quota = model_ratio × 1000；
 *   因此 每 1M token 输入价（美元）= model_ratio × 2。
 *   输出价 = 输入价 × completion_ratio。
 *   quota_type = 1 时按次计费，直接用 model_price（美元/次）。
 *
 * 用 [...model] 而不是 [model]：模型名里可能带斜杠（如 vendor/model-name），
 * 单段动态路由会把斜杠当成路径分隔符。
 */

interface PricingItem {
  model_name: string;
  description?: string;
  tags?: string;
  owner_by?: string;
  quota_type: number;
  model_ratio: number;
  model_price: number;
  completion_ratio: number;
  /** flat = 按倍率；tiered_expr = 分时动态表达式（价格不在 model_ratio 里） */
  billing_mode?: string;
  billing_expr?: string;
}

type LangKey = 'curl' | 'node' | 'python';

const LANG_OPTIONS: SegmentedOption<LangKey>[] = [
  { value: 'curl', label: 'cURL' },
  { value: 'node', label: 'Node.js' },
  { value: 'python', label: 'Python' },
];

/** 倍率 → 每百万 token 的价格（按后端配置的货币与汇率展示） */
function ratioToPrice(ratio: number): string {
  const value = usdToDisplay(ratio * 2);
  if (!Number.isFinite(value)) return '—';
  // 留 4 位有效小数，避免出现 0.30000000000000004 这种
  return Number(value.toFixed(4)).toString();
}

/** 货币符号：人民币显示 ¥，美元显示 $ */
function currencySign(): string {
  return moneyUnit() === '元' ? '¥' : '$';
}

export default function ModelDetailPage() {
  const router = useRouter();
  const params = useParams<{ model: string[] }>();
  const modelName = decodeURIComponent(
    Array.isArray(params.model) ? params.model.join('/') : (params.model as string) ?? '',
  );

  const [item, setItem] = useState<PricingItem | null>(null);
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  /**
   * 「价格表没拉到」和「价格表里确实没有这个模型」必须分开。
   * 之前两者都走 catch → null，页面一律说「没有找到模型」，
   * 明明是接口失败，却告诉用户这个模型不存在。
   */
  const [pricingFailed, setPricingFailed] = useState(false);
  /** 可用模型列表没拉到，此时既不能说可用也不能说不可用 */
  const [modelsFailed, setModelsFailed] = useState(false);
  const [tab, setTab] = useState<LangKey>('curl');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setPricingFailed(false);
    setModelsFailed(false);
    let pricingMissing = false;
    let modelsMissing = false;
    try {
      await ensureMoneySettings();
      const [pricing, models] = await Promise.all([
        modelsApi.listPricing().catch(() => {
          pricingMissing = true;
          return null;
        }),
        modelsApi.listUserModels().catch(() => {
          modelsMissing = true;
          return [] as string[];
        }),
      ]);
      // http.get 已经把 { success, data } 的信封拆掉了，这里拿到的是数组本身；
      // 之前按 pricing.data 取，等于又拆了一次，所以永远找不到模型。
      const raw = pricing as unknown;
      const list: PricingItem[] = Array.isArray(raw)
        ? (raw as PricingItem[])
        : (((raw as { data?: PricingItem[] })?.data ??
            (raw as { models?: PricingItem[] })?.models ??
            []) as PricingItem[]);
      const found = list.find((p) => p.model_name === modelName) ?? null;
      setItem(found);
      setAvailable(Array.isArray(models) && models.includes(modelName));
      setPricingFailed(pricingMissing);
      setModelsFailed(modelsMissing);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace('/login');
        return;
      }
      setError('数据加载失败，稍等片刻再试一次');
    } finally {
      setLoading(false);
    }
  }, [modelName, router]);

  useEffect(() => {
    void load();
  }, [load]);

  const isPerCall = item?.quota_type === 1;
  /** 分时动态计费：价格写在表达式里，model_ratio 不是真实单价，不能拿来展示 */
  const isTiered = item?.billing_mode === 'tiered_expr';
  const inputPrice = item ? ratioToPrice(item.model_ratio) : '—';
  const outputPrice = item
    ? ratioToPrice(item.model_ratio * item.completion_ratio)
    : '—';

  const baseUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://你的域名';

  const samples = {
    curl: `curl -X POST "${baseUrl}/v1/chat/completions" \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${modelName}",
    "messages": [{"role": "user", "content": "你好"}],
    "stream": true
  }'`,
    node: `import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.API_KEY,
  baseURL: '${baseUrl}/v1',
});

const res = await client.chat.completions.create({
  model: '${modelName}',
  messages: [{ role: 'user', content: '你好' }],
  stream: true,
});`,
    python: `from openai import OpenAI

client = OpenAI(
    api_key=os.environ["API_KEY"],
    base_url="${baseUrl}/v1",
)

resp = client.chat.completions.create(
    model="${modelName}",
    messages=[{"role": "user", "content": "你好"}],
    stream=True,
)`,
  };

  return (
    <div className="min-h-screen md:pl-56">
      <ConsoleSidebar />
      <ConsoleTopbar title="模型详情" />

      <PageContainer>
        <Link
          href="/models"
          className="inline-block text-note text-ink-mid transition-colors hover:text-brand"
        >
          ← 返回模型广场
        </Link>

        {error && (
          <div className="mt-3">
            <ErrorBox message={error} onRetry={() => void load()} retrying={loading} />
          </div>
        )}

        {loading ? (
          /* 骨架照真实版面排：标题 + 说明 + 两块价格，加载完不会整页跳 */
          <div className="mt-3 space-y-4" aria-busy="true" aria-label="加载中">
            <Card>
              <Skeleton className="h-5 w-44" />
              <Skeleton className="mt-4 h-3.5 w-full max-w-xl" />
              <Skeleton className="mt-2 h-3.5 w-2/3" />
              <div className="mt-4 flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            </Card>
            <Card>
              <Skeleton className="h-3.5 w-16" />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-32" />
              </div>
            </Card>
          </div>
        ) : pricingFailed ? (
          /* 价格表没拉到 ≠ 这个模型不存在。这里的说法必须区分开 */
          <div className="mt-3">
            <ErrorBox
              message="价格表暂时读不到，稍后重试一下"
              onRetry={() => void load()}
              retrying={loading}
            />
          </div>
        ) : !item ? (
          <Card className="mt-3">
            <div className="py-8 text-center">
              <p className="text-body text-ink">没有找到模型「{modelName}」</p>
              <p className="mt-1.5 text-meta text-ink-muted">
                这个模型可能还没有上架，或还没有配置价格
              </p>
            </div>
          </Card>
        ) : (
          <>
            {/* 头部：模型名 / 介绍 / 标签 */}
            <Card className="mt-3">
              <h1 className="font-mono text-heading font-semibold text-ink">
                {item.model_name}
              </h1>
              <p className="mt-2 max-w-2xl text-body leading-relaxed text-ink-mid">
                {item.description || '这个模型还没有介绍'}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {modelsFailed ? (
                  /* 模型列表没拉到，说「不可用」等于把失败讲成事实 */
                  <Badge tone="neutral">可用状态未知</Badge>
                ) : (
                  <Badge tone={available ? 'success' : 'neutral'}>
                    {available ? '当前可用' : '当前不可用'}
                  </Badge>
                )}
                {item.owner_by && <Tag text={`来源 ${item.owner_by}`} />}
                {item.tags
                  ?.split(/[,;]/)
                  .map((tag) => tag.trim())
                  .filter(Boolean)
                  .map((tag) => <Tag key={tag} text={tag} />)}
              </div>
            </Card>

            {/* 价格 */}
            <Card className="mt-4">
              <h2 className="text-title font-semibold text-ink">计费方式</h2>
              {isTiered ? (
                <Notice className="mt-3">
                  这个模型按
                  <span className="mx-1 font-medium text-ink">分时动态计费</span>
                  ，高峰期和空闲时段单价不同，所以这里不标固定价格，免得和实际扣费对不上。
                  <a href={pricingUrl} className="ml-1 text-brand hover:underline">
                    看价格页 →
                  </a>
                </Notice>
              ) : isPerCall ? (
                <div className="mt-3">
                  <div className="text-meta text-ink-muted">按次计费</div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-display font-semibold tabular-nums text-ink">
                      {currencySign()}
                      {Number(usdToDisplay(item.model_price).toFixed(4))}
                    </span>
                    <span className="text-meta text-ink-muted">/ 次</span>
                  </div>
                </div>
              ) : (
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <PriceBlock label="输入价格" value={inputPrice} />
                  <PriceBlock label="输出价格" value={outputPrice} />
                </div>
              )}
              <p className="mt-3 text-meta text-ink-muted">
                价格可能与官方标价不同，实际扣费以用量记录为准
              </p>
            </Card>

            {/* 调用示例 */}
            <Card flush className="mt-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-card py-3">
                <h2 className="text-title font-semibold text-ink">调用示例</h2>
                <Segmented
                  ariaLabel="切换代码语言"
                  value={tab}
                  onChange={setTab}
                  options={LANG_OPTIONS}
                />
              </div>
              <pre className="overflow-x-auto bg-[#0F172A] px-card py-card text-note leading-relaxed text-[#E2E8F0]">
                <code>{samples[tab]}</code>
              </pre>
              <p className="border-t border-line px-card py-2.5 text-meta text-ink-muted">
                把示例里的 $API_KEY 换成你在「API 密钥」页创建的那把密钥，就能直接跑
              </p>
            </Card>
          </>
        )}
      </PageContainer>
    </div>
  );
}

/** 一档价格：标签 / 数字 / 单位 */
function PriceBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-meta text-ink-muted">{label}</div>
      <div className="mt-1 flex h-8 items-baseline gap-1">
        {value === '—' ? (
          /* 倍率不是数字时别拼出「¥—/百万 Token」，直接说没配 */
          <span className="text-note text-ink-muted">未配置单价</span>
        ) : (
          <>
            <span className="text-display font-semibold tabular-nums text-ink">
              {currencySign()}
              {value}
            </span>
            <span className="text-meta text-ink-muted">/ 百万 Token</span>
          </>
        )}
      </div>
    </div>
  );
}

/** 能力标签：不是状态，不需要圆点，比 Badge 轻一档 */
function Tag({ text }: { text: string }) {
  return (
    <span className="whitespace-nowrap rounded-control border border-line px-2 py-0.5 text-meta text-ink-muted">
      {text}
    </span>
  );
}
