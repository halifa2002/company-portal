import Link from 'next/link';
import { DocsShell } from '@/components/docs-shell';
import { apiBase } from '@/lib/brand';

export const metadata = { title: '接口速查' };

const TOC = [
  { id: 'routes', label: '全部路由' },
  { id: 'status', label: '可用状态说明' },
  { id: 'limits', label: '频率与超时' },
];

type Row = {
  method: string;
  path: string;
  desc: string;
  status: 'ready' | 'depends' | 'off';
};

const ROUTES: Row[] = [
  { method: 'POST', path: '/v1/chat/completions', desc: '对话补全，支持流式与工具调用', status: 'ready' },
  { method: 'GET', path: '/v1/models', desc: '查询当前可用模型清单', status: 'ready' },
  { method: 'POST', path: '/v1/completions', desc: '旧版文本补全，只为兼容老代码', status: 'ready' },
  { method: 'POST', path: '/v1/messages', desc: 'Claude 格式的对话接口', status: 'depends' },
  { method: 'POST', path: '/v1/responses', desc: 'OpenAI Responses 格式', status: 'depends' },
  { method: 'POST', path: '/v1beta/models/{model}:generateContent', desc: 'Gemini 格式', status: 'depends' },
  { method: 'POST', path: '/v1/embeddings', desc: '文本向量', status: 'off' },
  { method: 'POST', path: '/v1/rerank', desc: '结果重排', status: 'off' },
  { method: 'POST', path: '/v1/images/generations', desc: '图像生成', status: 'off' },
  { method: 'POST', path: '/v1/audio/speech', desc: '语音合成', status: 'off' },
];

const STATUS_TEXT: Record<Row['status'], { label: string; cls: string }> = {
  ready: { label: '可直接用', cls: 'border-ok/30 bg-ok/5 text-ok' },
  depends: { label: '视渠道而定', cls: 'border-warn/30 bg-warn/5 text-warn' },
  off: { label: '暂未开放', cls: 'border-black/10 bg-black/[0.03] text-ink-muted' },
};

/** 接口速查：一张表说清网关有哪些路由、哪些现在就能用 */
export default function ApiPage() {
  return (
    <DocsShell toc={TOC}>
      <h1 className="text-3xl font-bold tracking-tight text-ink">接口速查</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-mid">
        网关开放的接口一览。所有路径都拼在 <span className="font-mono text-[13px] text-brand">{apiBase}</span> 后面，
        鉴权统一用 <span className="font-mono text-[13px]">Authorization: Bearer</span>。
      </p>

      <section id="routes" className="mt-9 scroll-mt-24">
        <h2 className="text-xl font-bold text-ink">全部路由</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-black/5">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="bg-surface-tint text-left text-xs text-ink-mid">
                <th className="px-4 py-2.5 font-medium">方法</th>
                <th className="px-4 py-2.5 font-medium">路径</th>
                <th className="px-4 py-2.5 font-medium">说明</th>
                <th className="px-4 py-2.5 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {ROUTES.map((row) => {
                const status = STATUS_TEXT[row.status];
                return (
                  <tr key={row.path} className="border-t border-black/5">
                    <td className="px-4 py-2.5 font-mono text-xs text-brand">{row.method}</td>
                    <td className="px-4 py-2.5 font-mono text-[12.5px] text-ink">{row.path}</td>
                    <td className="px-4 py-2.5 text-[12.5px] text-ink-mid">{row.desc}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block rounded border px-2 py-0.5 text-[11.5px] ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section id="status" className="mt-9 scroll-mt-24">
        <h2 className="text-xl font-bold text-ink">可用状态说明</h2>
        <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-ink-mid">
          <li>
            <span className="font-medium text-ink">可直接用</span>：现在就能调通，有可用渠道。
          </li>
          <li>
            <span className="font-medium text-ink">视渠道而定</span>：网关会收下这种格式，能不能跑通取决于后面对接的上游通道是否支持该协议。调用前建议先用对话接口验证 Key 与余额。
          </li>
          <li>
            <span className="font-medium text-ink">暂未开放</span>：路由已经在，但还没有接入对应的模型渠道，现在调用会返回模型不可用。等能力上线后这里会改成可用。
          </li>
        </ul>
      </section>

      <section id="limits" className="mt-9 scroll-mt-24">
        <h2 className="text-xl font-bold text-ink">频率与超时</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-mid">
          平台侧目前没有对调用频率设固定上限，正常业务量不会被拦。遇到 429，基本是上游模型服务商在限流，处理方式是按指数退避重试。
        </p>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-mid">
          单次请求的超时取决于上游，长文本生成建议改用流式输出并在客户端放宽超时。批量任务请自行控制并发，别把账户打满。
        </p>
        <p className="mt-3 text-[13px] text-ink-mid">
          错误处理细节见
          <Link href="/docs/errors" className="mx-1 text-brand hover:underline">
            错误码
          </Link>
          ；各协议的调用方式见
          <Link href="/docs/protocols" className="mx-1 text-brand hover:underline">
            协议选择
          </Link>
          。
        </p>
      </section>
    </DocsShell>
  );
}
