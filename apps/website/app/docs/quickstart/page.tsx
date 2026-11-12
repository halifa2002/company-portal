import Link from 'next/link';
import { CodeBlock } from '@/components/code-block';
import { DocsShell } from '@/components/docs-shell';
import { apiBase, registerUrl } from '@/lib/brand';
import { MODEL_CATALOG } from '@/lib/model-catalog';
import { loadModelList } from '@/lib/pricing';

export const metadata = { title: '快速开始' };

/** 快速开始：拿到 Key 到跑通第一次调用，全程只要四步 */
export default async function QuickstartPage() {
  const { models } = await loadModelList(MODEL_CATALOG);
  const model = models[0]?.id ?? 'deepseek-flash';

  const curl = [
    `curl ${apiBase}/v1/chat/completions \\`,
    '  -H "Authorization: Bearer $API_KEY" \\',
    '  -H "Content-Type: application/json" \\',
    "  -d '{",
    `    \"model\": \"${model}\",`,
    '    "messages": [{"role": "user", "content": "你好"}],',
    '    "stream": false',
    "  }'",
  ].join('\n');

  const python = [
    'from openai import OpenAI',
    '',
    'client = OpenAI(',
    '    api_key="你的 API Key",',
    `    base_url="${apiBase}/v1",`,
    ')',
    '',
    'resp = client.chat.completions.create(',
    `    model="${model}",`,
    '    messages=[{"role": "user", "content": "你好"}],',
    ')',
    '',
    'print(resp.choices[0].message.content)',
  ].join('\n');

  const node = [
    "import OpenAI from 'openai';",
    '',
    'const client = new OpenAI({',
    '  apiKey: process.env.API_KEY,',
    `  baseURL: '${apiBase}/v1',`,
    '});',
    '',
    'const resp = await client.chat.completions.create({',
    `  model: '${model}',`,
    "  messages: [{ role: 'user', content: '你好' }],",
    '});',
    '',
    'console.log(resp.choices[0].message.content);',
  ].join('\n');

  const steps = [
    { n: '01', title: '注册账号', desc: '手机号或邮箱注册，注册后直接进控制台。' },
    { n: '02', title: '创建 API Key', desc: '控制台左侧「API 密钥」→ 新建 → 复制完整 Key（只完整显示一次）。' },
    { n: '03', title: '充值额度', desc: '「钱包」页充值。余额为 0 时调用会返回 403。' },
    { n: '04', title: '发第一次请求', desc: '用下面的示例，把 Key 和模型名换成你的。' },
  ];

  return (
    <DocsShell>
      <h1 className="text-display font-bold tracking-tight text-ink">快速开始</h1>
      <p className="mt-3 max-w-2xl text-body leading-relaxed text-ink-mid">
        从零到跑通一次调用，四步。全程不需要装任何 SDK——能发 HTTP 请求就行。
      </p>

      <section id="steps" className="mt-9 scroll-mt-24">
        <h2 className="text-heading font-bold text-ink">四步走</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {steps.map((step) => (
            <div key={step.n} className="rounded-card border border-line bg-white p-4">
              <div className="font-mono text-meta text-brand">{step.n}</div>
              <div className="mt-1 text-body font-semibold text-ink">{step.title}</div>
              <p className="mt-1 text-note leading-relaxed text-ink-mid">{step.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-note text-ink-mid">
          还没有账号？
          <a href={registerUrl} className="ml-1 font-medium text-brand hover:underline">
            去注册 →
          </a>
        </p>
      </section>

      <section id="curl" className="mt-9 scroll-mt-24">
        <h2 className="text-heading font-bold text-ink">curl 调用</h2>
        <p className="mt-2 text-body leading-relaxed text-ink-mid">
          下面用的是 <code className="rounded bg-black/5 px-1 font-mono text-note">{model}</code>，换成任意可用模型都能跑。
        </p>
        <div className="mt-3">
          <CodeBlock label="cURL" code={curl} />
        </div>
      </section>

      <section id="sdk" className="mt-9 scroll-mt-24">
        <h2 className="text-heading font-bold text-ink">SDK 调用</h2>
        <p className="mt-2 text-body leading-relaxed text-ink-mid">
          官方 openai SDK 直接可用，只改 <span className="font-mono text-note">base_url</span> 和 Key 两处。
        </p>
        <div className="mt-3 space-y-3">
          <CodeBlock label="Python" code={python} />
          <CodeBlock label="Node.js" code={node} />
        </div>
      </section>

      <section id="next" className="mt-9 scroll-mt-24">
        <h2 className="text-heading font-bold text-ink">下一步</h2>
        <ul className="mt-3 space-y-2 text-body leading-relaxed text-ink-mid">
          <li>
            <Link href="/docs/protocols" className="text-brand hover:underline">
              协议选择
            </Link>
            ：已有 Claude 或 Gemini 格式的代码，看这里怎么改。
          </li>
          <li>
            <Link href="/docs/chat" className="text-brand hover:underline">
              文本与对话
            </Link>
            ：流式输出、参数说明、响应结构。
          </li>
          <li>
            <Link href="/docs/integrations" className="text-brand hover:underline">
              第三方工具接入
            </Link>
            ：Cherry Studio、NextChat 这类客户端怎么填。
          </li>
        </ul>
      </section>
    </DocsShell>
  );
}
