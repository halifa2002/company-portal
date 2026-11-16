import Link from 'next/link';
import { registerUrl } from '@/lib/brand';
import { V8HeroHeadline } from './hero-headline';
import { AddressBar } from './address-bar';
import { RoutingDiagram } from './routing-diagram';
import { TrustStrip } from './trust-strip';
import { Reveal } from './motion';
import { KeyRound } from 'lucide-react';

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
    <section className="relative flex min-h-[calc(100svh-117px)] flex-col overflow-hidden overflow-x-clip">
      {/* 2026-11-16：底部原来有一条 border-b 分割线，星空改深底后那条线在渐变带上很扎眼，去掉 */}
      {/* ---------- 背景 ----------
       * 2026-11-16：星空底图移到页面层（app/preview/home/page.tsx），
       * 从通告条上方一直铺到一屏底，页头与首屏看到的是同一张图。
       * 这里不再画任何底色，section 保持透明。
       */}

      <div className="relative mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-between px-6 pb-9 pt-10 md:pb-12 md:pt-14">
        {/* ---------------- 上：居中三块 ---------------- */}
        <div className="text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[12.5px] text-white/85 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" aria-hidden />
              {props.modelCount} 个模型 · 三协议 · 一个地址
            </span>
          </Reveal>

          <V8HeroHeadline modelCount={props.modelCount} />

          <Reveal delay={220}>
            <p className="mx-auto mt-6 max-w-[52em] text-[16.5px] leading-[1.75] text-white/72 md:text-[17.5px]">
              把接入、计费、用量收进一个网关。换模型只改
              <code className="mx-1 font-mono text-white">model</code>
              字段，SDK 与鉴权都不用动。
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              {/* 主 CTA：悬停时钥匙从左侧滑到右侧（照 teamorouter 的「旋钮」做法），
                  但**不做整体反色** —— 反色会让主按钮变成和次按钮一样的白底细框，
                  鼠标一放上去主次就反转了。这里只让图标让位。
                  left 用 calc 定位到最右：按钮宽 = 内容宽，所以 100% - 图标宽 - 内边距。 */}
              <Link
                href={registerUrl}
                className="group relative inline-flex h-12 items-center justify-center rounded-[4px] bg-white pl-[52px] pr-6 text-[15px] font-medium text-ink transition-[background-color,padding] duration-300 ease-out hover:bg-white/92 hover:pl-6 hover:pr-[52px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
              >
                <span className="absolute left-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-[2px] bg-ink text-white transition-[left] duration-300 ease-out group-hover:left-[calc(100%-2.625rem)]">
                  <KeyRound size={16} strokeWidth={1.9} aria-hidden />
                </span>
                获取 API Key
              </Link>
              <Link
                href="/docs/quickstart"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[4px] border border-white/25 bg-white/10 px-6 text-[15px] font-medium text-white backdrop-blur transition-[border-color,background-color] duration-200 ease-out hover:border-white/55 hover:bg-white/18 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
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
          <div className="py-6 md:py-8">
            <RoutingDiagram />
          </div>
        </Reveal>

        {/* ---------------- 下：能力胶囊 ---------------- */}
        <div className="pt-3">
          <TrustStrip />
        </div>
      </div>
    </section>
  );
}




