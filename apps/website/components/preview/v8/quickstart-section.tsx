import Link from 'next/link';
import { registerUrl } from '@/lib/brand';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';
import { ProtocolTabs } from './protocol-tabs';

/**
 * 快速开始（v9，2026-11-14 从首屏下方挪到价格区之后）
 *
 * 为什么挪：首屏刚讲完「一个网关、一套接入」，紧接着又摆一坨 tab + 代码，
 * 等于第一屏还没消化就开始给作业——参考站也是把它放在「先看清能买什么」之后。
 * 现在它在价格表下面，读者已经知道有哪些模型、什么价，才需要「怎么调」。
 *
 * 版式照参考站的「快速开始」：居中标题 + 一句副标，下面左右两栏——
 *   左：这段能干什么 + 两个入口卡片（文档 / 控制台）
 *   右：协议与语言切换 + 端点 + 可复制的代码（ProtocolTabs 的 paths 变体）
 *
 * 与后面那块深色的「三步接入」是两件事，不重复：
 *   这里回答「代码怎么写」，深色那块回答「要按什么顺序做什么」。
 */

function DocIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v16H6.5A2.5 2.5 0 0 0 4 21.5V5.5Z" />
      <path d="M8 7h7M8 11h7" />
    </svg>
  );
}

function ConsoleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m7 10 3 2-3 2M13 14h4" />
    </svg>
  );
}

function EntryCard(props: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={props.href}
      className="group flex items-start gap-3 rounded-[6px] border border-line bg-white p-4 transition-colors hover:border-ink/25 hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-surface-subtle text-ink-mid">
        {props.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-3">
          <span className="text-note font-medium text-ink">{props.title}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5"
          >
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </span>
        <span className="mt-1 block text-meta leading-relaxed text-ink-muted">{props.desc}</span>
      </span>
    </Link>
  );
}

export function QuickStartSection() {
  return (
    <section id="quickstart" className="border-b border-line surface-neutral">
      <div className="mx-auto w-full max-w-[1280px] px-6 py-16 md:px-10 md:py-20">
        {/* 2026-11-14 第三版：不再居中摆一个小标题，改成与全站其它屏同一套「眉标 + 大标题 + 右侧说明」。
         * 居中标题在这页是异类——其它十二屏都是左对齐大字，只有它居中且字号小一号，扫下来会以为它不是一级栏目。
         * 眉标「快速开始」负责分类，大标题换成一句能立住的判断（改一行地址就能跑），右侧放具体说明。 */}
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] md:items-end md:gap-12">
          <div>
            <SectionEyebrow>快速开始</SectionEyebrow>
            <h2
              className="mt-4 text-balance font-bold tracking-tight text-ink"
              style={{ fontSize: 'clamp(32px, 3vw, 52px)', lineHeight: 1.2 }}
            >
              协议兼容，迁移只改接入地址
            </h2>
          </div>
          <p className="text-note leading-relaxed text-ink-mid md:pb-1.5">
            换掉 <code className="font-mono text-ink">base_url</code> 与 Key，模型名换成我们接的任意一个；
            OpenAI / Claude / Gemini 三种写法共用这一套地址。
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,760px)] lg:items-start lg:gap-14">
          {/* 左：这段能干什么 + 两个入口 */}
          <div className="space-y-5">
            <p className="text-note leading-relaxed text-ink-mid">
              同样的 SDK、同样的请求体：只有地址和密钥换成平台的，模型名换成我们接的任意一个。
              国内直连，不用为每家厂商各写一套适配。
            </p>
            <div className="space-y-3">
              <EntryCard
                href="/docs/quickstart"
                icon={<DocIcon />}
                title="查看 API 文档"
                desc="协议差异、请求参数、错误码与限流说明"
              />
              <EntryCard
                href={registerUrl}
                icon={<ConsoleIcon />}
                title="进入控制台创建 Key"
                desc="注册后即可新建密钥，用量与账单同页查看"
              />
            </div>

            {/* 能直接指过来的客户端：和首屏路由图右侧是同一批，这里给文字版 */}
            <div className="pt-1">
              <p className="text-meta text-ink-muted">同样适用于这些工具，填同一个地址即可</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {['Claude Code', 'Codex', 'Cursor', 'Cherry Studio', 'Chatbox', 'Dify'].map(
                  (client) => (
                    <li
                      key={client}
                      className="rounded-full border border-line bg-white px-2.5 py-1 text-meta text-ink-mid"
                    >
                      {client}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>

          {/* 右：协议 / 语言 / 端点 / 代码 */}
          <div>
            <ProtocolTabs variant="paths" />
            {/* 收口一句：和参考站一样，把「动手要改什么」再说一遍，代码区下面不留白 */}
            <p className="mt-3 text-meta leading-relaxed text-ink-muted">
              把 base_url 指向这一行、填入你的 API Key，其余代码保持不变。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

