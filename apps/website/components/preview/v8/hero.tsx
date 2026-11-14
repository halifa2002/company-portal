import Link from 'next/link';
import { registerUrl } from '@/lib/brand';
import { V8HeroHeadline } from './hero-headline';
import { AddressBar } from './address-bar';
import { RoutingDiagram } from './routing-diagram';
import { TrustStrip } from './trust-strip';
import { Reveal } from './motion';

/**
 * v8 首屏（v9，2026-11-14：居中单焦点 + 蓝族网格背景 + 一张路由图）
 *
 * 上一版的问题（对着 teamorouter / fireworks 逐像素比过）：左对齐标题 + 右侧浮按钮
 * 有两个对齐轴；背景是一条竖直浅蓝渐变，饱和度只有 0.089，等于没有颜色；
 * 亮度 246→254→231，中间反而更白，首屏四分之三是白纸；
 * 视觉主体是一个 BASE URL 表单卡——控件有用但平，首屏缺的是**画面**。
 *
 * 这一版按「teamorouter 定骨架、fireworks 定质感」来：
 *   - 骨架（学 teamorouter）：居中一句大标题 → 一对按钮 → 一行地址条 → 一张路由图 → 一行能力胶囊。
 *     首屏从 5 块减到 3 块 + 2 个附属件，地址条从四层大卡压成 44px 一行。
 *   - 质感（学 fireworks）：多中心网格渐变 + 变径网点 + 颗粒噪点。
 *
 * ★ 配色纪律（C-V-03 / C-S-03）：**全站强调色只有一个色相 = 蓝**。
 *   这一版曾试过「暖白→暖橙」的暖色背景，观感确实更"贵"，但它引入了第二个色相，
 *   违反 C-V-03（橙不得作强调色）；已撤回。层次改由**明度与位置**做：
 *   顶部主光、左上淡雾、右上第二团、底部下沉色 + 颗粒，全在同一蓝族里。
 *   色值只写在 app/globals.css 的 .hero-canvas / .hero-grain 里（C-S-02），
 *   组件这里只引用类名，一个裸 hex 都没有。
 *
 * 不抄的两样：折扣角标（后端只有 model_ratio，没有官方原价，编出来就是假话）、
 * teamorouter 那种高饱和整屏橙光（它实测平均饱和度 0.209，读起来像营销页）。
 *
 * 数字纪律不变：模型数是后端 /api/pricing 的真实值。
 */
export function V8Hero(props: { modelCount: number; vendors: string[] }) {
  return (
    <section className="relative overflow-hidden overflow-x-clip border-b border-line">
      {/* ---------- 背景层（两层）----------
       * ① .hero-canvas  湍流云底图（scripts/gen-hero-canvas.py 生成：两级域扭曲 + fbm，
       *    形状是翻卷的烟云，不是同心圆；明度下限按文字区钳制，保证 4.5:1）
       * ② .hero-grain   极细颗粒（fractalNoise，multiply），补高频，防止大色块接缝发塑料
       *
       * 2026-11-14 淘汰了中间那层「波涛网点」：用正弦调制点径做的贴图，平铺后是**斜向条带**，
       * 远看像纱窗/摩尔纹，压在卡片上也干扰阅读——要肌理，宁可把噪点烘进底图，不要铺一层有方向的图案。
       */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="hero-canvas absolute inset-0" />
        <div className="hero-grain absolute inset-0" />
      </div>

      <div className="relative mx-auto w-full max-w-[1280px] px-6 md:px-10">
        {/* ---------------- 上：居中三块 ---------------- */}
        <div className="pb-10 pt-14 text-center md:pb-12 md:pt-20">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-3.5 py-1.5 text-[12.5px] text-ink-mid backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden />
              {props.modelCount} 个模型 · 三协议 · 一个地址
            </span>
          </Reveal>

          <V8HeroHeadline modelCount={props.modelCount} />

          <Reveal delay={220}>
            <p className="mx-auto mt-6 max-w-[52em] text-[16.5px] leading-[1.75] text-ink-mid md:text-[17.5px]">
              把接入、计费、用量收进一个网关。换模型只改
              <code className="mx-1 font-mono text-ink">model</code>
              字段，SDK 与鉴权都不用动。
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={registerUrl}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[4px] bg-ink px-6 text-[15px] font-medium text-white transition-colors hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <circle cx="8" cy="15" r="4" />
                  <path d="m10.8 12.2 8.2-8.2M15.5 4.5 19 8" />
                </svg>
                获取 API Key
              </Link>
              <Link
                href="/docs/quickstart"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[4px] border border-ink/15 bg-white/80 px-6 text-[15px] font-medium text-ink backdrop-blur transition-colors hover:border-ink/35 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              >
                查看接入文档
              </Link>
            </div>
          </Reveal>

          <Reveal delay={380}>
            <div className="mx-auto mt-7 max-w-[620px]">
              <AddressBar />
            </div>
          </Reveal>
        </div>

        {/* ---------------- 中：路由图（首屏的画面） ---------------- */}
        <Reveal delay={120}>
          <div className="pb-10">
            <RoutingDiagram vendors={props.vendors} />
          </div>
        </Reveal>

        {/* ---------------- 下：能力胶囊 ---------------- */}
        <div className="pb-12 md:pb-16">
          <TrustStrip />
        </div>
      </div>
    </section>
  );
}




