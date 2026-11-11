import Link from 'next/link';
import { CodeBlock } from '@/components/code-block';
import { DocsShell } from '@/components/docs-shell';

export const metadata = { title: '错误码' };

const TOC = [
  { id: 'shape', label: '返回体结构' },
  { id: 'codes', label: '状态码' },
  { id: 'retry', label: '该怎么重试' },
];

const CODES = [
  {
    code: '401',
    name: '认证失败',
    cause: 'Key 缺失、打错、已被删除，或这把 Key 自己的额度用完了。',
    fix: '检查 Authorization 头是否以 Bearer 开头、Key 是否最新；再看这把 Key 的额度是否已耗尽。',
  },
  {
    code: '403',
    name: '余额不足',
    cause: '账户余额不足以支付本次调用。',
    fix: '控制台「钱包」充值后重试。',
  },
  {
    code: '404',
    name: '路径不对',
    cause: '请求地址拼错，比如少了 /v1 或路径大小写不符。',
    fix: '对照接口速查页的路径重拼。',
  },
  {
    code: '429',
    name: '被限流',
    cause: '平台侧或上游模型服务商返回了频率限制。',
    fix: '降低并发，按指数退避重试（1s、2s、4s…）。',
  },
  {
    code: '503',
    name: '模型不可用',
    cause: '模型名写错，或该模型当前没有可用渠道。',
    fix: '核对模型 ID 是否与模型广场一致；换一个模型试试。',
  },
];

/** 错误码：返回体长什么样、每个码什么毛病、该不该重试 */
export default function ErrorsPage() {
  const shape = [
    '{',
    '  "error": {',
    '    "message": "令牌额度不足",',
    '    "type": "insufficient_user_quota"',
    '  }',
    '}',
  ].join('\n');

  return (
    <DocsShell toc={TOC}>
      <h1 className="text-3xl font-bold tracking-tight text-ink">错误码</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-mid">
        出错时返回的不是 HTML 页面，是下面这种 JSON。判断依据优先看 HTTP 状态码，
        <span className="font-mono text-[13px]"> type </span>字段用来区分同一状态码下的不同原因。
      </p>

      <section id="shape" className="mt-9 scroll-mt-24">
        <h2 className="text-xl font-bold text-ink">返回体结构</h2>
        <div className="mt-3">
          <CodeBlock label="错误响应" code={shape} />
        </div>
        <ul className="mt-3 space-y-1.5 text-[13.5px] leading-relaxed text-ink-mid">
          <li>
            <span className="font-mono text-[12.5px] text-ink">message</span>：给人看的中文说明，可以直接展示给用户。
          </li>
          <li>
            <span className="font-mono text-[12.5px] text-ink">type</span>：给程序判断的英文标识，代码里按它分支比按 message 判断稳。
          </li>
        </ul>
      </section>

      <section id="codes" className="mt-9 scroll-mt-24">
        <h2 className="text-xl font-bold text-ink">状态码</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-black/5">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="bg-surface-tint text-left text-xs text-ink-mid">
                <th className="px-4 py-2.5 font-medium">状态码</th>
                <th className="px-4 py-2.5 font-medium">含义</th>
                <th className="px-4 py-2.5 font-medium">常见原因</th>
                <th className="px-4 py-2.5 font-medium">怎么办</th>
              </tr>
            </thead>
            <tbody>
              {CODES.map((row) => (
                <tr key={row.code} className="border-t border-black/5 align-top">
                  <td className="px-4 py-3 font-mono text-[13px] text-brand">{row.code}</td>
                  <td className="px-4 py-3 text-[13px] font-medium text-ink">{row.name}</td>
                  <td className="px-4 py-3 text-[12.5px] leading-relaxed text-ink-mid">{row.cause}</td>
                  <td className="px-4 py-3 text-[12.5px] leading-relaxed text-ink-mid">{row.fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="retry" className="mt-9 scroll-mt-24">
        <h2 className="text-xl font-bold text-ink">该怎么重试</h2>
        <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-ink-mid">
          <li>
            <span className="font-medium text-ink">4xx 不要重试</span>：401、403、404 重试多少次都一样，先修问题。
          </li>
          <li>
            <span className="font-medium text-ink">429 要退避</span>：间隔拉长再试，别原地狂刷，会把限流时间越拖越长。
          </li>
          <li>
            <span className="font-medium text-ink">503 可以换模型</span>：多半是那个模型暂时没有可用渠道，换一个能继续干活。
          </li>
          <li>
            <span className="font-medium text-ink">超时同理</span>：长文本请求建议放宽客户端超时，并配合流式输出，避免一直等首字节。
          </li>
        </ul>
        <p className="mt-4 text-[13px] text-ink-mid">
          关于当前的频率限制策略，见
          <Link href="/docs/api" className="mx-1 text-brand hover:underline">
            接口速查
          </Link>
          页底部的说明。
        </p>
      </section>
    </DocsShell>
  );
}
