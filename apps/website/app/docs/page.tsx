import Link from 'next/link';
import { DocsShell } from '@/components/docs-shell';
import { MODEL_CATALOG } from '@/lib/model-catalog';
import { loadModelList } from '@/lib/pricing';
import { apiBase } from '@/lib/brand';

export const metadata = { title: '开发者文档' };

const ENTRIES = [
  {
    href: '/docs/quickstart',
    title: '快速开始',
    desc: '四条命令跑通第一次调用，含 curl、Python、Node 示例。',
  },
  {
    href: '/docs/api',
    title: '接口速查',
    desc: '网关开放的全部路由，以及哪些现在就能用。',
  },
  {
    href: '/docs/errors',
    title: '错误码',
    desc: '返回体结构、各状态码含义、该怎么重试。',
  },
];

/** 文档首页（概览）：定位 + 三个入口 + 计费与支持范围 */
export default async function DocsPage() {
  const { models } = await loadModelList(MODEL_CATALOG);

  return (
    <DocsShell>
      <h1 className="text-3xl font-bold tracking-tight text-ink">开发者文档</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-mid">
        {models.length} 个模型、一个接口地址、一把 API Key。接口与 OpenAI
        完全兼容，原有代码只改 base_url 和 Key 两处。
      </p>
      <p className="mt-2 font-mono text-[13px] text-brand">{apiBase}/v1</p>

      <section id="start" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-ink">从这里开始</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {ENTRIES.map((entry) => (
            <Link
              key={entry.href}
              href={entry.href}
              className="rounded-xl border border-black/5 bg-white p-4 transition-colors hover:border-brand/40"
            >
              <div className="text-sm font-semibold text-ink">{entry.title}</div>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-mid">{entry.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="billing" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-ink">计费方式</h2>
        <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-ink-mid">
          <li>按 token 计费，输入与输出分别计价，单价见「价格」页。</li>
          <li>部分模型分时段计价：工作日的白天为高峰价，其余时间为空闲价，控制台按调用发生的时间段结算。</li>
          <li>缓存命中的输入按缓存价计费，比普通输入便宜。</li>
          <li>被拒绝的请求（认证失败、余额不足、模型不可用）不产生费用。</li>
          <li>每次调用的扣费明细都能在控制台的消费记录里逐条核对。</li>
        </ul>
      </section>

      <section id="scope" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-ink">当前支持范围</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-mid">
          目前接入的全部是对话类模型，<code className="rounded bg-black/5 px-1 py-0.5 font-mono text-[12.5px]">/v1/chat/completions</code>{' '}
          及其兼容协议可以直接使用。
        </p>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-mid">
          Embedding、图像生成、音频、Rerank 这些路由网关已经开放，但还没有接入对应的模型渠道，现在调用会返回模型不可用。等这些能力上线后再单独写用法。
        </p>
        <Link
          href="/docs/chat"
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
        >
          去看对话接口怎么调 →
        </Link>
      </section>
    </DocsShell>
  );
}
