import Link from 'next/link';
import { consoleUrl } from '@/lib/brand';

/**
 * 转化带（2026-11-15 第十六版：收进蓝族）。
 *
 * 上一版用生图水彩天空（band-canvas-7.webp）当底，注释里写「杏橘是图里的光、
 * 不进 UI 色板」——但页面像素实测右缘是 #7deff8（色相 184°，青绿），
 * 已经跑到品牌蓝（#188df9 = 205°）的隔壁色相，整页最亮最饱和的一块就在这条带上。
 * 结论：**图片里的颜色读者会看见，注释管不住它**。
 *
 * 这一版改用收尾 CTA 的同一张云图 + 深海军蓝压层（.band-canvas），
 * 和底部 CTA、页脚同族：深色在页面上成了「段落收口」，不再是一块孤立的青绿横条。
 *
 * 版式同时收规矩：
 *   - 主按钮不再用「白方块箭头 + 深底」的拼接件（那个 40px 白格子像漏出来的控件），
 *     改成和收尾 CTA 一致的实心白按钮 + 文字后一个箭头；
 *   - 副按钮从「实心白底」改成描边（两个实心按钮并排会抢），
 *   - 步骤行原来的 11.5px 裸值改回 text-meta 档（全站只有 6 档界面字号）。
 */

const STEPS = ['注册并拿到 Key', '换地址与密钥', '沿用原代码调用'];

export function QuickStart() {
  return (
    <section className="relative overflow-hidden">
      {/* 底色：深海军蓝 + 云图（见 globals.css 的 .band-canvas） */}
      <div className="band-canvas pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative mx-auto w-full max-w-[1280px] px-6 py-10 md:px-10 md:py-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          {/* 左：标题 + 一句说明 + 三步 */}
          <div className="max-w-[34em]">
            <h2
              className="text-balance font-bold tracking-tight text-white"
              style={{ fontSize: 'clamp(22px, 2.3vw, 32px)', lineHeight: 1.2 }}
            >
              按 token 计费，<span className="text-brand-200">用多少扣多少</span>
            </h2>
            <p className="mt-2 text-meta leading-relaxed text-white/85">
              输入、输出与缓存命中分别计价；余额不足直接拒绝，不产生欠费。人民币计价，无最低消费。
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-meta text-white/70">
              {STEPS.map((step, index) => (
                <span key={step} className="flex items-center gap-1.5">
                  <span>{step}</span>
                  {index < STEPS.length - 1 && <span aria-hidden className="text-white/40">→</span>}
                </span>
              ))}
            </p>
          </div>

          {/* 右：两个按钮（主＝实心白，次＝白描边；与收尾 CTA 用同一套按钮形态） */}
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <Link
              href={`${consoleUrl}/wallet`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[4px] bg-white px-5 text-note font-medium text-ink transition-colors hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300"
            >
              购买额度
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/docs/quickstart"
              className="inline-flex h-11 items-center justify-center rounded-[4px] border border-white/35 px-5 text-note font-medium text-white transition-colors hover:border-white/70 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300"
            >
              快速接入
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
