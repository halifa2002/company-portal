import { MODEL_CATALOG } from '@portal/types';
import { loadModelList } from '@/lib/pricing';
import { SiteHeader } from '@/components/site-chrome';
import { V8Footer } from '@/components/preview/v9/shell';
import { V8Hero } from '@/components/preview/v9/hero';
import { AnnouncementBar } from '@/components/preview/v9/announcement-bar';
import { QuickStartSection } from '@/components/preview/v9/quickstart-section';
import { WhyChoose } from '@/components/preview/v9/why-choose';
import { RequestFlow, Capabilities } from '@/components/preview/v9/capabilities';
import { TwoPaths } from '@/components/preview/v9/two-paths';
import { ProductPreview } from '@/components/preview/v9/product-preview';
import { KeyMetrics } from '@/components/preview/v9/key-metrics';
import { PricingTable } from '@/components/preview/v9/pricing-table';
import { QuickStart } from '@/components/preview/v9/quick-start';
import { PriceLogic } from '@/components/preview/v9/price-logic';
import { Faq } from '@/components/preview/v9/faq';
import { ClosingCta } from '@/components/preview/v9/closing';
import { Reveal } from '@/components/preview/v9/motion';

/**
 * 官网首页（正式版）—— 2026-11-15 由预览版 v8 提升而来（同日预览页升为 v9）。
 *
 * 与 /preview/home 的关系：**两份独立的页面代码，互不影响。**
 *   - 页面结构、屏序、文案在本文件（正式版）与 app/preview/home/page.tsx（预览版）
 *     各存一份，改动其中一份不会波及另一份；
 *   - 底层展示组件共用 components/preview/v9/*（与仓库既有约定一致：
 *     home-page-body 与 home-preview-body 也是「独立副本」而不是同一个文件）；
 *   - 因此「在预览页改完 → 搬到这里」才是发布动作，预览页保持为试验田。
 *
 * 与预览版的三处差异：无左下角「预览版 v8」浮标、无 noindex、
 * metadata 走根 layout 的正式标题（不写本文件的 metadata 即继承默认）。
 *
 * 旧首页 components/home-page-body.tsx（308 行，含 hero-next 首屏）已不再被引用，
 * 文件保留在仓库里以便对照，不再改动。
 */

/**
 * 屏序（与预览版同步，2026-11-15）：
 *   通告条 → 首屏 v9 → 为什么选择 → 价格表 → 价格口径 → 转化带（深）
 *   → 能力 / 快速开始 / 调用链路 / 关键指标（浅蓝章）
 *   → 两种接入 → 控制台预览 → FAQ → 收尾 CTA → 页脚
 */
export default async function HomePage() {
  // 与预览版同一数据源：后端 /api/pricing。取不到时不编数字，页面走降级说明。
  const { models, pricingAvailable } = await loadModelList(MODEL_CATALOG);
  const vendors = Array.from(new Set(models.map((model) => model.vendorName)));

  return (
    <div className="min-h-screen bg-surface">
      <AnnouncementBar modelCount={models.length} />

      <SiteHeader maxWidth="max-w-[1280px]" activePath="/" />

      <main>
        <V8Hero modelCount={models.length} vendors={vendors} />

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
  );
}
