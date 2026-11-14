import Link from 'next/link';
import { registerUrl } from '@/lib/brand';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';

/**
 * S8：常见问题（2026-11-14 改版：去掉圆角卡片，换成细线列表）
 *
 * 上一版每条是一个圆角白卡 + 数字圆徽 + 圆形加号，做出来"卡片感"太重——
 * 五个圆角框叠在一起，一眼就是模板/AI 生成的页面。参考站的写法更克制：
 * **只有一行行标题 + 虚线分隔 + 右侧一个小箭头**，没有框、没有数字、没有填充底色。
 * 这一版照那个做：
 *   - 行间用 1px 虚线（`border-dashed`），第一条上边也有，形成表格感；
 *   - 问句 16px 中黑，答句 14px 灰；
 *   - 展开标记换成细箭头（打开旋转 180°），不再是"加号变叉"；
 *   - 整块背景去掉渐变装饰，就是白底。
 *
 * 用原生 <details> 而不是 JS 折叠：这一屏没有状态逻辑，不值得为它多背一份 client bundle；
 * 键盘与屏幕阅读器也天然可用。
 *
 * 五条答案沿用 /docs/faq 里已经核过的口径，不在这里另写一套——
 * 首页与文档对同一个问题给两种答案，比没有答案更糟。
 */

const FAQ = [
  {
    q: '第一次调用要从哪开始？',
    a: '登录控制台，在「API 密钥」页新建一个 Key；把代码里的 base_url 指向本平台、api_key 换成平台密钥，其余参数不用动。照着快速开始走一遍大约十分钟。',
  },
  {
    q: '平台怎么计费？',
    a: '按 token 计费，输入和输出分开计价，部分模型分时段。费用按调用发生时的价格结算，调价不会回头改旧账。单价以价格页为准。',
  },
  {
    q: 'API Key 怎么保证安全？',
    a: '完整的 Key 只在创建时显示一次，之后只保留前缀；服务端加密保存，不再回传明文。建议按项目或环境分开建 Key，某一把泄露只删那一把，不影响其他业务。',
  },
  {
    q: '已经有 OpenAI 的代码，要改多少？',
    a: '只改两处：base_url 和 api_key。SDK、请求参数、调用方式都不用改；模型名用平台上的即可。',
  },
  {
    q: '调用报错了先看哪里？',
    a: '401 是 Key 有问题，403 是余额不足，429 是被限流，503 是模型不可用。逐个状态码对照错误码页，能直接定位到原因。',
  },
];

export function Faq() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto w-full max-w-[1280px] px-6 md:px-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-20">
          {/* 左：标题与出口 */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <SectionEyebrow>帮助</SectionEyebrow>
            <h2
              className="mt-4 font-bold tracking-tight text-ink"
              style={{ fontSize: 'clamp(30px, 2.8vw, 44px)', lineHeight: 1.18 }}
            >
              常见问题
            </h2>
            <p className="mt-4 text-note leading-relaxed text-ink-mid">
              接入前后最常被问到的几件事，答的都是平台现在实际的做法。
            </p>
            {/* 两个出口做成方框按钮（2026-11-14）：之前是两行蓝色文字链接，
             * 用户要求"蓝色的要是方框按钮"。按全站按钮口径：rounded-none 直角，
             * 次按钮蓝描边白底、主按钮填充品牌蓝；不用圆角胶囊。 */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/docs/faq"
                className="inline-flex h-10 items-center gap-1.5 rounded-none border border-ink/25 bg-white px-4 text-meta font-medium text-ink transition-colors hover:border-ink/50 hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              >
                查看全部问题
                <span aria-hidden>→</span>
              </Link>
              <Link
                href={registerUrl}
                className="inline-flex h-10 items-center rounded-none bg-ink px-4 text-meta font-medium text-white transition-colors hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              >
                直接注册
              </Link>
            </div>
            <p className="mt-3 text-meta text-ink-muted">还没有账号？注册后即可创建 Key。</p>
          </div>

          {/* 右：细线列表（原生 details，无 JS） */}
          <div>
            {FAQ.map((item) => (
              <details key={item.q} className="group border-b border-dashed border-neutral-400 first:border-t">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 marker:hidden [&::-webkit-details-marker]:hidden">
                  <span className="text-[16.5px] font-medium text-ink transition-colors group-hover:text-brand-700">
                    {item.q}
                  </span>
                  <span
                    aria-hidden
                    className="flex h-5 w-5 shrink-0 items-center justify-center text-ink-muted transition-transform duration-200 group-open:rotate-180"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </summary>
                <div className="pb-5 pr-10">
                  <p className="text-note leading-relaxed text-ink-mid">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}



