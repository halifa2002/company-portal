import Link from 'next/link';
import { registerUrl } from '@/lib/brand';
import { buttonStyles } from '@/components/ui/button';

/**
 * S9：收尾 CTA（2026-11-14 改版式，文案一个字没动）
 *
 * 正式版页尾原来是一块推销区（大标语 + 两个大按钮），后来因为「跟上面三步接入喊同一件事」
 * 被换成了 FAQ。v8 的处理是：FAQ 之后只留一条窄带，一句话 + 一个主按钮 + 三条事实，
 * 不再重复「三步」的内容，只回答「现在能不能马上开始」。
 *
 * 2026-11-14 只改**样式/背景/排版**，内容不动（用户明确要求）：
 *   - 从「左文右按钮」的窄带改成**居中收口**：大标语 → 一句副标 → 两个按钮 → 一行事实；
 *   - 背景换成 AI 云图二次加工的底图 + 均匀网点（.closing-canvas / .closing-dots）；
 *   - 标语里的「第一个请求」上品牌蓝，呼应首屏那句「一个网关 / 一套接入」的高亮规则；
 *     蓝是全站唯一强调色（C-V-03），这块底雾里的暖色只做背景，不做任何可交互元素的颜色。
 */

const FACTS = ['按量计费', '无最低消费', '余额随时充', '每笔可对到具体请求'];

export function ClosingCta() {
  return (
    <section className="relative overflow-hidden border-t border-line">
      {/* 背景：AI 底图 + 均匀网点，两层都 pointer-events-none */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="closing-canvas absolute inset-0" />
        <div className="closing-dots absolute inset-0" />
      </div>

      <div className="relative mx-auto w-full max-w-[1280px] px-6 py-16 text-center md:px-10 md:py-20">
        <h2
          className="mx-auto max-w-[22em] text-balance font-display font-semibold tracking-[-0.02em] text-ink"
          style={{ fontSize: 'clamp(26px, 3.4vw, 44px)', lineHeight: 1.22 }}
        >
          现在就能发<span className="text-brand-700">第一个请求</span>
        </h2>

        <p className="mx-auto mt-4 max-w-[40em] text-note leading-relaxed text-ink-mid md:text-[16.5px]">
          注册后拿到 Key，把 base_url 指过来，其余代码不用动。
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={registerUrl}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[4px] bg-ink px-6 text-[15px] font-medium text-white transition-colors hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            免费开始使用
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/docs/quickstart"
            className="inline-flex h-12 items-center justify-center rounded-[4px] border border-ink/15 bg-white/70 px-6 text-[15px] font-medium text-ink backdrop-blur transition-colors hover:border-ink/35 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            查看文档
          </Link>
        </div>

        <ul className="mt-9 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-meta text-ink-soft">
          {FACTS.map((fact) => (
            <li key={fact} className="flex items-center gap-1.5">
              <span aria-hidden className="h-1 w-1 rounded-full bg-brand-700" />
              {fact}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
