import Link from 'next/link';
import { CodeBlock } from '@/components/code-block';
import { DocsShell } from '@/components/docs-shell';

export const metadata = { title: 'API Key 与认证' };

const TOC = [
  { id: 'header', label: '怎么带 Key' },
  { id: 'manage', label: 'Key 的生命周期' },
  { id: 'security', label: '安全建议' },
];

/** 认证：一个 Header、一把 Key，没有别的花样 */
export default function AuthPage() {
  return (
    <DocsShell toc={TOC}>
      <h1 className="text-3xl font-bold tracking-tight text-ink">API Key 与认证</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-mid">
        所有请求都用一个 HTTP Header 鉴权，没有签名、没有时间戳、没有额外参数。
      </p>

      <section id="header" className="mt-9 scroll-mt-24">
        <h2 className="text-xl font-bold text-ink">怎么带 Key</h2>
        <div className="mt-3">
          <CodeBlock
            label="请求头"
            code={'Authorization: Bearer sk-你的Key\nContent-Type: application/json'}
          />
        </div>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-mid">
          Key 缺失、格式不对、已被删除，都会返回 <span className="font-mono text-[13px]">401</span>。
        </p>
      </section>

      <section id="manage" className="mt-9 scroll-mt-24">
        <h2 className="text-xl font-bold text-ink">Key 的生命周期</h2>
        <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-ink-mid">
          <li>
            <span className="font-medium text-ink">创建</span>：控制台「API 密钥」→ 新建。名称自己取，用于区分用途（比如「线上」「测试」）。
          </li>
          <li>
            <span className="font-medium text-ink">可见性</span>：完整 Key 只在创建时完整显示一次，之后列表里是打码的。丢了就重建，找不回来。
          </li>
          <li>
            <span className="font-medium text-ink">限额</span>：单个 Key 可以设额度上限和过期时间。给客户端用的 Key 建议设上限，避免一把钥匙刷穿账户。
          </li>
          <li>
            <span className="font-medium text-ink">停用</span>：在列表里切到「已禁用」，即时生效；删除则不可恢复。
          </li>
        </ul>
      </section>

      <section id="security" className="mt-9 scroll-mt-24">
        <h2 className="text-xl font-bold text-ink">安全建议</h2>
        <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-ink-mid">
          <li>不要把 Key 写进前端代码或提交到 Git 仓库——它等同于你的账户余额。</li>
          <li>服务端调用时从环境变量读，别硬编码。</li>
          <li>一把 Key 只给一个用途，出问题时能单独停用，不影响其他业务。</li>
          <li>怀疑泄露就立刻在控制台删除该 Key，重新生成一把。</li>
        </ul>
        <p className="mt-4 text-[13px] text-ink-mid">
          返回 401 时怎么排查，见
          <Link href="/docs/errors" className="mx-1 text-brand hover:underline">
            错误码
          </Link>
          页。
        </p>
      </section>
    </DocsShell>
  );
}
