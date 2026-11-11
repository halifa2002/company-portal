import Link from 'next/link';
import { DocsShell } from '@/components/docs-shell';
import { apiBase } from '@/lib/brand';

export const metadata = { title: '协议选择' };

const TOC = [
  { id: 'four', label: '四种协议' },
  { id: 'choose', label: '怎么选' },
  { id: 'caveat', label: '用之前要确认' },
];

const PROTOCOLS = [
  {
    name: 'OpenAI 对话',
    path: '/v1/chat/completions',
    base: `${apiBase}/v1`,
    when: '新项目首选。SDK 生态最全，示例最多。',
  },
  {
    name: 'Claude Messages',
    path: '/v1/messages',
    base: `${apiBase}`,
    when: '已有 Anthropic SDK 代码，不想重写调用层。',
  },
  {
    name: 'OpenAI Responses',
    path: '/v1/responses',
    base: `${apiBase}/v1`,
    when: '想用较新的对话式接口，或需要服务端托管会话。',
  },
  {
    name: 'Gemini',
    path: '/v1beta/models/{model}:generateContent',
    base: `${apiBase}`,
    when: '已有 Gemini SDK 代码，或团队习惯 Google 那套。',
  },
];

/** 协议选择：同一个网关收四种格式，选一个能跑通的就行 */
export default function ProtocolsPage() {
  return (
    <DocsShell toc={TOC}>
      <h1 className="text-3xl font-bold tracking-tight text-ink">协议选择</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-mid">
        同一个网关同时收四种接口格式，请求发到哪个路径，就走哪套协议。你的代码原来用什么，就继续用什么——只要那把上游通道支持这种格式。
      </p>

      <section id="four" className="mt-9 scroll-mt-24">
        <h2 className="text-xl font-bold text-ink">四种协议</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-black/5">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="bg-surface-tint text-left text-xs text-ink-mid">
                <th className="px-4 py-2.5 font-medium">协议</th>
                <th className="px-4 py-2.5 font-medium">路径</th>
                <th className="px-4 py-2.5 font-medium">base_url</th>
                <th className="px-4 py-2.5 font-medium">什么时候用</th>
              </tr>
            </thead>
            <tbody>
              {PROTOCOLS.map((item) => (
                <tr key={item.path} className="border-t border-black/5">
                  <td className="px-4 py-2.5 text-[13px] font-medium text-ink">{item.name}</td>
                  <td className="px-4 py-2.5 font-mono text-[12.5px] text-brand">{item.path}</td>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-ink-mid">{item.base}</td>
                  <td className="px-4 py-2.5 text-[12.5px] leading-relaxed text-ink-mid">{item.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="choose" className="mt-9 scroll-mt-24">
        <h2 className="text-xl font-bold text-ink">怎么选</h2>
        <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-ink-mid">
          <li>
            <span className="font-medium text-ink">新写的代码</span>：用 OpenAI 对话格式。文档、示例、第三方客户端都最多。
          </li>
          <li>
            <span className="font-medium text-ink">已有的代码</span>：别改。把 base_url 指过来就行——SDK 自己会拼路径。
          </li>
          <li>
            <span className="font-medium text-ink">同一个项目里混用</span>：可以，但没必要。四套格式底层走的是同一批模型，混用只会增加排查成本。
          </li>
        </ul>
      </section>

      <section id="caveat" className="mt-9 scroll-mt-24">
        <h2 className="text-xl font-bold text-ink">用之前要确认</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-mid">
          网关本身四种都收，但<b className="text-ink">能不能跑通，取决于后面对接的上游通道支持哪种格式</b>。当前接入的通道是 OpenAI 兼容协议，所以对话格式最稳；另外三种在接入对应协议的上游之后才能用。
        </p>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-mid">
          发过去返回 503（模型不可用）或 400（格式不认），通常就是这类原因，不是你的代码写错了。换回
          <code className="mx-1 rounded bg-black/5 px-1 font-mono text-[12.5px]">/v1/chat/completions</code>
          先验证 Key 和余额是否正常。
        </p>
        <p className="mt-3 text-[13px] text-ink-mid">
          具体路径与可用状态见
          <Link href="/docs/api" className="mx-1 text-brand hover:underline">
            接口速查
          </Link>
          。
        </p>
      </section>
    </DocsShell>
  );
}
