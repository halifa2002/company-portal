import Link from 'next/link';
import { DocsShell } from '@/components/docs-shell';
import { apiBase } from '@/lib/brand';

export const metadata = { title: '第三方工具接入' };

const TOC = [
  { id: 'common', label: '通用三件事' },
  { id: 'clients', label: '常见客户端' },
  { id: 'pitfalls', label: '容易填错的三个地方' },
];

const CLIENTS = [
  {
    name: 'Cherry Studio',
    fields: [
      ['服务商类型', 'OpenAI（兼容）'],
      ['API 地址', `${apiBase}/v1`],
      ['API Key', '控制台创建的 Key'],
      ['模型', '手动填模型 ID，例如 deepseek-flash'],
    ],
  },
  {
    name: 'NextChat / ChatGPT-Next-Web',
    fields: [
      ['接口地址', `${apiBase}`],
      ['自定义接口', '开启'],
      ['API Key', '同上'],
      ['模型', '自定义模型名，多个用逗号分隔'],
    ],
  },
  {
    name: 'CC Switch / 其他代理工具',
    fields: [
      ['Base URL', `${apiBase}/v1`],
      ['Auth Token', '同上'],
      ['模型映射', '把原模型名映射到平台模型 ID'],
    ],
  },
];

/** 第三方工具接入：其实就三个空要填 */
export default function IntegrationsPage() {
  return (
    <DocsShell toc={TOC}>
      <h1 className="text-3xl font-bold tracking-tight text-ink">第三方工具接入</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-mid">
        所有 OpenAI 兼容的客户端、插件、IDE 都能接。要填的就是三个空：地址、Key、模型名。
      </p>

      <section id="common" className="mt-9 scroll-mt-24">
        <h2 className="text-xl font-bold text-ink">通用三件事</h2>
        <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-ink-mid">
          <li>
            <span className="font-medium text-ink">接口地址</span>：填 <span className="font-mono text-[13px]">{apiBase}/v1</span>。
            少数工具只要域名（不带 /v1），按它的输入框提示判断。
          </li>
          <li>
            <span className="font-medium text-ink">API Key</span>：控制台「API 密钥」里创建，以 <span className="font-mono text-[13px]">sk-</span> 开头。
          </li>
          <li>
            <span className="font-medium text-ink">模型名</span>：必须写平台的模型 ID（如 <span className="font-mono text-[13px]">deepseek-flash</span>），
            不能写「DeepSeek V4 Pro」这种展示名。
          </li>
        </ul>
      </section>

      <section id="clients" className="mt-9 scroll-mt-24">
        <h2 className="text-xl font-bold text-ink">常见客户端</h2>
        <div className="mt-3 space-y-3">
          {CLIENTS.map((client) => (
            <div key={client.name} className="rounded-xl border border-black/5 bg-white p-4">
              <div className="text-sm font-semibold text-ink">{client.name}</div>
              <dl className="mt-2 divide-y divide-black/[0.04] text-[13px]">
                {client.fields.map(([label, value]) => (
                  <div key={label} className="flex gap-4 py-1.5">
                    <dt className="w-24 shrink-0 text-ink-muted">{label}</dt>
                    <dd className="font-mono text-[12.5px] text-ink-mid">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[13px] text-ink-mid">
          其他客户端字段名可能不同，但本质一样：把 base_url 指到上面的地址，把 Key 填进去，模型名用平台 ID。
        </p>
      </section>

      <section id="pitfalls" className="mt-9 scroll-mt-24">
        <h2 className="text-xl font-bold text-ink">容易填错的三个地方</h2>
        <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-ink-mid">
          <li>
            <span className="font-medium text-ink">地址多写了 /v1</span>：有的工具会自动补 /v1，再填一遍就变成 <span className="font-mono text-[12.5px]">/v1/v1</span>，直接 404。
          </li>
          <li>
            <span className="font-medium text-ink">模型名写成展示名</span>：客户端下拉里没有我们的模型时会让你手填，填「DeepSeek V4 Pro」会 503，要填 <span className="font-mono text-[12.5px]">deepseek-v4-pro</span>。
          </li>
          <li>
            <span className="font-medium text-ink">Key 带空格</span>：复制时容易带上首尾空格，几乎必然 401。
          </li>
        </ul>
        <p className="mt-4 text-[13px] text-ink-mid">
          模型 ID 的完整清单见
          <Link href="/models" className="mx-1 text-brand hover:underline">
            模型广场
          </Link>
          。
        </p>
      </section>
    </DocsShell>
  );
}
