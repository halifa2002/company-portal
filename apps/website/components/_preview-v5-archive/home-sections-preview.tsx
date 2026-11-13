import Link from 'next/link';
import { MODEL_CATALOG } from '@/lib/model-catalog';
import { loadModelList } from '@/lib/pricing';
import { registerUrl } from '@/lib/brand';
import { ModelStrip } from './model-strip';
import { Reveal } from './reveal';

/**
 * 首页两段（只给 /preview/home 用）
 *
 * 1) 模型覆盖：左标题 + 右侧入口 + 一行模型卡带
 *    上一版是居中标题，下面再吊一个「浏览模型」按钮，卡片带又自带两个箭头，
 *    同一块里出现三组控件，眼睛不知道该看哪。现在：标题左、按钮右、箭头贴卡片带右上角。
 * 2) 结尾 CTA：全页唯一一块"整幅有颜色"的地方，浅蓝渐变 + 网点，照参考站的收尾做法。
 */

export async function HomeModelSection() {
  const { models } = await loadModelList(MODEL_CATALOG);

  // 只传卡片要显示的字段：组件是客户端的，别把整份价格对象驮过去
  const strip = models.map((model) => ({
    id: model.id,
    name: model.displayName,
    vendor: model.vendorName,
    category: model.category,
    context: model.contextWindow || undefined,
  }));

  return (
    <section className="pv-sec bg-white">
      <div className="pv-wrap">
        <Reveal>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-12">
            <div className="pv-head pv-head--left">
              <span className="pv-eyebrow">模型覆盖</span>
              <h2 className="pv-h2 mt-4">
                这些模型，
                <br />
                一个 Key 全都能调
              </h2>
              <p className="pv-sub">
                覆盖对话、推理、编程与多模态。换模型只改 model 字段，SDK 与鉴权都不用动。单价以价格页为准。
              </p>
            </div>
            <Link href="/models" className="pv-btn pv-btn--primary shrink-0">
              浏览模型
              <span aria-hidden>→</span>
            </Link>
          </div>
        </Reveal>

        {/*
          模型带：这里只回答「有哪些模型」，右侧可以滑动对比。
          价格另设专区（PriceSection，在首屏下面第一块）。
        */}
        <div className="mt-10">
          <ModelStrip models={strip} />
        </div>
      </div>
    </section>
  );
}

export function HomeCtaSection() {
  return (
    <section className="relative overflow-hidden">
      {/* 一块浅蓝渐变 + 网点：全页只有这一处"整块有颜色"，用来收尾 */}
      <div aria-hidden className="pv-band" />

      <div className="relative mx-auto w-full max-w-[720px] px-6 py-24 text-center md:px-8 md:py-28">
        <Reveal>
          <h2 className="pv-h2">现在就能发第一个请求</h2>
          <p className="mx-auto mt-5 max-w-[30em] text-balance text-body leading-[1.8] text-ink-soft">
            注册后拿到 Key，把 base_url 指过来，其余代码不用动。
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href={registerUrl} className="pv-btn pv-btn--primary pv-btn--lg">
              开始使用
              <span aria-hidden className="text-[15px] leading-none">
                →
              </span>
            </Link>
            <Link href="/docs" className="pv-btn pv-btn--ghost pv-btn--lg">
              查看文档
            </Link>
          </div>

          {/* 一行信任小字：把"要不要先充钱"这个顾虑直接答掉 */}
          <p className="mt-9 text-meta tracking-wide text-ink-muted">
            按量计费 · 无最低消费 · 余额随时充 · 每一笔都能对到具体请求
          </p>
        </Reveal>
      </div>
    </section>
  );
}
