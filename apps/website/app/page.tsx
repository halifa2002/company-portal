import { MODEL_CATALOG } from '@portal/types';
import { loadModelList } from '@/lib/pricing';
import { SiteHeader } from '@/components/site-chrome';
import { V8Footer } from '@/components/home/shell';
import { V8Hero } from '@/components/home/hero';
import { AnnouncementBar } from '@/components/home/announcement-bar';
import { QuickStartSection } from '@/components/home/quickstart-section';
import { WhyChoose } from '@/components/home/why-choose';
import { ProblemSection } from '@/components/home/problem-section';
import { RequestFlow, Capabilities } from '@/components/home/capabilities';
import { TwoPaths } from '@/components/home/two-paths';
import { ProductPreview } from '@/components/home/product-preview';
import { KeyMetrics } from '@/components/home/key-metrics';
import { PricingTable } from '@/components/home/pricing-table';
import { QuickStart } from '@/components/home/quick-start';
import { PriceLogic } from '@/components/home/price-logic';
import { Faq } from '@/components/home/faq';
import { ClosingCta } from '@/components/home/closing';
import { Reveal } from '@/components/home/motion';

/**
 * 官网首页（正式版）—— 2026-11-15 由预览版 v8 提升而来（同日预览页升为 v9）。
 *
 * 与 /preview/home 的关系：**两份独立的拷贝，互不影响。**
 *   - 页面结构、屏序、文案在本文件与 app/preview/home/page.tsx 各存一份；
 *   - 展示组件：正式版用 `components/home/`（2026-11-15 从
 *     `components/preview/v9/` 改名而来，名字不再带 preview），
 *     预览版用 `components/preview/lab/`（同一份的独立副本）；
 *   - 所以改 `components/home/` 只影响 `/`，改 `components/preview/lab/` 只影响
 *     `/preview/home`。预览页改完满意了，再把改动搬进 `components/home/`。
 *
 * 与预览版的三处差异：无左下角「预览版 v9」浮标、无 noindex、
 * metadata 走根 layout 的正式标题（不写本文件的 metadata 即继承默认）。
 *
 * 旧首页 components/home-page-body.tsx（308 行，含 hero-next 首屏）已不再被引用，
 * 文件保留在仓库里以便对照，不再改动。
 */

/**
 * 屏序（与预览版同步，2026-11-15）：
 *   通告条 → 首屏 v9 → 痛点屏 → 为什么选择 → 价格表 → 价格口径 → 转化带（深）
 *   → 能力 / 快速开始 / 调用链路 / 关键指标（浅蓝章）
 *   → 两种接入 → 控制台预览 → FAQ → 收尾 CTA → 页脚
 */
export default async function HomePage() {
  // 与预览版同一数据源：后端 /api/pricing。取不到时不编数字，页面走降级说明。
  const { models, pricingAvailable } = await loadModelList(MODEL_CATALOG);
  const vendors = Array.from(new Set(models.map((model) => model.vendorName)));

  return (
    <div className="relative min-h-screen bg-surface">
      {/* 2026-11-16：与预览版同步 —— 星空底图从页面最顶上（通告条之前）铺一整屏 + 200px，
          通告条、页头、首屏看到的是同一张图；首屏以下的内容自带底色，不会透出来。 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[calc(100svh+200px)]"
        style={{
          backgroundColor: '#eef6ff',
          backgroundImage: [
            'linear-gradient(180deg, rgba(238,246,255,0) 0%, rgba(238,246,255,0) 86%, rgba(238,246,255,0.9) 95%, #eef6ff 100%)',
            "url('/hero/starfield-dawn.webp')",
          ].join(','),
          backgroundSize: '100% 100%, 100% 100%',
          backgroundPosition: 'top, top',
          backgroundRepeat: 'no-repeat, no-repeat',
        }}
      />
      <div className="relative z-10">
        <AnnouncementBar modelCount={models.length} />

        <SiteHeader maxWidth="max-w-[1280px]" activePath="/" overlay />

        <main>
        <V8Hero modelCount={models.length} vendors={vendors} />

        {/*
         * 痛点屏 2026-11-15（与预览页同步）：首屏之后先讲「你现在多烦」，下一屏再给答案。
         * 用户明确要保留「为什么选择虫洞 AI」那屏居中大标题的震撼观感，所以这里单独成屏而非替换标题。
         * 代价已知：价格表从第 3 屏挪到第 4 屏。
         */}
        <Reveal>
          <ProblemSection />
        </Reveal>

        <WhyChoose />

        <Reveal>
          <PricingTable models={models} pricingAvailable={pricingAvailable} />
        </Reveal>

        <Reveal>
          <PriceLogic />
        </Reveal>

        <QuickStart />

        <div className="chapter-mist">
          <Reveal>
            <Capabilities />
          </Reveal>

          <Reveal>
            <QuickStartSection />
          </Reveal>

          <Reveal>
            <RequestFlow />
          </Reveal>
          <Reveal>
            <KeyMetrics />
          </Reveal>
        </div>

        <Reveal>
          <TwoPaths />
        </Reveal>
        <Reveal>
          <ProductPreview />
        </Reveal>

        <Reveal>
          <Faq />
        </Reveal>
        <Reveal>
          <ClosingCta />
        </Reveal>
      </main>

        <V8Footer />
      </div>
    </div>
  );
}
