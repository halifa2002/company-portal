import { MODEL_CATALOG } from '@portal/types';
import { loadModelList } from '@/lib/pricing';
import { SiteHeader } from '@/components/site-chrome';
import { V8Footer } from '@/components/preview/v8/shell';
import { V8Hero } from '@/components/preview/v8/hero';
import { AnnouncementBar } from '@/components/preview/v8/announcement-bar';
import { QuickStartSection } from '@/components/preview/v8/quickstart-section';
import { RequestFlow, Capabilities } from '@/components/preview/v8/capabilities';
import { TwoPaths } from '@/components/preview/v8/two-paths';
import { ProductPreview } from '@/components/preview/v8/product-preview';
import { KeyMetrics } from '@/components/preview/v8/key-metrics';
import { PricingTable } from '@/components/preview/v8/pricing-table';
import { QuickStart } from '@/components/preview/v8/quick-start';
import { PriceLogic } from '@/components/preview/v8/price-logic';
import { Faq } from '@/components/preview/v8/faq';
import { ClosingCta } from '@/components/preview/v8/closing';
import { Reveal } from '@/components/preview/v8/motion';

/**
 * 官网首页「预览版 v8」—— 与正式版完全独立的一份重写。
 *
 * 地址：http://127.0.0.1:4101/preview/home
 *
 * 2026-11-14 当前结构（实际屏序，与最初计划有合并/新增）：
 *   页头              → **复用正式站 components/site-chrome 的 SiteHeader**（传 maxWidth=1280）
 *   Hero（v9）        → hero.tsx（居中大标题 + 一对按钮 + 一行地址条 + 路由图 + 能力胶囊；
 *                       暖色渐变 + 变径网点背景。内部件：hero-headline / address-bar /
 *                       routing-diagram / trust-strip）
 *   协议路径区        → 本文件内联 section + protocol-tabs.tsx（variant="paths"）
 *   Capabilities      → capabilities.tsx（6 条能力，装饰序号 + 图标容器 + hover 效果）
 *   TwoPaths          → two-paths.tsx（开发者 vs 企业，参考 agtcloud）
 *   ProductPreview    → product-preview.tsx（控制台界面示意，渐变边框 + 精致数据卡）
 *   KeyMetrics        → key-metrics.tsx（4 个关键指标大数字）
 *   PricingTable      → pricing-table.tsx（完整价格表，sticky 表头 + 行 hover）
 *   QuickStart        → quick-start.tsx（深色 IDE 风格代码区，全页唯一深色）
 *   PriceLogic        → price-logic.tsx（三步价格口径，图标 + 连接箭头）
 *   Faq               → faq.tsx（编号折叠问答，圆角卡片 + hover）
 *   ClosingCta        → closing.tsx（渐变收尾区，大标题 + 双按钮）
 *   页脚              → shell.tsx（V8Footer：深色 + 渐变装饰 + 光晕）
 *
 * 独立性：除页头（有意复用正式站 SiteHeader，见上方说明）外，其余组件全部在
 * components/preview/ 下，正式页不共用；样式只走 Tailwind 主题变量
 * （brand/ink/line/surface/code）。唯一例外是首屏的暖色层——设计 token 里还没有
 * 暖色梯级，暂用裸值写在 hero.tsx 内，风格定稿后收进 packages/design-tokens。
 *
 * 定稿后：把 v8 的改动搬回正式版 components/，再删掉 /preview 整个目录。
 */
export const metadata = {
  title: '预览版 v8 · 首页',
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
         * 2026-11-14 第 13 次调整（用户：先别删模块，排序改善一下）：
         * 原来「能给你什么」（能カ）排在代码与机制之后，读者得先啃代码、再回头看卖点。
         * 现在按「钱 → 你能得到什么 → 怎么调 → 里面怎么跑 → 有数据吗 → 给谁用 → 产品长什么样 → 开始」
         * 重排成五段，每段内部相邻的两屏回答同一个问题：
         *   ① 价格       价格表 + 价格口径
         *   ② 价值       平台能力（四条）
         *   ③ 上手与机制 快速开始（代码）→ 调用链路 → 关键指标（可信度三连）
         *   ④ 受众与产品 两种接入 → 控制台预览
         *   ⑤ 行动       三步接入（深色）→ FAQ → 收尾 CTA
         * 底色同步改为 白 → 浅灰 → 白 → surface → 浅灰 → 白 → 浅灰 → 白 → 深色，
         * 相邻两屏不再撞同一个底色。
         */}
        <Reveal><Capabilities /></Reveal>

        {/*
         * 快速开始（2026-11-14 从首屏下方挪到这里）：
         * 读者已经知道有哪些模型、什么价、平台能给他什么，才轮到「怎么调」。
         * 与后面那块深色的「三步接入」不重复：这块回答「代码怎么写」，那块回答「按什么顺序做什么」。
         */}
        <Reveal><QuickStartSection /></Reveal>

        <Reveal><RequestFlow /></Reveal>
        <Reveal><KeyMetrics /></Reveal>

        <Reveal><TwoPaths /></Reveal>
        <Reveal><ProductPreview /></Reveal>

        <Reveal><Faq /></Reveal>
        <Reveal><ClosingCta /></Reveal>
      </main>

      <V8Footer />

      {/* 左下角预览标记：截图发人、隔一会儿再看，能一眼分清试验还是线上 */}
      <div className="pointer-events-none fixed bottom-4 left-4 z-[60] rounded-full border border-line bg-white px-3 py-1.5 text-meta font-medium tracking-wide text-ink-muted shadow-[0_2px_10px_rgba(6,34,63,0.06)]">
        预览版 v8 · 改这里不影响正式站
      </div>
    </div>
  );
}
