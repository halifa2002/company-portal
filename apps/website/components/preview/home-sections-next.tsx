import Link from 'next/link';
import { CodePreview } from './code-preview';
import { GatewayGraph } from './gateway-diagram';
import { capabilities, steps } from './home-content';
import { Reveal } from './reveal';

/**
 * 首页下半段的两个新版块（2026-11-13，只�?/preview/home 用）
 *
 * 为什么重做：旧版每一段都是「居中标�?+ 居中大标�?+ 一句居中说�?+ 一排等宽格子」，
 * 连着四段同一模板，滚下去没有任何顿挫——这是整�?廉价"的主因，不是配色问题�? *
 * 新版只改两件事，但改的是结构�? * 1. **能力�?*：标题靠左、错开半屏，右边用一条竖直的细线分条列六项�? *    版式取自 fireworks 的「左大标�?/ 右分条」，读的人先看见主张，再逐条看细节�? * 2. **接入示例**：整幅转深色，做成全页唯一一�?呼吸停顿"�? *    浅底页面上突然出现一块深色，视线会停下来——这是长页面最便宜也最有效的节奏手段�? */

export function CapabilitiesNext() {
  return (
    /*
     * 底色保留纯白：概览段刚用了浅靛卡片，这里再来一整块浅靛会连成一片淡紫，
     * 色块�?�?在白之间才有对比。第二处色块挪到下边的模型带�?     */
    <section className="border-b border-line bg-white py-24 md:py-40">
      <div className="mx-auto w-full max-w-[1600px] px-6 2xl:px-10">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-20">
          {/* 左：主张。sticky，让标题跟着右边的长列表�?*/}
          <Reveal className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-center gap-3 text-meta font-medium uppercase tracking-[0.2em] text-brand">
              <span aria-hidden className="h-px w-8 bg-brand/40" />
              平台能力
            </div>
            <h2
              className="mt-5 text-balance font-display font-bold tracking-[-0.03em] text-ink"
              style={{ fontSize: 'clamp(26px, 2.6vw, 38px)', lineHeight: 1.2 }}
            >
              接入、计费、额度，
              <br />
              收进一个网关            </h2>
            <p className="mt-6 max-w-[26em] text-body leading-relaxed text-ink-mid">
              不自研模型。把上游的差异挡在网关后面，下游只面对一套地址、一把 Key 和一份账单→</p>
            <Link
              href="/docs"
              className="group mt-8 inline-flex items-center gap-2 text-title font-medium text-brand transition-colors hover:text-brand-hover"
            >
              看接入文档              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
                →</span>
            </Link>
          </Reveal>

          {/* 右：六条细线分条。没有格子边框，只有横线——比卡片轻，也更能读 */}
          <ol className="divide-y divide-line border-t border-line">
            {capabilities.map((item, index) => (
              <li key={item.title}>
                <Reveal delay={index * 0.04}>
                  <div className="group flex items-start gap-6 py-8 transition-colors md:gap-10 md:py-10">
                    {/*
                      序号用等宽字、很淡：它只负责让人知道"这是第几�?�?                      不该和标题抢注意力。hover 时才提亮一档�?                    */}
                    <span className="mt-1 w-8 shrink-0 font-mono text-note tabular-nums text-ink-muted/70 transition-colors group-hover:text-brand">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-heading font-semibold tracking-tight text-ink md:text-display">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-balance text-body leading-relaxed text-ink-mid">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function ApiSectionNext() {
  return (
    <section className="relative overflow-hidden bg-brand-950 py-24 text-white md:py-40">
      {/* 底色：两团很淡的靛蓝光，压住大面积深色的"死黑"�?*/}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(64% 64% at 16% 8%, rgba(24,141,249,0.26) 0%, rgba(10,58,95,0) 66%), radial-gradient(52% 56% at 90% 92%, rgba(24,141,249,0.16) 0%, rgba(10,58,95,0) 64%)',
        }}
      />
      {/* 极淡的格线：让深色块不是一块死平面 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.14) 1px, transparent 1px)',
          backgroundSize: '84px 84px',
          maskImage: 'radial-gradient(70% 60% at 50% 40%, #000 0%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(70% 60% at 50% 40%, #000 0%, transparent 78%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-[1600px] px-6 2xl:px-10">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,0.8fr)_minmax(0,1.36fr)] lg:gap-10 xl:gap-14">
          {/* 左：文案 */}
            <Reveal>
              <div className="flex items-center gap-3 text-meta font-medium uppercase tracking-[0.2em] text-white/40">
                <span aria-hidden className="h-px w-8 bg-white/20" />
                接入示例
              </div>
              <h2
                className="mt-5 text-balance font-display font-bold tracking-[-0.03em] text-white"
                style={{ fontSize: 'clamp(26px, 2.6vw, 38px)', lineHeight: 1.2 }}
              >
                把地址换掉，
                <br />
                就能发第一个请求
              </h2>
              <p className="mt-6 max-w-[28em] text-body leading-relaxed text-white/75">
                四种协议共用同一套地址与密钥。左边是请求进来的路径，右边是可以直接抄走的代码。
              </p>

              {/* 三条短要点：把「为什么便宜、为什么不会断」说清楚，各一行 */}
              <ul className="mt-7 space-y-3 text-body text-white/85">
                {['换地址与密钥即可，SDK 不用改', '同一模型多路上游，异常自动切换', '每次调用都记进用量明细'].map(
                  (item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[#5e96cc]"
                      />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </Reveal>

          {/*
            拓扑图（2026-11-13 第三次调整）：改成三栏并排。
            上一版把它压在文案下面，左栏被撑到 850px、右栏只有 450px，
            整段 1200px 高、右下角空一大片。三栏后高度取最高那栏，整段砍到 700 左右。
            阅读线从左到右：怎么接 → 请求怎么走 → 代码怎么写。
          */}
          <Reveal delay={0.06} className="hidden md:block">
            <div className="mb-6 flex items-center gap-3 text-meta font-medium uppercase tracking-[0.2em] text-white/40">
              <span aria-hidden className="h-px w-8 bg-white/20" />
              请求流向
            </div>
            <GatewayGraph tone="dark" />
            <p className="mt-3 text-meta text-white/45">
              请求从任一客户端进来，按 model 字段分流到对应上游
            </p>
          </Reveal>

          {/* 右：深色代码卡。从右边滑进来——全页其他都是上浮，这里换方向 */}
          <Reveal delay={0.08} from="side">
            <div className="mb-6 flex items-center gap-3 text-meta font-medium uppercase tracking-[0.2em] text-white/40">
              <span aria-hidden className="h-px w-8 bg-white/20" />
              调用示例
            </div>
            <CodePreview tone="dark" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/**
 * 接入三步（新版）
 *
 * 旧版是「居中标�?+ 三个等宽卡片 + 每张卡一个大编号」——和上面几段同一模板�? * 而且卡片的边框把这三步切成了三个不相干的东西。这三步其实是一条线�? * 所以改成一条横带：左边一句主张，右边三步用竖细线隔开、编号压在标题上面�? */
export function StepsNext() {
  return (
    <section className="border-b border-line bg-white py-20 md:py-28">
      <div className="mx-auto w-full max-w-[1600px] px-6 2xl:px-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-16">
          <Reveal>
            <div className="flex items-center gap-3 text-meta font-medium uppercase tracking-[0.2em] text-brand">
              <span aria-hidden className="h-px w-8 bg-brand/40" />
              接入流程
            </div>
            <h2
              className="mt-4 text-balance font-display font-bold tracking-[-0.03em] text-ink"
              style={{ fontSize: 'clamp(24px, 2vw, 30px)', lineHeight: 1.2 }}
            >
              三步接入，              <br />
              不用重写代码
            </h2>
            <Link
              href="/docs"
              className="group mt-5 inline-flex items-center gap-2 text-body font-medium text-brand transition-colors hover:text-brand-hover"
            >
              打开接入文档
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
                →</span>
            </Link>
          </Reveal>

          <div className="grid gap-y-8 sm:grid-cols-3 sm:gap-x-0">
            {steps.map((step, index) => (
              <Reveal key={step.no} delay={index * 0.06}>
                <div
                  className={`h-full px-0 sm:px-7 ${
                    index === 0 ? 'sm:pl-0' : 'sm:border-l sm:border-line'
                  }`}
                >
                  <span className="font-mono text-meta tabular-nums text-brand/70">{step.no}</span>
                  <h3 className="mt-2 text-title font-semibold tracking-tight text-ink">{step.title}</h3>
                  <p className="mt-2 text-balance text-body leading-relaxed text-ink-mid">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * 模型与定价入口（新版�? *
 * 旧版是「一张容器、竖线切两格」，和上面「概览两张卡」版式几乎一样—�? * 同一页出现两次同款双卡，第二组就废了。这里压成一条横向快捷带�? * 一条上下细线、两个入口名字直接可点，不再给卡片�? */
export function ModelPricingNext() {
  return (
    <section className="border-b border-line bg-white py-16 md:py-20">
      <div className="mx-auto w-full max-w-[1600px] px-6 2xl:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="text-meta font-medium uppercase tracking-[0.2em] text-ink-muted">
            模型与定价</div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-10">
            {[
              { eyebrow: '立即体验', title: '浏览可用模型', desc: '能力、上下文长度与调用方式', href: '/models' },
              { eyebrow: '计费透明', title: '查看实时定价', desc: '单价、计费规则与额度说明', href: '/pricing' },
            ].map((item, index) => (
              <div key={item.href} className="flex items-center gap-10">
                {index > 0 ? <span aria-hidden className="hidden h-10 w-px bg-line sm:block" /> : null}
                <Link href={item.href} className="group flex items-center gap-3">
                  <div>
                    <div className="text-meta text-ink-muted">{item.eyebrow}</div>
                    <div className="mt-1 flex items-center gap-2 text-heading font-semibold text-ink transition-colors group-hover:text-brand">
                      {item.title}
                      <span
                        aria-hidden
                        className="text-body text-ink-muted transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-brand"
                      >
                        →</span>
                    </div>
                    <div className="mt-1 text-note text-ink-mid">{item.desc}</div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}