import { consoleUrl } from '@/lib/brand';
import Link from 'next/link';
import { CodePreview } from './code-preview';

/**
 * 快速开始（2026-11-13 第九版，只挂 /preview/home）
 *
 * 照 teamorouter 的做法：左边给出口，右边直接摆一个能抄的代码窗。
 *
 * 第九版改了三处（参照 teamorouter 的快速开始段）：
 *   ① 左边不再是三条卖点——标题写着「三步接入」，列的却是三个优点，对不上。
 *      换成两张能点的入口卡：看文档 / 去控制台建密钥。
 *      这两件事才是看完代码要干的事；卖点在上面「平台能力」段已经讲过了。
 *   ② 副标题直接写承诺：改一行地址、换一把密钥，代码不用动。
 *   ③ 代码窗加了文件名条和复制按钮（在 code-preview.tsx 里）。
 *
 * 文案一律用站上已有的说法，没有新造宣传语。
 */
export function QuickStartSection() {
  return (
    <section className="pv-sec bg-white">
      <div className="pv-wrap">
        <div className="text-center">
          <h2 className="pv-h2">三步接入，不用重写代码</h2>
          <p className="pv-sub mx-auto max-w-[30em]">改一行地址，换一把密钥，剩下的代码不用动。</p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-start lg:gap-14">
          {/*
            左：两个出口，不是三条卖点。
            参考站这里放「看文档 / 下载客户端」——这一段的作用是告诉人接下来去哪，
            不是再夸一遍产品。我们没有客户端，用「控制台建密钥」占同一个位置。
          */}
          <div className="grid gap-3 lg:sticky lg:top-24">
            {/*
              三步提要：标题写着「三步接入」，就得让人看见三步是哪三步。
              一行放完，不占地方；下面的两张卡正好是第①步和第③步要去的门。
            */}
            <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-[12.5px] text-[#5c7189]">
              <span className="font-semibold text-[#0a74e0]">1</span>
              <span>拿密钥</span>
              <span aria-hidden className="text-[#c2d2e2]">
                →
              </span>
              <span className="font-semibold text-[#0a74e0]">2</span>
              <span>换地址</span>
              <span aria-hidden className="text-[#c2d2e2]">
                →
              </span>
              <span className="font-semibold text-[#0a74e0]">3</span>
              <span>跑一次</span>
            </div>

            <Link
              href="/docs"
              className="group flex items-start gap-3.5 rounded-[10px] border border-[#e4ebf3] px-4 py-4 transition-colors hover:border-[#c9d9e8] hover:bg-[#f8fbfe]"
            >
              <span className="mt-[1px] shrink-0 text-[#33506d] transition-colors group-hover:text-[#0a74e0]">
                <DocsIcon />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-3">
                  <span className="text-[14.5px] font-semibold text-[#06223f]">查看接入文档</span>
                  <span
                    aria-hidden
                    className="text-[13px] text-[#9aabbd] transition-all group-hover:translate-x-0.5 group-hover:text-[#0a74e0]"
                  >
                    →
                  </span>
                </span>
                <span className="mt-1 block text-[12.5px] leading-[1.6] text-[#5c7189]">
                  四种协议的端点、参数与报错说明
                </span>
              </span>
            </Link>

            <a
              href={consoleUrl}
              className="group flex items-start gap-3.5 rounded-[10px] border border-[#e4ebf3] px-4 py-4 transition-colors hover:border-[#c9d9e8] hover:bg-[#f8fbfe]"
            >
              <span className="mt-[1px] shrink-0 text-[#33506d] transition-colors group-hover:text-[#0a74e0]">
                <KeyIcon />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-3">
                  <span className="text-[14.5px] font-semibold text-[#06223f]">去控制台建密钥</span>
                  <span
                    aria-hidden
                    className="text-[13px] text-[#9aabbd] transition-all group-hover:translate-x-0.5 group-hover:text-[#0a74e0]"
                  >
                    →
                  </span>
                </span>
                <span className="mt-1 block text-[12.5px] leading-[1.6] text-[#5c7189]">
                  登进去建一把 Key，回来粘进右边的代码
                </span>
              </span>
            </a>
          </div>

          {/* 右：代码窗。白底卡片，它就是这一段的主角 */}
          <div>
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5c7189]">调用示例</div>
            <div className="overflow-hidden rounded-[10px] border border-[#e4ebf3] bg-white">
              <CodePreview />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DocsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
      aria-hidden
    >
      <path d="M7 3.5h6.5L18 8v12.2a.3.3 0 0 1-.3.3H7a.3.3 0 0 1-.3-.3V3.8a.3.3 0 0 1 .3-.3Z" />
      <path d="M13.4 3.7V8.1H18" />
      <path d="M9.6 12.2h4.8M9.6 15.6h4.8" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
      aria-hidden
    >
      <circle cx="8.6" cy="8.6" r="3.7" />
      <path d="M11.2 11.2 19.2 19.2M15.8 15.8l1.9-1.9M18.2 18.2l1.3-1.3" />
    </svg>
  );
}
