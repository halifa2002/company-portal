import Link from 'next/link';
import { SiteHeader, SiteFooter } from './site-chrome';
import { FaqAccordion, type FaqItem } from './faq-accordion';
import { registerUrl } from '@/lib/brand';
import { HomeModelSection, HomeCtaSection } from './home-sections-preview';
import { PriceSection } from './price-section';
import { CapabilitiesNext, ApiSectionNext, StepsNext } from './home-sections-next';
import { TrustPriceSection } from './trust-price-section';
import { HeroNext } from './hero-next';
import { Reveal } from './reveal';

/**
 * 首页「预览版」的页面骨架（/preview/home 专用）
 *
 * 这是 components/home-page-body.tsx 的一份**独立副本**，不是同一个文件。
 * 这么做的原因：正式首页 `/` 已经定了，预览页上要能随便改——改坏了不能连累正式版。
 *
 * 规则：预览版定稿后，把这里的改动搬回 components/ 下的正式文件，再删掉这一份。
 * 两份长期并存的前提是「一份只用来试、一份只用来上」，不要双向瞎改。
 *
 * ---
 * 2026-11-13 第三版：整页按参考站（teamorouter）的骨架重排，**文案一个字没动**。
 * 八段用的是同一种开法：居中标题 + 一行灰字 → 内容 → 一条整幅浅虚线收尾。
 * 每段的"内容形态"仍然不一样（三列卡片 / 左说明右代码 / 三等分横带 / 双栏 / 价格格），
 * 所以读起来是一本书的八章，不是八个不同的站。
 */

/**
 * 品牌官网首页 —— 对应 md 4.1「首页」九项要求：
 * 顶部品牌导航 · 产品介绍 · 平台能力 · 模型与定价入口 · 服务优势 ·
 * API 接入示例 · 定价入口 · 开发者入口 · 注册登录入口。
 */

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

export async function HomePreviewBody() {
  return (
    <>
      <SiteHeader />

      <main>
        <HeroNext preview />

        {/* 模型价格：参考站的版式，摆在首屏下面第一块 */}
        <PriceSection />

        {/* 平台能力：居中标题 + 一排数字 + 六张同规格卡片 */}
        <CapabilitiesNext />

        {/* API 接入示例：左说明（含拓扑图）+ 右代码窗 */}
        <ApiSectionNext />

        {/* 接入三步：一条三等分的横带 */}
        <StepsNext />

        {/*
          选型与价格：放到接入三步之后。
          这一段回答的是「凭什么信你、为什么这个价」，属于动手前最后一道顾虑——
          等访客看完怎么接、准备去注册的时候再讲，比刚进页面就讲更听得进去。
        */}
        <TrustPriceSection />

        <HomeModelSection />

        {/* ============ 页尾：常见问题（居中标题 + 单列折叠） ============ */}
        {/*
          页尾问答（2026-11-13 第四版）：从「居中标题 + 单列折叠」改成「左标题 + 右折叠」。
          居中头一路用下来，到这一段已经第七次了，标题基本没人读；
          而且问答本身是"一行问题 + 一段解释"，左边空着一大片。
          左栏 sticky：右边展开某一条时，标题和两个出口还留在视口里。
        */}
        <section className="pv-sec pv-tint">
          <div className="pv-wrap">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-16">
              <div className="lg:sticky lg:top-24 lg:self-start">
                <Reveal>
                  <span className="pv-eyebrow">帮助</span>
                  <h2 className="pv-h2 mt-4">常见问题</h2>
                  <p className="pv-sub">接入前后最常被问到的几件事，答的都是平台现在实际的做法。</p>

                  <div className="mt-7 flex flex-col gap-3 text-body">
                    <Link
                      href="/docs/faq"
                      className="group inline-flex items-center gap-1.5 font-medium text-brand transition-colors hover:text-brand-hover"
                    >
                      查看全部问题
                      <span
                        aria-hidden
                        className="transition-transform duration-300 group-hover:translate-x-0.5"
                      >
                        →
                      </span>
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

              {/* 单列、最大 760：问答一行读下来不该横跨整屏 */}
              <Reveal delay={0.06}>
                <div className="max-w-[760px]">
                  <FaqAccordion items={faqItems} />
                </div>
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
