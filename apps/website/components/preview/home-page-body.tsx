import { SiteHeader, SiteFooter } from './site-chrome';
import { FaqAccordion, type FaqItem } from './faq-accordion';
import { HeroNext } from './hero-next';
import { PriceTableSection } from './price-table';
import { FeaturesSix } from './features-six';
import { QuickStartSection } from './quick-start';

/**
 * 首页「预览版」的页面骨架（只给 /preview/home 用）
 *
 * 这是 components/home-page-body.tsx 的**独立副本**，不是同一个文件。
 * 正式页 `/` 用原件，这里改任何东西都碰不到它。
 *
 * ---
 * 2026-11-13 第七版：整页按 teamorouter 的段落顺序重排，六段：
 *
 *   ① 首屏        —— 撑满一屏，渐变 + 网点 + 关系图（质感借 fireworks）
 *   ② 数字条      —— 一行三个真数，把「多大」说完，比一段形容词省地方
 *   ③ 实时价格    —— 一整张 3×2 的表，不是六张卡
 *   ④ 平台能力    —— 六条，白底，给眼睛一个密的地方
 *   ⑤ 快速开始    —— 左说明右代码，代码窗是主角
 *   ⑥ 常见问题    —— 居中标题 + 单列折叠
 *
 * 删掉的段落（正式版还有）：平台概览双卡、接入示例深蓝整幅、接入三步、
 * 信任价格、模型卡带、底部 CTA。它们的功能分别被 ③④⑤ 吸收了，
 * 同时保留会把页面拉回「九段一模一样的开法」。
 *
 * 文案一个字没改：所有句子都来自站上原有的那几段。
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

export async function HomePageBody() {
  return (
    <>
      <SiteHeader />

      <main>
        <HeroNext preview />

        <PriceTableSection />

        <FeaturesSix />

        <QuickStartSection />

        {/* ============ 页尾问答 ============ */}
        {/* 底色与「平台能力」段同值（#eaf0f7 微蓝灰）：全站两处"退一档"的段落用同一个底色，
            不再铺浅蓝——蓝只留给图标、链接和首屏渐变。 */}
        <section className="pv-sec bg-[#eaf0f7]">
          <div className="pv-wrap">
            <div className="text-center">
              <h2 className="pv-h2">常见问题</h2>
              <p className="pv-sub mx-auto max-w-[36em]">
                接入前后最常被问到的几件事，答的都是平台现在实际的做法。
              </p>
            </div>

            {/* 单列、最大 760：问答一行读下来不该横跨整屏 */}
            <div className="mx-auto mt-12 max-w-[760px]">
              <FaqAccordion items={faqItems} />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
