import Link from 'next/link';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { FaqAccordion, type FaqItem } from '@/components/faq-accordion';
import { registerUrl } from '@/lib/brand';
import { HomeModelSection, HomeCtaSection } from '@/components/home-sections-preview';
import { CapabilitiesNext, ApiSectionNext, StepsNext, ModelPricingNext } from '@/components/home-sections-next';
import { TrustPriceSection } from '@/components/trust-price-section';
import { HeroNext } from '@/components/hero-next';
import { Reveal } from '@/components/reveal';

/**
 * 品牌官网首页 —— 对应 md 4.1「首页」九项要求：
 * 顶部品牌导航 · 产品介绍 · 平台能力 · 模型与定价入口 · 服务优势 ·
 * API 接入示例 · 定价入口 · 开发者入口 · 注册登录入口。
 *
 * 2026-11-13 大扫除：改造前那套「旧首屏 + 三段旧版式」已经整段删掉，
 * 线上首页就是这一份。旧版要回看只能翻 git 历史——留着两套并存的代价是
 * 每改一处都要先判断「改的是哪一版」，最后两版都会慢慢烂。
 *
 * 首屏只有一版：hero-next.tsx。2026-11-13 试过一版「拓扑图当主角」的 v3，
 * 用户判断不好看，整条线撤掉了——不再留预览地址、不再留两套首屏。
 */

/* ============================ 内容 ============================ */

/**
 * 首屏下面这两张卡：一张给要动手的人，一张给要评估的人。
 *
 * 右卡原来讲「企业服务 · 额度权限账单」并跳转计费页，但计费已经有独立页面
 * （导航「价格」+ 定价页 + 页尾指路区都在指它），再从这儿指一次是第三条重复的路。
 * 所以右卡改成「关于」，讲平台定位——这是全站唯一还没被首页导流过的正经页面。
 */
const accessModes = [
  {
    eyebrow: '开发者平台',
    title: '用一个 API 调用多种模型',
    desc: '兼容三种主流协议，换模型只改 model 字段。',
    href: '/docs',
    linkLabel: '查看接入文档',
    icon: <PlugIcon />,
  },
  {
    eyebrow: '关于我们',
    title: '这个平台在做的事',
    desc: '不自研模型，只把接入、计费与用量收进网关。',
    href: '/about',
    linkLabel: '了解平台',
    icon: <CompanyIcon />,
  },
] as const;

/**
 * 页尾问答：只放「第一次来的人会卡住」的那几条。
 *
 * 内容全部来自 /docs/faq 里已经核实过的说法，不是这里另写一套口径——
 * 首页和文档页对同一个问题给两种答案，比没有答案更糟。
 */
const faqItems: ReadonlyArray<FaqItem> = [
  {
    q: '第一次调用要从哪开始？',
    a: '登录控制台，在「API 密钥」页新建一个 Key；再把代码里的 base_url 指向本平台、api_key 换成平台密钥，其余参数不用动。照着快速开始走一遍大约十分钟。',
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
    a: '只改两处：base_url 和 api_key。SDK、请求参数、调用方式都不用改。',
  },
  {
    q: '调用报错了先看哪里？',
    a: '401 是 Key 有问题，403 是余额不足，429 是被限流，503 是模型不可用。逐个状态码对照错误码页，能直接定位到原因。',
  },
];

/* ============================ 页面 ============================ */

export async function HomePageBody() {
  return (
    <>
      <SiteHeader />

      <main>
        <HeroNext preview />

        {/* ============ 产品介绍：接入 / 关于 两个入口 ============ */}
        <section className="border-b border-line bg-white py-20 md:py-24">
          <div className="mx-auto w-full max-w-[1600px] px-6 2xl:px-10">
            {/*
              这一段原来也是「居中标题」——首屏下面第一块就居中，
              整页像同一模板就是从这儿开始的。改成左右两栏：
              左标题、右一句说明，视线往左下走，和下面几段接得上。
            */}
            <Reveal>
              <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] md:items-end md:gap-12">
                <div>
                  <div className="flex items-center gap-3 text-meta font-medium uppercase tracking-[0.2em] text-brand">
                    <span aria-hidden className="h-px w-8 bg-brand/40" />
                    平台概览
                  </div>
                  <h2
                    className="mt-4 text-balance font-display font-bold tracking-[-0.03em] text-ink"
                    style={{ fontSize: 'clamp(30px, 3.4vw, 52px)', lineHeight: 1.1 }}
                  >
                    先了解平台，再开始接入
                  </h2>
                </div>
                <p className="text-balance text-body leading-relaxed text-ink-mid md:pb-2">
                  要动手的直接看文档，要评估的先看平台在做什么。
                </p>
              </div>
            </Reveal>

            <div className="mt-14 grid gap-6 md:mt-16 md:grid-cols-2">
              {accessModes.map((mode, index) => (
                <Reveal key={mode.eyebrow} from="scale" delay={index * 0.06}>
                  {/*
                    去掉了原来的描边白卡，换成实色面块（浅蓝底）+ hover 抬一档。
                    上一版一张卡里同时有斜向渐变、品牌色描边、图标外发光，
                    三样都是装饰，读的人反而看不见内容。
                  */}
                  <Link
                    href={mode.href}
                    className="group flex gap-7 rounded-wide bg-brand-soft p-9 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-24px_rgba(27,90,160,0.45)] md:gap-8 md:p-10"
                  >
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-white text-brand md:h-16 md:w-16">
                      <svg
                        width="26"
                        height="26"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        {mode.icon}
                      </svg>
                    </span>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="text-meta font-semibold uppercase tracking-[0.1em] text-brand">
                        {mode.eyebrow}
                      </div>
                      <h3 className="mt-3 text-heading font-bold tracking-tight text-ink md:text-display">
                        {mode.title}
                      </h3>
                      <p className="mt-3.5 text-body leading-relaxed text-ink-mid">{mode.desc}</p>

                      {/* 分隔线要跟描述拉开距离，否则像给描述画了条下划线 */}
                      <div className="mt-8 flex items-center justify-between border-t border-brand/20 pt-6">
                        <span className="text-body font-medium text-brand">{mode.linkLabel}</span>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand transition-transform duration-300 group-hover:translate-x-1">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden
                          >
                            <path d="M4.5 12h14M13 6.5l5.5 5.5-5.5 5.5" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 平台能力：左标题 + 右侧细线分条 */}
        <CapabilitiesNext />

        {/* 模型与定价：压成一条横向快捷带 */}
        <ModelPricingNext />

        {/* API 接入示例：深色整幅，全页唯一一次呼吸停顿 */}
        <ApiSectionNext />

        {/* 接入三步：一条横带（左主张 + 右三步竖分） */}
        <StepsNext />

        {/*
          选型与价格：放到接入三步之后。
          这一段回答的是「凭什么信你、为什么这个价」，属于动手前最后一道顾虑——
          等访客看完怎么接、准备去注册的时候再讲，比刚进页面就讲更听得进去。
        */}
        <TrustPriceSection />

        <HomeModelSection />

        {/* ============ 页尾：常见问题（左标题，右折叠问答） ============ */}
        {/*
          这里原来是一块推销区：大标语「按实际用量付费，没有最低消费」加两个大按钮。
          问题不在于页尾要有注册入口，而在于它跟上面「三步接入」讲的是同一件事，
          却换成更大的字和更重的按钮又喊一遍。走到页尾的人多半已经定了，
          再喊一遍只会显得急。改成问答：正面回答剩下的顾虑更有用。
        */}
        <section className="bg-surface-subtle py-20 md:py-24">
          <div className="mx-auto w-full max-w-[1600px] px-6 2xl:px-10">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-20">
              {/*
                左栏 sticky：右边展开某一条时，标题和「查看全部问题」还留在视口里，
                不会因为答被拉开而整块滚上去。
              */}
              <div className="lg:sticky lg:top-24 lg:self-start">
                <Reveal>
                  <div className="flex">
                    <span className="whitespace-nowrap text-meta font-semibold tracking-[0.1em] text-brand">
                      帮助
                    </span>
                  </div>
                  <h2
                    className="mt-3.5 text-balance font-bold tracking-tight text-ink"
                    style={{ fontSize: 'clamp(28px, 2.2vw, 36px)', lineHeight: 1.2 }}
                  >
                    常见问题
                  </h2>
                  <p className="mt-4 max-w-sm text-body leading-relaxed text-ink-mid">
                    接入前后最常被问到的几件事，答的都是平台现在实际的做法。
                  </p>

                  <div className="mt-6 flex flex-col gap-2 text-body">
                    <Link
                      href="/docs/faq"
                      className="inline-flex items-center gap-1.5 font-medium text-brand transition-colors hover:text-brand-hover"
                    >
                      查看全部问题
                      <span aria-hidden>→</span>
                    </Link>
                    {/*
                      md 4.1 第八项要求首页有注册登录入口。
                      页尾这块再放一个普通文字链接就够，不必是整页最大的那个按钮。
                    */}
                    <span className="text-ink-mid">
                      还没有账号？
                      <Link
                        href={registerUrl}
                        className="ml-1 font-medium text-brand transition-colors hover:text-brand-hover"
                      >
                        直接注册
                      </Link>
                    </span>
                  </div>
                </Reveal>
              </div>

              <Reveal delay={0.08}>
                <FaqAccordion items={faqItems} />
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <HomeCtaSection />

      <SiteFooter />
    </>
  );
}

/* ============================ 图标 ============================ */

/**
 * 开发者卡：插头。写的是「接入」，就用插头，别用窗口截图——
 * 窗口里的东西在这个尺寸下看不清，只剩下一个方框。
 */
function PlugIcon() {
  return (
    <>
      <path d="M9 3v3.6M15 3v3.6" />
      <path d="M6.8 6.6h10.4v3.6a5.2 5.2 0 0 1-10.4 0z" strokeLinejoin="round" />
      <path d="M12 15.4v5.4" />
    </>
  );
}

/**
 * 关于卡：两栋楼。
 * 先试过罗盘，26px 下只剩一个带斜线的圆圈，读不出「我们是谁」；
 * 楼这个形状在同样尺寸下轮廓清楚，也和插头不是一路。
 */
function CompanyIcon() {
  return (
    <>
      <path d="M4.6 20.2V6.4L11.4 3.8v16.4" strokeLinejoin="round" />
      <path d="M11.4 9.6l7.9 2.4v8.2" strokeLinejoin="round" />
      <path d="M3.2 20.2h17.5" strokeLinecap="round" />
      <path
        d="M7.5 8.8h.01M7.5 12h.01M7.5 15.2h.01M15.2 14.4h.01M15.2 17.2h.01"
        strokeLinecap="round"
      />
    </>
  );
}
