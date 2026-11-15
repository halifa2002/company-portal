import { MODEL_CATALOG } from '@portal/types';
import { loadModelList } from '@/lib/pricing';
// 预览页专用样式：只有本页加载，类名一律 .lab- 开头，不覆盖公共类。
// 规则见 app/preview/lab.css 顶部注释。
import '../lab.css';
import { SiteHeader } from '@/components/site-chrome';
import { V8Footer } from '@/components/preview/lab/shell';
import { V8Hero } from '@/components/preview/lab/hero';
import { AnnouncementBar } from '@/components/preview/lab/announcement-bar';
import { QuickStartSection } from '@/components/preview/lab/quickstart-section';
import { WhyChoose } from '@/components/preview/lab/why-choose';
import { ProblemSection } from '@/components/preview/lab/problem-section';
import { RequestFlow, Capabilities } from '@/components/preview/lab/capabilities';
import { TwoPaths } from '@/components/preview/lab/two-paths';
import { ProductPreview } from '@/components/preview/lab/product-preview';
import { KeyMetrics } from '@/components/preview/lab/key-metrics';
import { PricingTable } from '@/components/preview/lab/pricing-table';
import { QuickStart } from '@/components/preview/lab/quick-start';
import { PriceLogic } from '@/components/preview/lab/price-logic';
import { Faq } from '@/components/preview/lab/faq';
import { ClosingCta } from '@/components/preview/lab/closing';
import { Reveal } from '@/components/preview/lab/motion';

/**
 * 官网首页「预览版 v9」—— 与正式版完全独立的一份副本。
 *
 * 地址：http://127.0.0.1:4101/preview/home
 *
 * 独立性（2026-11-15 重新拆开，之前是共用组件、名不副实）：
 *   - 正式版组件在 `components/home/`（本轮从 `components/preview/v9/` 改名而来）；
 *   - 预览版组件是本目录对应的一份**独立副本** `components/preview/lab/`；
 *   - 两份文件互不引用，改这里不会影响 `/`，改 `/` 也不会影响这里。
 *     验证方式：改 lab 里任一文案 → 只看 /preview/home 变化 → `/` 不变。
 *   - 发布动作为「把 lab 的改动搬进 components/home/」，搬完两边再对齐。
 *   - 唯一有意共用的是页头 `components/site-chrome` 的 SiteHeader（传 maxWidth=1280，
 *     让页头与正文左右边对齐）。
 *
 * 页内结构见下方屏序注释；组件职责与各文件说明在 `components/preview/lab/` 内。
 */
export const metadata = {
  title: '预览版 v9 · 首页',
  robots: { index: false, follow: false },
};

export default async function PreviewHomePageV8() {
  // 与正式版同一数据源：后端 /api/pricing。取不到时不编数字，页面走降级说明。
  const { models, pricingAvailable } = await loadModelList(MODEL_CATALOG);
  const vendors = Array.from(new Set(models.map((model) => model.vendorName)));

  return (
    <div className="min-h-screen bg-surface">
      <AnnouncementBar modelCount={models.length} />

      {/*
        2026-11-14：页头不再用预览版自建的 V8Header，直接复用正式站 components/site-chrome 的
        SiteHeader（用户：「顶部栏目我正式版就不错」）。差异只在容器宽度：正式站整页 1600，
        预览页正文 1280，所以传 maxWidth 让页头与正文左右边对齐，其余结构/字号/高亮态完全同一份代码。
      */}
      <SiteHeader maxWidth="max-w-[1280px]" activePath="/" />

            <main>
        <V8Hero modelCount={models.length} vendors={vendors} />

        {/*
         * 痛点屏 2026-11-15：插在首屏与「为什么选择虫洞 AI」之间。
         * 首屏讲「我们是什么」，这里换成读者的口气讲「你现在多烦」，下一屏才是我们的答案——
         * 问题 → 答案连成一对，比两张连续的自夸屏更容易读下去。
         */}
        <Reveal><ProblemSection /></Reveal>

        {/*
         * 屏序 2026-11-14 按 teamorouter 重排：价格区从第 10 屏提到第 4 屏。
         *
         * 参考站的逻辑是「先给你看能买什么、多少钱」，再讲能力与接入——
         * 开发者进来第一件事就是比价，把价格压到后面等于让人滚十屏才看到关键信息。
         * 这里保持同一逻辑：完整价格表直接打头（细查），讲完口径再往下讲能力。
         *
         * 2026-11-14 删掉「特色模型」四卡（用户：「这个栏目删掉」）：
         * 它和紧跟其后的完整价格表是同一份数据的两种排版，等于同一件事说两遍；
         * 卡片里每条模型还只能显示输入/输出两个数，信息量比表格少。价格表已含
         * 全部 27 个模型与「看全部模型」入口，概览层不需要单独占一屏。
         */}
        {/* 2026-11-14 用户要求：在价格广告栏前面加一屏「为什么选择虫洞 AI」（参照硅基流动的同类版块） */}
        <WhyChoose />

        <Reveal><PricingTable models={models} pricingAvailable={pricingAvailable} /></Reveal>

        {/* 讲清楚「为什么是这个价」，紧跟价格表，不让人对着数字猜 */}
        <Reveal><PriceLogic /></Reveal>

        {/*
         * 转化带（2026-11-14 用户定的位置：价格口径之后）。
         * 逻辑：有什么价（价格表）→ 为什么是这个价（价格口径）→ 那就开始用（转化带），
         * 三屏连成一个「价格漏斗」，说服完立刻给行动口，不用等到页尾。
         * 配套：这条带的副按钮从「查看价格」改成「打开控制台」——刚从价格表下来，
         * 再把人指回价格页是绕路。
         */}
        <QuickStart />

        {/*
         * 2026-11-15 底色重排（用户：「斑马你准备怎么处理」）。
         *
         * 上一版规则是「相邻两屏不再撞同一个底色」——规则没错，但执行到每一屏，
         * 十一屏就在白与浅蓝之间翻了九次，滚动时是一道道横带；而且每屏各自挂
         * .surface-texture，四块浅蓝其实是同一张云图被裁了四刀，纹理在边界断开。
         *
         * 现在改成**按章上色，章内不翻面**：
         *   章一 白  ：价格表 → 价格口径
         *   分隔 深  ：转化带（QuickStart，深海军蓝收口）
         *   章二 浅蓝：能力 → 协议兼容 → 调用链路 → 关键指标（.chapter-mist 一整幅云图）
         *   章三 白  ：两种接入 → 控制台预览 → FAQ
         *   收口 深  ：收尾 CTA → 页脚
         * 翻面从九次降到三次，每翻一次都正好换话题，读起来是「换章」不是「翻面」。
         */}
        <div className="chapter-mist">
          <Reveal><Capabilities /></Reveal>

          {/*
           * 快速开始（2026-11-14 从首屏下方挪到这里）：
           * 读者已经知道有哪些模型、什么价、平台能给他什么，才轮到「怎么调」。
           * 与前面那块深色的转化带不重复：这块回答「代码怎么写」，那块回答「按什么顺序做什么」。
           */}
          <Reveal><QuickStartSection /></Reveal>

          <Reveal><RequestFlow /></Reveal>
          <Reveal><KeyMetrics /></Reveal>
        </div>

        <Reveal><TwoPaths /></Reveal>
        <Reveal><ProductPreview /></Reveal>

        <Reveal><Faq /></Reveal>
        <Reveal><ClosingCta /></Reveal>
      </main>

      <V8Footer />

      {/* 左下角预览标记：截图发人、隔一会儿再看，能一眼分清试验还是线上 */}
      <div className="pointer-events-none fixed bottom-4 left-4 z-[60] rounded-full border border-line bg-white px-3 py-1.5 text-meta font-medium tracking-wide text-ink-muted shadow-[0_2px_10px_rgba(6,34,63,0.06)]">
        预览版 v9 · 改这里不影响正式站
      </div>
    </div>
  );
}

