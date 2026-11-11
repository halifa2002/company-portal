import Link from 'next/link';
import { CodeBlock } from '@/components/code-block';
import { DocsShell } from '@/components/docs-shell';
import { apiBase } from '@/lib/brand';
import { MODEL_CATALOG } from '@/lib/model-catalog';
import { loadModelList } from '@/lib/pricing';

export const metadata = { title: '文本与对话' };

const PARAMS = [
  { name: 'model', type: 'string', required: '是', note: '模型 ID，取值见模型广场' },
  { name: 'messages', type: 'array', required: '是', note: '消息数组，role 支持 system / user / assistant' },
  { name: 'stream', type: 'boolean', required: '否', note: '是否流式返回，默认 false' },
  { name: 'max_tokens', type: 'integer', required: '否', note: '最大输出长度，不能超过模型输出上限' },
  { name: 'temperature', type: 'number', required: '否', note: '采样温度 0–2，越大越随机' },
  { name: 'top_p', type: 'number', required: '否', note: '核采样，和 temperature 二选一调整' },
  { name: 'tools', type: 'array', required: '否', note: '工具定义，格式同 OpenAI 函数调用' },
];

/** 文本与对话：一个端点的完整用法 */
export default async function ChatPage() {
  const { models } = await loadModelList(MODEL_CATALOG);
  const model = models[0]?.id ?? 'deepseek-flash';

  const request = [
    `POST ${apiBase}/v1/chat/completions`,
    'Authorization: Bearer <你的 API Key>',
    'Content-Type: application/json',
    '',
    '{',
    `  "model": "${model}",`,
    '  "messages": [',
    '    { "role": "system", "content": "你是一个简洁的助手" },',
    '    { "role": "user", "content": "用一句话解释什么是 API 网关" }',
    '  ],',
    '  "temperature": 0.7,',
    '  "stream": false',
    '}',
  ].join('\n');

  const response = [
    '{',
    '  "id": "chatcmpl-xxxx",',
    '  "object": "chat.completion",',
    '  "model": "' + model + '",',
    '  "choices": [',
    '    {',
    '      "index": 0,',
    '      "message": { "role": "assistant", "content": "API 网关是统一入口……" },',
    '      "finish_reason": "stop"',
    '    }',
    '  ],',
    '  "usage": { "prompt_tokens": 42, "completion_tokens": 128, "total_tokens": 170 }',
    '}',
  ].join('\n');

  const streamCurl = [
    `curl -N ${apiBase}/v1/chat/completions \\`,
    '  -H "Authorization: Bearer $API_KEY" \\',
    '  -H "Content-Type: application/json" \\',
    "  -d '{",
    `    \"model\": \"${model}\",`,
    '    "messages": [{"role": "user", "content": "你好"}],',
    '    "stream": true',
    "  }'",
    '',
    '# 返回是一串 SSE 事件，每个 data: 后面是一小块增量',
    '# data: {"choices":[{"delta":{"content":"你"}}]}',
    '# data: [DONE]',
  ].join('\n');

  return (
    <DocsShell>
      <h1 className="text-3xl font-bold tracking-tight text-ink">文本与对话</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-mid">
        当前平台的全部模型都通过这一个接口调用。请求体与 OpenAI 的对话接口一致，
        换成你自己的 Key 就能直接跑。
      </p>

      <section id="endpoint" className="mt-9 scroll-mt-24">
        <h2 className="text-xl font-bold text-ink">接口</h2>
        <div className="mt-3 overflow-hidden rounded-xl border border-black/5">
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="w-28 bg-surface-tint px-4 py-2.5 text-xs text-ink-mid">方法</td>
                <td className="px-4 py-2.5 font-mono text-[13px] text-brand">POST</td>
              </tr>
              <tr className="border-t border-black/5">
                <td className="bg-surface-tint px-4 py-2.5 text-xs text-ink-mid">地址</td>
                <td className="px-4 py-2.5 font-mono text-[13px] text-ink">{apiBase}/v1/chat/completions</td>
              </tr>
              <tr className="border-t border-black/5">
                <td className="bg-surface-tint px-4 py-2.5 text-xs text-ink-mid">模型清单</td>
                <td className="px-4 py-2.5 font-mono text-[13px] text-ink">GET {apiBase}/v1/models</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="params" className="mt-9 scroll-mt-24">
        <h2 className="text-xl font-bold text-ink">请求参数</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-mid">
          下面是最常用的几个，其余 OpenAI 同名参数同样支持。
        </p>
        <div className="mt-3 overflow-x-auto rounded-xl border border-black/5">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="bg-surface-tint text-left text-xs text-ink-mid">
                <th className="px-4 py-2.5 font-medium">参数</th>
                <th className="px-4 py-2.5 font-medium">类型</th>
                <th className="px-4 py-2.5 font-medium">必填</th>
                <th className="px-4 py-2.5 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              {PARAMS.map((row) => (
                <tr key={row.name} className="border-t border-black/5">
                  <td className="px-4 py-2.5 font-mono text-[12.5px] text-ink">{row.name}</td>
                  <td className="px-4 py-2.5 text-xs text-ink-mid">{row.type}</td>
                  <td className="px-4 py-2.5 text-xs text-ink-mid">{row.required}</td>
                  <td className="px-4 py-2.5 text-xs leading-relaxed text-ink-mid">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <CodeBlock label="完整请求" code={request} />
        </div>
      </section>

      <section id="response" className="mt-9 scroll-mt-24">
        <h2 className="text-xl font-bold text-ink">响应结构</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-mid">
          <span className="font-mono text-[13px]">usage</span> 里的 token 数就是计费依据，
          和消费记录里的数字一致。
        </p>
        <div className="mt-3">
          <CodeBlock label="响应 JSON" code={response} />
        </div>
      </section>

      <section id="stream" className="mt-9 scroll-mt-24">
        <h2 className="text-xl font-bold text-ink">流式输出</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-mid">
          传 <span className="font-mono text-[13px]">stream: true</span>，服务端按 SSE
          逐块返回，最后一条是 <span className="font-mono text-[13px]">data: [DONE]</span>。
        </p>
        <div className="mt-3">
          <CodeBlock label="流式调用" code={streamCurl} />
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-ink-mid">
          出错时的处理方式见
          <Link href="/docs/errors" className="mx-1 text-brand hover:underline">
            错误码
          </Link>
          页。
        </p>
      </section>
    </DocsShell>
  );
}
