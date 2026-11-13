import Link from 'next/link';
import { MODEL_CATALOG } from '@/lib/model-catalog';
import { loadModelList } from '@/lib/pricing';
import { PriceCards } from './price-cards';
import { Reveal } from './reveal';

/**
 * 模型价格专区（2026-11-13 第四版）
 *
 * 首屏下面第一块，回答「多少钱」。
 *
 * 这一版把标题从「居中」改成「左标题 + 右侧出口」：
 * 上一版每一段都是居中头，连着七段一模一样的开法，读到第三段就不看标题了。
 * 这一段本身带一个「看完整价格表」的出口，出口就该在标题右边，
 * 而不是压在说明文字下面当第三条链接。
 *
 * 底色换成浅蓝灰（.pv-tint）：白底首屏下面立刻换一档，
 * 页面从这一块开始"有分区"，不再是一张白纸铺到底。
 */
export async function PriceSection() {
  const { models } = await loadModelList(MODEL_CATALOG);

  return (
    <section className="pv-sec pv-tint">
      <div className="pv-wrap">
        <Reveal>
          <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between md:gap-12">
            <div className="pv-head pv-head--left">
              <span className="pv-eyebrow">模型价格</span>
              <h2 className="pv-h2 mt-4">模型价格，按量结算</h2>
              <p className="pv-sub">
                单价按百万 tokens 计，后台改价这一块跟着变，不用重新发版。列表里没有的模型直接找我们开。
              </p>
            </div>

            <Link href="/pricing" className="pv-btn pv-btn--ghost shrink-0">
              查看完整价格表
              <span aria-hidden>→</span>
            </Link>
          </div>
        </Reveal>

        <Reveal className="mt-10">
          <PriceCards models={models.slice(0, 6)} />
        </Reveal>

        {/* 底部一条：企业客户入口。跟卡片同宽、同圆角，收得干净 */}
        <Link
          href="/partner"
          className="group mt-3 flex items-center justify-between rounded-[6px] border border-[#e3eaf2] bg-white px-5 py-4 text-body text-ink-mid transition-colors hover:border-[#c9d9e8] hover:text-ink"
        >
          <span>企业客户？可以谈年度采购价与专属折扣</span>
          <span
            aria-hidden
            className="text-ink-muted transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-brand"
          >
            →
          </span>
        </Link>
      </div>
    </section>
  );
}
