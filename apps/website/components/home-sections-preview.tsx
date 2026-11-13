import Link from 'next/link';
import { MODEL_CATALOG } from '@/lib/model-catalog';
import { loadModelList } from '@/lib/pricing';
import { registerUrl } from '@/lib/brand';
import { ModelStrip } from '@/components/model-strip';
import { Reveal } from '@/components/reveal';

/**
 * 首页两段「待定」板块（只给 /preview/home 用）
 *
 * 1) 模型覆盖：左边一句大标题，右边一句说�?+ 一个按钮，下面一横排模型卡�? *    卡片�?ModelStrip（客户端），因为它要左右翻页�? *    卡片上没有价格——后端倍率仍是占位值，写上去等于报假价（文�?4.1）�? * 2) 结尾 CTA：白卡落在靛蓝光晕上，跟首屏底部呼应�? */

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
    /*
     * 模型带是全页第二处「整块颜色」：夹在两步白色之间�?     * 往下是问答白段，形�?�?�?�?�?�?的收尾节奏�?     */
    <section className="border-b border-brand/10 bg-brand-100 py-24 md:py-32">
      <div className="mx-auto w-full max-w-[1600px] px-6 2xl:px-10">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-start md:gap-16">
          {/* 左：大标题。不做居中——这页别的区块已经全是居中标题，这一段错开才有节奏 */}
          <h2
            className="font-display font-normal leading-[1.18] tracking-[-0.015em] text-ink"
            style={{ fontSize: 'clamp(26px, 2.4vw, 38px)' }}
          >
            这些模型，            <br />
            一个 Key 全都能调
          </h2>

          <div className="md:pt-3">
            <p className="max-w-md text-body leading-relaxed text-ink-mid">
              覆盖对话、推理、编程与多模态。换模型只改 model
              字段，SDK 与鉴权都不用动。单价以价格页为准。            </p>
            <Link
              href="/models"
              className="mt-7 inline-flex items-center gap-2.5 bg-[#06223f] px-6 py-3 text-body font-medium text-white transition-colors duration-200 hover:bg-[#0a3257]"
            >
              浏览模型
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        {/*
          模型带收在跟标题同一个容器里，左右留白——不贴边�?          铺满整屏试过一版，参考站其实是把卡片放大、缝留松，不是把框拆掉；
          而且卡片顶到屏幕边上，页面看着被撑开、不像一块整版�?        */}
        <div className="mt-10">
          <ModelStrip models={strip} />
        </div>
      </div>
    </section>
  );
}

export function HomeCtaSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      {/*
        光带（2026-11-13 重做）：参考那种"右侧打光"的收尾做法，但颜色换成我们自己的。
        三层叠出来的，不是一张图：
        1) 右上一个大径向光（暖色），模拟侧光从右上方打过来；
        2) 左侧一个冷色径向光，压住左边不让它发白；
        3) 底下一层竖向渐变兜底，避免两个径向光之间出现断层。
        最上面再压一层极淡的颗粒，消掉渐变的色带。
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(72% 155% at 103% 50%, rgba(255,124,72,0.94) 0%, rgba(255,150,104,0.58) 26%, rgba(255,190,152,0.20) 48%, rgba(255,255,255,0) 70%), radial-gradient(70% 150% at -3% 50%, rgba(13,90,180,0.90) 0%, rgba(37,99,201,0.52) 26%, rgba(120,170,235,0.18) 50%, rgba(255,255,255,0) 72%), radial-gradient(52% 125% at 50% 46%, rgba(203,160,240,0.55) 0%, rgba(240,205,235,0.28) 44%, rgba(255,255,255,0) 72%), linear-gradient(90deg, #e3edff 0%, #ebe0f9 28%, #f8e4ef 50%, #ffdcc0 74%, #ffc49c 100%)',
        }}
      />
      {/*
        两层噪声（2026-11-13）：参考站那条光带看着"有质感"，不是因为渐变复杂，
        是因为它下面压了一粗一细两层噪声——
        ① 低频那层像云：让颜色出现浓淡不均，光才像"从某处漫过来"，而不是一条均匀的过渡；
        ② 高频那层是颗粒：磨掉渐变色带（banding），近看有印刷品的糙感。
        只有高频颗粒的话，颜色还是平板，只是变糙了。
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-soft-light"
        style={{
          opacity: 0.55,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='420' height='420'%3E%3Cfilter id='c'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='4'/%3E%3C/filter%3E%3Crect width='420' height='420' filter='url(%23c)'/%3E%3C/svg%3E\")",
          backgroundSize: '420px 420px',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-overlay"
        style={{
          opacity: 0.16,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23g)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative mx-auto w-full max-w-[860px] px-6 text-center">
        <Reveal>
          {/*
            2026-11-13 第三次改：去掉卡片，内容直接铺在光带上。
            卡片的问题是"一块深色浮在浅色上"，怎么修都像贴纸；参考站的做法是让这一段
            本身成为一块色，文字直接坐上去。所以只剩背景 + 文字 + 一颗小按钮。
            按钮按 iOS 的规格：小、圆角胶囊、实色、按压时轻微缩小。
          */}
          <h2
            className="text-balance font-display font-normal tracking-[-0.02em] text-ink"
            style={{ fontSize: 'clamp(34px, 3.9vw, 54px)' }}
          >
            现在就能发第一个请求
          </h2>
          <p className="mx-auto mt-5 max-w-[32em] text-balance text-body leading-[1.8] text-ink-soft">
            注册后拿到 Key，把 base_url 指过来，其余代码不用动。
          </p>

          <div className="mt-10 flex flex-wrap items-stretch justify-center gap-3">
            {/*
              按钮照参考站的做法：直角、分块拼接。
              左边一块白底只装箭头，右边一块深底装文字，中间不留缝——
              这比圆角胶囊"硬"，也更像印刷品里那种标签夹。
              圆角在这个页面到处都是，这一段故意全直角，才立得出来。
            */}
            <Link
              href={registerUrl}
              className="group inline-flex h-[52px] items-stretch border border-[#06223f] transition-transform duration-200 active:translate-y-px"
            >
              <span className="flex w-[52px] items-center justify-center bg-white text-ink transition-colors duration-200 group-hover:bg-brand-50">
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
                  →
                </span>
              </span>
              <span className="flex items-center bg-[#06223f] px-6 text-body font-medium text-white transition-colors duration-200 group-hover:bg-[#0a3257]">
                开始使用
              </span>
            </Link>
            <Link
              href="/docs"
              className="inline-flex h-[52px] items-center border border-ink/25 px-6 text-body font-medium text-ink transition-colors duration-200 hover:border-ink/50 hover:bg-white/50"
            >
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